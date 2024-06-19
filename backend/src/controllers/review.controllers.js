import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from '../models/product.models.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {Review} from "../models/review.models.js"


const updateProductRating = async (productId) => {
    const reviews = await Review.find({ productId: productId });
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, { rating: averageRating });
};

const postReview = asyncHandler(async (req, res) => {
    const {productId} = req.params;
    const {comment, rating} = req.body;

    if(!comment || !comment.trim()===0) throw new ApiError(400, "Comment is required")

    if(!rating || rating<1 || rating>5) throw new ApiError(400, "Rating is required and must be between 1 and 5")

    const product = await Product.findById(productId)
    if(!product) throw new ApiError(404, "Product not found")

    const existingReview = await Review.findOne({productId, userId: req.user._id})
    if(existingReview) throw new ApiError(400, "You have already reviewed this product once and you can't review it again")

    let reviewImage=""
    if(req.file){
        try {
            reviewImage = await uploadOnCloudinary(req.file.path)
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw new ApiError(500, "Error uploading image to Cloudinary");
        }
    }else{
        throw new ApiError(400, "Review image is required")
    }

    const review = await Review.create({
        productId,
        userId: req.user._id,
        comment,
        rating,
        reviewImage:reviewImage?.url || ""
    })

    await updateProductRating(productId);

    if(!review) throw new ApiError(500, "Error creating review")
    return res.status(201).json(new ApiResponse(201, review, "Review posted successfully"))

})    

const updateReview = asyncHandler(async (req, res) => {
    const {reviewId} = req.params
    const {comment,rating} = req.body
    //console.log(reviewId)

    if(!comment && !rating) throw new ApiError(400, "Comment or rating is required")

    const review = await Review.findOne(
        {
            userId:req.user._id,
            _id:reviewId,
        }
    )
    if(!review) throw new ApiError(404, "Review not found")

    if(comment) review.comment=comment
    if(rating) review.rating=rating
    
    let reviewImage="";
    console.log(req.file);
    if(req.file){
        try {
            reviewImage=await uploadOnCloudinary(req.file.path)
            if(!reviewImage) throw new ApiError(500,"Error uploading image to cloudinary")
            review.reviewImage=reviewImage.url;
            await review.save({validateBeforeSave:false})
            //return res.status(200).json(new ApiResponse(200,reviewImage,"Review Image updated successfully"))
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw new ApiError(500, "Error uploading image to Cloudinary");
        }
    }

    await updateProductRating(review.productId);

    const updatedReview = await review.save({validateBeforeSave:false})
    if(!updatedReview) throw new ApiError(500, "Error updating review")

    return res.status(200).json(new ApiResponse(200, updatedReview, "Review updated successfully"))

})

const deleteReview = asyncHandler(async (req, res) => {
    const {reviewId} = req.params

    if(!reviewId) throw new ApiError(400, "Review ID is required")

    const deletedReview = await Review.findOneAndDelete({
        _id:reviewId,
        userId:req.user._id
    })

    //image deletion from cloudinary code 

    if(!deletedReview) throw new ApiError(404, "Review not found")
    return res.status(200).json(new ApiResponse(200, deletedReview, "Review deleted successfully"))

})

const getReviews = asyncHandler(async (req, res) => {
    const {productId} = req.params

    if(!productId) throw new ApiError(400, "Product ID is required")

    const reviews = await Review.find({productId}).populate({
        path:"userId",
        select:"username email"
    })

    if(!reviews) throw new ApiError(404, "Reviews not found")

    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully"))

})

const getUserReviews = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 9,
        sortBy = "_id",
        sortType = "1",
        query,
    } = req.query;
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: parseInt(sortType) },
    };

    const aggregate = Review.aggregate([
        {
            $match: {
                userId: req.user._id,
            },
        },
        {
            $lookup:{
                from:"products",
                localField:"productId",
                foreignField:"_id",
                as:"product"
            }
        },
        {
            $unwind:"$product"
        },
        {
            $project:{
                _id:1,
                comment:1,
                rating:1,
                reviewDate:1,
                reviewImage:1,
                product:{
                    _id:1,
                    name:1,
                    price:1,
                    productImages:1
                }
            }
        }
    ])

    const reviews = await Review.aggregatePaginate(aggregate, options)
    //console.log(reviews);
    if(!reviews) throw new ApiError(404, "Reviews not found")

    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully"))

})

const getReviewAdmin = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 9,
        sortBy = "_id",
        sortType = "1",
        review = "",
        user = "",
        product = "",
        seller = "",
        before = "",
        after = "",
    } = req.query;
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: parseInt(sortType) },
    };

    const pipeline=[
        {
            $lookup:{
                from:"products",
                localField:"productId",
                foreignField:"_id",
                as:"product"
            }
        },
        {
            $unwind:"$product"
        },
        {
            $lookup:{
                from:"users",
                localField:"userId",
                foreignField:"_id",
                as:"user"
            }
        },
        {
            $unwind:"$user"
        },
        {
            $project:{
                _id:1,
                comment:1,
                rating:1,
                reviewDate:1,
                reviewImage:1,
                product:{
                    _id:1,
                    name:1,
                    price:1,
                    stock:1,
                    description:1,
                    productImages:1
                },
                user:{
                    _id:1,
                    username:1,
                    email:1,
                    fullName:1,
                    coverImage:1,
                    phone:1
                }
            }
        }

    ]

    if(user){
        pipeline.push({
            $match:{
                "user._id":new mongoose.Types.ObjectId(user)
            }
        })
    }

    if(product){
        pipeline.push({
            $match:{
                "product._id":new mongoose.Types.ObjectId(product)
            }
        })
    }

    if (before) {
        pipeline.push({
          $match: {
            createdAt: { $lte: new Date(before) },
          },
        });
    }
    
    if (after) {
        pipeline.push({
          $match: {
            createdAt: { $gte: new Date(after) },
          },
        });
    }

    if(review){
        pipeline.push({
            $match:{
                _id:new mongoose.Types.ObjectId(review)
            }
        })
    }

    const aggregate = Review.aggregate(pipeline)
    const reviews = await Review.aggregatePaginate(aggregate, options)

    if(!reviews) throw new ApiError(404, "Reviews not found")

    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully"))
    
})


export {
    postReview,
    updateReview,
    deleteReview,
    getReviews,
    getUserReviews,
    getReviewAdmin
}