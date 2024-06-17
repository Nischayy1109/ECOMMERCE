import mongoose from 'mongoose'
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoosePaginate from "mongoose-paginate-v2";
const productSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            lowercase:true,
            index:true
        },
        description:{
            type:String,
            required:true,
            lowercase:true,

        },
        price:{
            type:Number,
            required:true,
        },
        stock:{
            type:Number,
            required:true
        },
        productImages:{
            type:[String],
            required:true
        },
        categoryId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Category"
        },
        sellerInfo:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Seller"
        },
        rating:{
            type:Number,
            default:0
        },
    }
    ,
    {
        timestamps:true
    }
)
productSchema.plugin(mongoosePaginate)
productSchema.plugin(aggregatePaginate)

export const Product=mongoose.model("Product",productSchema)