import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        phone:{
            type:Number,
            required:true,
            unique:true,
            maxlength:10
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        coverImage: {
            type: String,//cloudinary url
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        wishlist: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }],
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
        refreshToken: {
            type: String
        },
        cart: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart"
        },
        otp:{
            type:String
        },
        isAdmin:{
            type:Boolean,
            default:false
        }
    }
    ,
    {
        timestamps: true
    }
);
//hash password before saving
userSchema.pre("save", async function (next){
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

//compare password ie both decrypt and compare
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//jwt token for user
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
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
export const User = mongoose.model("User", userSchema)