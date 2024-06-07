import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";

const sellerSchema=new mongoose.Schema({
    sellerName:{
        type:String,
        required:true,
        lowercase:true,
        index:true
    },
    sellerEmail:{
        type:String,
        required:true,
        lowercase:true,
        index:true
    },
    sellerPhone:{
        type:Number,
        required:true,
        maxlength:10
    },
    sellerAddress:{
        type:String,
        required:true,
        lowercase:true
    },
    sellerImage:{
        type:String,
        required:true
    },
    sellerPassword:{
        type:String,
        required:true
    },
    sellerGST:{
        type:String,
        required:true
    },
    sellerRefershToken:{
        type:String
    },
    sellerVerified:{
        type:Boolean,
        default:false
    },
    sellerUsername:{
        type:String,
        required:true,
        lowercase:true,
        index:true
    },
},
{
    timestamps:true
}
) 



sellerSchema.pre("save",async function(next){
    if(!this.isModified("sellerPassword")){
        next();
    }
    this.sellerPassword=await bcrypt.hash(this.sellerPassword,10);
    next();
})

sellerSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.sellerPassword)
}

//jwt token
sellerSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            sellerEmail:this.sellerEmail,
            sellerUsername:this.sellerUsername,
            sellerName:this.sellerName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

sellerSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
sellerSchema.plugin(mongooseAggregatePaginate);

export const Seller=mongoose.model("Seller",sellerSchema)