import mongoose from "mongoose";
//import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import  aggregatePaginate  from 'mongoose-aggregate-paginate-v2';

const orderItemsSchema = new mongoose.Schema(
    {
        orderID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        sellerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: true
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        orderStatus:{
            type:String,
            default:"pending",
            enum:["pending","shipped","dispatched","delivered","cancelled"],
        },
    },
    {
        timestamps: true
    }
)

orderItemsSchema.plugin(aggregatePaginate);

export const OrderItems=mongoose.model("OrderItems",orderItemsSchema)