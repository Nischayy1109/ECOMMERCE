
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { Seller } from '../models/seller.models.js';

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer","")
        if(!token){
            throw new ApiError(401,"Unauthorized Request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid access token")
        }
    
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }

})

export const verifyJWTforSeller=asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer","")
        if(!token){
            throw new ApiError(401,"Unauthorized Request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const seller = await Seller.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!seller){
            throw new ApiError(401,"Invalid access token")
        }
    
        req.seller=seller;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})

export const verifySeller=asyncHandler(async(req,res,next)=>{

    if(!req.seller.isVerified) throw new ApiError(400,"Seller is not verified")
    
    next();
})
