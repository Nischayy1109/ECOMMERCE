import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            index: true
        },
        description: {
            type: String,
            required: true,
            lowercase: true
        },
        categoryImage: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Category = mongoose.model("Category", categorySchema)