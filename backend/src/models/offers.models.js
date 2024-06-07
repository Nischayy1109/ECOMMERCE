import mongoose from 'mongoose'

const offerSchema=new mongoose.Schema({
    discountValue:{
        type:Number,
        required:true
    },
    Promocode:{
        type:String,
        required:true,
        unique:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    cart:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Cart"
    },
    isActive:{
        type:Boolean,
        default:false
    }
})

const Offer=mongoose.model("Offer",offerSchema)