import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    paymentDate:{
        type:Date,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    paymentStatus:{
        type:String,
        required:true,
        enum:["pending","completed","cancelled"],
    },
    transcationId:{
        type:String,
        required:true
    }
    
})

export const Payment=mongoose.model("Payment",paymentSchema)