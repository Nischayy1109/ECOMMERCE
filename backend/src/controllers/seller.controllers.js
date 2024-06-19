import { Seller } from "../models/seller.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
import 'dotenv/config';
import mongoose from "mongoose";
import nodeMailer from "nodemailer";
import otpGenerator from 'otp-generator';
import { sendEmail } from '../utils/sendEmail.js';


const generateAccessAndRefreshTokens=async(sellerId)=>{
    try{
        const seller=await Seller.findById(sellerId)
        const accessToken=seller.generateAccessToken()
        const refreshToken=seller.generateRefreshToken()

        //now saving this refresh token into the db
        seller.sellerRefreshToken=refreshToken
        await seller.save({validateBeforeSave:false})//this valdiatebeforesave is used to remove the validations that mongoose does before inserting into db(eg password required while inserting data)
        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const options={
    httpOnly:true,
    secure:true
}

const registerSeller = asyncHandler(async (req, res) => {
    const { sellerName, sellerEmail, sellerPhone, sellerAddress, sellerPassword, sellerGST, sellerUsername } = req.body;

    if([sellerName,sellerEmail,sellerPhone,sellerAddress,sellerPassword,sellerGST,sellerUsername].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const existedSeller = await Seller.findOne({ $or: [{ sellerEmail }, { sellerUsername }] });

    if (existedSeller) {
        throw new ApiError(400, "Seller already existed");
    }

    if(sellerPhone.length !== 10){
        throw new ApiError(400, "Invalid phone number")
    }

    let sellerImage=""
    if(req.file){
        try {
            sellerImage=await uploadOnCloudinary(req.file.path)
        } catch (error) {
            console.log(error)
            throw new ApiError(500, "Image upload failed")
        }
    }

    const seller = await Seller.create({
        sellerName,
        sellerEmail,
        sellerPhone,
        sellerAddress,
        sellerImage:sellerImage?.url || "",
        sellerPassword,
        sellerGST,
        sellerUsername:sellerUsername.toLowerCase()
    });

    const createdSeller = await Seller.findById(seller._id).select("-sellerPassword -sellerRefreshToken");
    if(!createdSeller){
        throw new ApiError(500, "Seller not created")
    }

    return res.status(201).json(new ApiResponse(201, { seller: createdSeller }, "Seller registered successfully"));
})

const sendVerificationEmailSeller = asyncHandler(async (req, res) => {
    const sellerID=req.seller._id;
    console.log("selllll",sellerID);
    const seller=await Seller.findById(sellerID);
    console.log(seller);
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

    // Encode OTP using JWT
    const encodedOtp = jwt.sign({ otp }, process.env.JWT_SECRET, { expiresIn: '5m' });

    // Send OTP via email
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: seller.sellerEmail,
        subject: 'Your OTP Code ',
        text: `Your OTP code to Verify your account is ${otp}`,
    };
    console.log(mailOptions);
    const emailSent = await sendEmail(mailOptions);
    if (!emailSent) {
        throw new ApiError(500, 'Failed to send verification email');
    }

    res.cookie('otp', encodedOtp, { httpOnly: true, expires: new Date(Date.now() + 5 * 60 * 1000) });
    res.status(200).json(new ApiResponse(200, {}, 'OTP sent to you registered email address'));

});

const verifyingSeller = asyncHandler(async (req, res) => {
    const {otp} = req.body;
    console.log("otp",otp);
    const sellerId = req.seller._id;

    // Decode the OTP from the cookie
    const encodedOtp = req.cookies.otp;
    if (!encodedOtp) {
        throw new ApiError(400, 'OTP not found');
    }

    let decodedOtp;
    try {
        decodedOtp = jwt.verify(encodedOtp, process.env.JWT_SECRET);
    } catch (err) {
        throw new ApiError(400, 'Invalid OTP');
    }

    
    if (decodedOtp.otp !== otp) {
        throw new ApiError(400, 'Invalid OTP');
    }

    
    const seller = await Seller.findById(sellerId);
    if (!seller) {
        throw new ApiError(404, 'seller not found');
    }
    seller.sellerVerified = true;
    await seller.save();

    res.clearCookie('otp');

    res.status(200).json(new ApiResponse(200, {}, 'Seller verified successfully'));

});
const loginSeller = asyncHandler(async (req, res) => {
    const {sellerEmail,sellerUsername,sellerPassword}=req.body;

    if(!sellerEmail && !sellerUsername){
        throw new ApiError(400,"Email or username is required")
    }
    if(!sellerPassword){
        throw new ApiError(400,"Password is required")
    }
    const seller=await Seller.findOne({
        $or:[{sellerEmail},{sellerUsername}]
    });

    if(!seller){
        throw new ApiError(404,"Seller not found")
    }
    const isPasswordMatch=await seller.isPasswordCorrect(sellerPassword);
    if(!isPasswordMatch){
        throw new ApiError(401,"Incorrect password")
    }
    const {accessToken, refreshToken}=await generateAccessAndRefreshTokens(seller._id);
    console.log("accesstoken",accessToken,"refreshToken",refreshToken)
    const loggedInSeller=await Seller.findById(seller._id).select("-sellerPassword -sellerRefreshToken");

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .cookie("sellerVerified",loggedInSeller.sellerVerified,options)
    .json(
        new ApiResponse(
            200,
            {
                seller:loggedInSeller,
                accessToken,
                refreshToken
            },
            "Seller logged in successfully"
        )
    )
})

const logoutSeller = asyncHandler(async (req, res) => {
    const seller=await Seller.findByIdAndUpdate(
        req.seller._id,{
            $set:{
                sellerRefreshToken:""
            },
        },
        {new:true}
    )
    if (!seller) {
        throw new ApiError(404, "User not found");
    }
    //clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(new ApiResponse(200, {}, "Seller logged out successfully"));
})


//refresh access token after its expiry
const refreshAccessToken=asyncHandler(async(req,res)=>{
    //get refresh token from user
    //verify refresh token
    //get user id
    //generate new access token
    //send new access token
    //send new refresh token
    const incomingRefreshToken=req.cookies?.refreshToken || req.body.refreshToken;//here req.body because cookies might not be available in all cases eg mobile browsers so we read it from frontend
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unathorized refresh token")
    }
    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const seller=await Seller.findById(decodedToken?._id)
        if(!seller){
            throw new ApiError(401,"Invalid Refresh Token")
        }
        if(incomingRefreshToken!==seller.sellerRefreshToken){
            throw new ApiError(401,"Refresh token is invalid or expired")
        }
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(seller._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken:newRefreshToken
                },
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error.message ||"Inavalid refresh token")
    }
})

