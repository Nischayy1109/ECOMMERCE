import mongoose from "mongoose";
import { aggregatePaginate } from 'mongoose-aggregate-paginate-v2';

const orderSchema = new mongoose.Schema(
    {
        orderDate:{
            type:Date,
            required:true,
            //default value should be current date
            default:Date.now,
        },
        orderStatus:{
            type:String,
            default:"pending",
            enum:["pending","shipped","dispatched","delivered","cancelled"],
        },

        //added later and removed items array
        transactionId:{
            type:String,
            //required:true will get from payment gateway
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        total:{
            type:Number,
            required:true
        },

    },
    {
        timestamps:true
    }
)

orderSchema.plugin(aggregatePaginate);

export const Order=mongoose.model("Order",orderSchema)