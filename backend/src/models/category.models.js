import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
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

categorySchema.plugin(mongoosePaginate);
categorySchema.plugin(aggregatePaginate);

export const Category = mongoose.model("Category", categorySchema)