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
    validFrom:{
        type:Date,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    // cart:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"Cart"
    // },
    minCartValue:{
        type:Number,
        required:true
    },
    isActive:{
        type:Boolean,
        default:false
    }
})

export const Offer=mongoose.model("Offer",offerSchema)