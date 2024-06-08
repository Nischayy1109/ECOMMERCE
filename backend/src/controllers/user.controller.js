import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import 'dotenv/config';
import mongoose from "mongoose";
import nodeMailer from "nodemailer";
import otpGenerator from 'otp-generator';
import { sendEmail } from '../utils/sendEmail.js';


// const registerUser=asyncHandler(async(req,res)=>{
//     res.status(200).json({
//         message:"User registered successfully"
//     })
// })
const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        //now saving this refresh token into the db
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})//this valdiatebeforesave is used to remove the validations that mongoose does before inserting into db(eg password required while inserting data)
        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}


const options={
    httpOnly:true,
    secure:true
}
const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exists:check username and email
    //check for images, check for avatar
    //upload them to cloudinary,avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return res else return err response
    const { fullName, email,phone, username, password } = req.body;
    

    if ([fullName, email,phone, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    if(phone.length!==10){
        throw new ApiError(400,"Enter valid phone number")
    }

    // console.log('Uploaded file:', req.file); // Debug statement

    let coverImage = "";
    if (req.file) {
        try {
            coverImage = await uploadOnCloudinary(req.file.path);
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw new ApiError(500, "Error uploading image to Cloudinary");
        }
    }

    const user = await User.create({
        fullName,
        coverImage: coverImage?.url || "",
        phone,
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "USER REGISTERED SUCCESSFULLY")
    );
});
const sendVerificationEmail = asyncHandler(async (req, res) => {
    const userID=req.user._id;
    const user=await User.findById(userID);
    console.log(user);
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

    // Encode OTP using JWT
    const encodedOtp = jwt.sign({ otp }, process.env.JWT_SECRET, { expiresIn: '5m' });

    // Send OTP via email
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
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

const verifyUser = asyncHandler(async (req, res) => {
    const {otp} = req.body;
    const userId = req.user._id;

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

    
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    user.isVerified = true;
    await user.save();

    res.clearCookie('otp');

    res.status(200).json(new ApiResponse(200, {}, 'User verified successfully'));

});

const loginUser=asyncHandler(async(req,res)=>{
    //get user details from fronten
    //check if user exists
    //find user in database
    //check password is correct
    //generate access and refresh token and send to user

    const {email,username,password}=req.body;

    if(!email && !username){
        throw new ApiError(400,"Email or username is required")
    }
    if(!password){
        throw new ApiError(400,"Password is required")
    }
    const user=await User.findOne({
        $or:[{email},{username}]
    });
    if(!user){
        throw new ApiError(404,"User not found")
    }
    const isPasswordMatch=await user.isPasswordCorrect(password);
    if(!isPasswordMatch){
        throw new ApiError(401,"Incorrect password")
    }
    const {accessToken, refreshToken}=await generateAccessAndRefreshTokens(user._id);

    const loggedInUser=await User.findById(user._id).select("-password -refresh")

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    const user=await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:""
            },
        },
        {new:true}
    )
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    //clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
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
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
        if(incomingRefreshToken!==user.refreshToken){
            throw new ApiError(401,"Refresh token is invalid or expired")
        }
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
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

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    //get user id from req.user_id
    //check the current passowrd entered by user
    //take the new password
    //update the password in db
    //return res with success message

    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user._id);
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Incorrect password")
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    const { accessToken, refreshToken }=generateAccessAndRefreshTokens(user._id);

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

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

// const updateEmail=asyncHandler(async(req,res)=>{
//     //get user id from req.user._id
//     //get new email from req.body
//     //chekc if email is already exists in dn
//     //upadte email in db
//     //return res with success message
//     const {newEmail,password}=req.body;

//     if(!newEmail){
//         throw new ApiError(400,"Email is required")
//     }
//     const user=await User.findById(req.user._id);
    
//     if(newEmail===user.email){
//         throw new ApiError(400,"Enter new Email")
//     }
    
//     const emailExists=await User.findOne({newEmail});
//     if(emailExists){
//         throw new ApiError(409,"Email already exists")
//     }
//     user.email=newEmail;

//     const isPasswordCorrect=await user.isPasswordCorrect(password);
//     if(!isPasswordCorrect){
//         throw new ApiError(401,"Incorrect password")
//     }
//     await user.save({validateBeforeSave:false});
//     return res.status(200)
//     .json(
//         new ApiResponse(200,user,"Email updated successfully")
//     )

// })

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
    const user=await User.findById(req.user._id);
    user.phone=newPhone;
    await user.save({validateBeforeSave:false});
    return res.status(200)
    .json(
        new ApiResponse(200,user,"Phone updated successfully")
    )

})

const updateCoverImage=asyncHandler(async(req,res)=>{
    //get user id from req.user._id
    //check for image
    //upload image to cloudinary
    //update cover image in db
    //return res with success message
    const user=await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    let coverImage="";
    console.log(req.file);
    if(req.file){
        try {
            coverImage=await uploadOnCloudinary(req.file.path)
            if(!coverImage) throw new ApiError(500,"Error uploading image to cloudinary")
            user.coverImage=coverImage.url;
            await user.save({validateBeforeSave:false})
            return res.status(200).json(new ApiResponse(200,coverImage,"Cover Image updated successfully"))
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw new ApiError(500, "Error uploading image to Cloudinary");
        }
    }
})

const requestEmailUpdate = asyncHandler(async (req, res) => {
    const { newEmail } = req.body;
    const userId = req.user._id;

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

const verifyAndUpdateEmail = asyncHandler(async (req, res) => {
    const { newEmail,otp } = req.body;
    const userId = req.user._id;

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

    
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    
    user.email = newEmail;
    await user.save();

    res.clearCookie('otp');

    res.status(200).json(new ApiResponse(200, {}, 'Email updated successfully'));
});



export { registerUser,
    loginUser,
    sendVerificationEmail,
    verifyUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updatePhone,
    updateCoverImage,
    requestEmailUpdate,
    verifyAndUpdateEmail
 }