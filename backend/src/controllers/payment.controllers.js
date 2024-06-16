import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../models/payment.models.js";
import { instance } from "../utils/razorPay.js";
import crypto from "crypto";


const createOrder = asyncHandler(async (req, res, next) => {
    const { amount, orderId } = req.body;
    
    if (!amount) {
        return next(new ApiError(400, "Amount is required"));
    }
    if (!orderId) {
        return next(new ApiError(400, "Order Id is required"));
    }

    const options = {
        amount: Number(amount) *100,
        currency: "INR",
        notes: {
            orderId: orderId
        }
    };

    try {
        const orders = await instance.orders.create(options);
        if (!orders) {
            return next(new ApiError(400, "Error creating order"));
        }
        return res.status(200).json(new ApiResponse(200, { orders }, "Payment order created successfully"));
    } catch (error) {
        return next(new ApiError(500, "Server error creating order"));
    }
});


const verifyPayment=asyncHandler(async(req,res,next)=>{
    const{razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;

    const body=razorpay_order_id+"|"+razorpay_payment_id;

    const expectedSignature=crypto
    .createHmac('sha256',process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest('hex');

    const isAuthentic=expectedSignature===razorpay_signature;
    //cosole.log(isAuthentic);

    if(!isAuthentic){
        return next(new ApiError(400,"Payment verification failed"));
    }

    const payment=await instance.payments.fetch(razorpay_payment_id);

    if(!payment){
        return next(new ApiError(400,"Payment not found"));
    }

    const newPayment=new Payment({
        orderId:payment.notes.orderId,
        user:req.user._id,
        paymentMethod:payment.method,
        amount:payment.amount/100,
        transactionId:razorpay_payment_id,
    });

    if(!newPayment){
        return next(new ApiError(400,"Payment failed"));
    }
    return res.status(200).json(new ApiResponse(200,{newPayment},"Payment successful"));

})

const fetchOrder=asyncHandler(async(req,res,next)=>{
    const {orderId}=req.params;
    if(!orderId){
        return next(new ApiError(400,"Order Id is required"));
    }

    const order=await instance.orders.fetch(orderId);

    if(!order){
        return next(new ApiError(400,"Order not found"));
    }

    return res.status(200).json(new ApiResponse(200,{order},"Order fetched successfully"));
})

const fetchPayment=asyncHandler(async(req,res,next)=>{
    const {paymentId}=req.params;
    if(!paymentId){
        return next(new ApiError(400,"Payment Id is required"));
    }

    const payment=await Payment.fetch(paymentId);
    if(!payment){
        return next(new ApiError(400,"Payment not found"));
    }
    return res.status(200).json(new ApiResponse(200,{payment},"Payment fetched successfully"));
})

const paymentfailure=asyncHandler(async(req,res,next)=>{
    const {response} =req.body;
    return res.status(200).json(new ApiResponse(200,{response},"Payment failed"));
})

const getKeys=asyncHandler(async(req,res,next)=>{
    const key_id=process.env.RAZORPAY_API_KEY;
    return res.status(200).json(new ApiResponse(200,{key_id},"Key fetched successfully"));
})

export {createOrder,
    verifyPayment,
    fetchOrder,
    fetchPayment,
    paymentfailure,
    getKeys}