const getCurrentSeller = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.seller._id).select("-sellerPassword -sellerRefreshToken");
    console.log("SLLL",seller)
    return res.status(200).json(new ApiResponse(200,seller,"current seller fetched successfully"))
    
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    //get user id from req.user_id
    //check the current passowrd entered by user
    //take the new password
    //update the password in db
    //return res with success message

    const {oldPassword,newPassword}=req.body;
    const seller=await Seller.findById(req.seller._id);
    const isPasswordCorrect= await seller.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Incorrect password")
    }
    seller.sellerPassword=newPassword;
    await seller.save({validateBeforeSave:false});

    const { accessToken, refreshToken }=generateAccessAndRefreshTokens(seller._id);

    // Clear old cookies and set new ones after changing the password
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    // user.refreshToken = refreshToken;

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
})

const updatePhone=asyncHandler(async(req,res)=>{
    //get user id from req.user._id
    //get new phone from req.body
    //update phone in db
    //return res with success message
    const {newPhone}=req.body;
    if(!newPhone){
        throw new ApiError(400,"Phone is required")
    }
    if(newPhone.length!==10){
        throw new ApiError(400,"Enter valid phone number")
    }
    const seller=await Seller.findById(req.seller._id);
    seller.sellerPhone=newPhone;
    await seller.save({validateBeforeSave:false});
    return res.status(200)
    .json(
        new ApiResponse(200,seller,"Phone updated successfully")
    )

})

const updateAddress=asyncHandler(async(req,res)=>{
    //get user id from req.user._id
    //get new address from req.body
    //update address in db
    //return res with success message
    const {newAddress}=req.body;
    if(!newAddress){
        throw new ApiError(400,"Address is required")
    }
    const seller=await Seller.findById(req.seller._id);
    seller.sellerAddress=newAddress;
    await seller.save({validateBeforeSave:false});
    return res.status(200)
    .json(
        new ApiResponse(200,seller,"Address updated successfully")
    )
})

