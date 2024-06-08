import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from '../models/user.models.js';

export const verifyisAdmin=asyncHandler(async(req,res,next)=>{
    const userId=req.user?._id;
    if(!userId) return next(new ApiError(400,"Unauthorized access"))

    const user=await User.findById(userId);
    if(!user) return next(new ApiError(404,"User not found"));
    if(!user.isAdmin) return next(new ApiError(400,"User is not admin"))

    next();
})
