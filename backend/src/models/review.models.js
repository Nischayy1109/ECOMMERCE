import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const reviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        comment: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            //maxVal: 5,
            enum: [1, 2, 3, 4, 5]
        },
        reviewDate: {
            type: Date,
            default: Date.now
        },
        isVerfied: {
            type: Boolean,
            default: false
        },
        reviewImage: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

reviewSchema.plugin(aggregatePaginate);
export const Review = mongoose.model("Review", reviewSchema)