const updateCoverImageSeller=asyncHandler(async(req,res)=>{
    //get user id from req.user._id
    //check for image
    //upload image to cloudinary
    //update cover image in db
    //return res with success message
    const seller=await Seller.findById(req.seller._id);

    if (!seller) {
        throw new ApiError(404, "Seller not found");
    }
    let coverImageSeller="";
    console.log(req.file);
    if(req.file){
        try {
            coverImageSeller=await uploadOnCloudinary(req.file.path)
            if(!coverImageSeller) throw new ApiError(500,"Error uploading image to cloudinary")
            seller.sellerImage=coverImageSeller.url;
            await seller.save({validateBeforeSave:false})
            return res.status(200).json(new ApiResponse(200,coverImageSeller,"Cover Image updated successfully"))
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw new ApiError(500, "Error uploading image to Cloudinary");
        }
    }
})

const deleteSeller=asyncHandler(async(req,res)=>{
    //get user id from req.user._id
    //delete user from db
    //return res with success message
    const seller = await Seller.findById(req.seller._id);
    if(!seller) throw new ApiError(404,"Seller not found")

    const deletedSeller=await Seller.findByIdAndDelete(req.seller._id);
    if(!deletedSeller){
        throw new ApiError(404,"Error in deleting seller")
    }
    return res.status(200).json(new ApiResponse(200,{},"Seller deleted successfully"))
})

const requestEmailUpdateSeller = asyncHandler(async (req, res) => {
    const { newEmail } = req.body;
    const sellerId = req.seller._id;

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

    // Encode OTP using JWT
    const encodedOtp = jwt.sign({ otp }, process.env.JWT_SECRET, { expiresIn: '5m' });

    // Send OTP via email
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: newEmail,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    };

    const emailSent = await sendEmail(mailOptions);
    if (!emailSent) {
        throw new ApiError(500, 'Failed to send OTP email');
    }

    res.cookie('otp', encodedOtp, { httpOnly: true, expires: new Date(Date.now() + 5 * 60 * 1000) });
    res.status(200).json(new ApiResponse(200, {}, 'OTP sent to new email address'));
});

const verifyAndUpdateEmailSeller = asyncHandler(async (req, res) => {
    const { newEmail,otp } = req.body;
    const sellerId = req.seller._id;

    // Decode the OTP from the cookie
    const encodedOtp = req.cookies.otp;
    if (!encodedOtp) {
        throw new ApiError(400, 'OTP not found');
    }

    // Verify the OTP using JWT
    let decodedOtp;
    try {
        decodedOtp = jwt.verify(encodedOtp, process.env.JWT_SECRET);
    } catch (err) {
        throw new ApiError(400, 'Invalid OTP');
    }

    
    if (decodedOtp.otp !== otp) {
        throw new ApiError(400, 'Invalid OTP');
    }

    
    const seller = await Seller.findById(sellerId);
    if (!seller) {
        throw new ApiError(404, 'Seller not found');
    }

    
    seller.sellerEmail = newEmail;
    await seller.save();

    res.clearCookie('otp');

    res.status(200).json(new ApiResponse(200, {}, 'Email updated successfully'));
});

const getAllSellers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, seller = "" } = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { sellerName: 1 } // Sorting by seller name in ascending order
    };

    const matchStage = seller ? {
        $match: {
            sellerName: { $regex: seller, $options: "i" } // Case-insensitive search
        }
    } : {};

    const pipeline = [
        matchStage,
        {
            $project: {
                sellerName: 1,
                sellerEmail: 1,
                sellerPhone: 1,
                sellerAddress: 1,
                sellerImage: 1,
                sellerVerified: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ].filter(stage => Object.keys(stage).length !== 0); // Removing empty stages

    const aggregate = Seller.aggregate(pipeline);
    const sellers = await Seller.aggregatePaginate(aggregate, options);

    if (!sellers) {
        throw new ApiError(404, "No sellers found");
    }

    return res.status(200).json(new ApiResponse(200, sellers, "Sellers found"));
})

const getSellerById = asyncHandler(async (req, res) => {
    const {sellerId} = req.params;
    if(!sellerId) throw new ApiError(400,"Seller ID is required")

    const seller = await Seller.findById(sellerId).select("-sellerPassword -sellerRefreshToken");

    if(!seller) throw new ApiError(404,"Seller not found")

    return res.status(200).json(new ApiResponse(200, seller, "Seller found"));
})

export {
    registerSeller,
    loginSeller,
    logoutSeller,
    getCurrentSeller,
    refreshAccessToken,
    changeCurrentPassword,
    updatePhone,
    updateAddress,
    updateCoverImageSeller,
    deleteSeller,
    getAllSellers,
    getSellerById,
    verifyingSeller,
    sendVerificationEmailSeller,
    requestEmailUpdateSeller,
    verifyAndUpdateEmailSeller,
}