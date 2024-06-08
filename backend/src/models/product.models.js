import mongoose from 'mongoose'
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
    }
    ,
    {
        timestamps:true
    }
)
productSchema.plugin(mongooseAggregatePaginate)

export const Product=mongoose.model("Product",productSchema)