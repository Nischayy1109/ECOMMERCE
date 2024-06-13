import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from '../models/product.models.js';
import { OrderItems } from "../models/orderItems.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/orders.models.js";

const createOrderItems = asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const {orderID,productID,quantity,price,sellerID}=req.body;

    if(!orderID || !productID || !quantity || !price || !sellerID){
        throw new ApiError(400,"All fields are required");
    }

    const orderedProduct = await Product.findByIdAndUpdate(productID,{
        $inc:{
            stock:-quantity
        }
    })
    if(!orderedProduct){
        throw new ApiError(404,"Product not found");
    }

    const orderItem = await OrderItems.create({
        orderID,
        productID,
        quantity,
        price,
        sellerID,
        userId
    })

    if(!orderItem){
        await Product.findByIdAndUpdate(productID,{$inc:{stock:quantity}})
        throw new ApiError(500,"Order creation failed");
    }

    return res.status(201).json(new ApiResponse(200,orderItem,"Order created successfully"))

})

const getOrderItems = asyncHandler(async(req,res)=>{
    const {orderID} =req.params;
    if(!orderID) throw new ApiError(400,"Order ID is required");

    const existOrder = await Order.findById(orderID);
    if(!existOrder) throw new ApiError(404,"Order not found");

    const items = await OrderItems.find({orderID,user:req.user._id}).populate({
        path:"productID",
        select:"name price productImages"
    })

    if(!items){
        throw new ApiError(404,"Order items not found");
    }

    return res.status(200).json(new ApiResponse(200,items,"Order items found"));

})

const getOrderBySellers = asyncHandler(async(req,res)=>{
    const sellerID=req.user._id;
    if(!sellerID) throw new ApiError(400,"You are not a seller");
    
    const {
        page = 1,
        limit = 10,
        sortBy = "_id",
        sortType = "1",
        status,
        before,
        after,
    } = req.query;
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: parseInt(sortType) },
    };

    const pipeline = [
        {
            $match: {
                sellerID: sellerID
            }
        },
        {
            $lookup:{
                from:"products",
                localField:"productID",
                foreignField:"_id",
                as:"product",
            }
        },
        {
            $unwind:"$product"
        },
        {
            $lookup:{
                from:"orders",
                localField:"orderID",
                foreignField:"_id",
                as:"order",
            }
        },
        {
            $unwind:"$order"
        },
        {
            $lookup:{
                from:"users",
                localField:"userId",
                foreignField:"_id",
                as:"user",
            }
        },
        {
            $unwind:"$user"
        },
        {
            $project:{
                _id:1,
                orderID:1,
                productID:1,
                quantity:1,
                price:1,
                sellerID:1,
                "user._id": 1,
                "user.fullName": 1,
                "user.email": 1,
                "user.phone": 1,
                "product.name":1,
                "product.price":1,
                "product.productImages":1,
                orderStatus:"$order.orderStatus",
                createdAt:1,
                //updatedAt:1
            }
        }
    ]

    if(status){
        pipeline.push({
            $match:{
                orderStatus:{ $regex: status, $options: "ix" }
            }
        })
    }

    if(before){
        pipeline.push({
            $match:{
                createdAt:{$lte:new Date(before)}
            }
        })
    }

    if(after){
        pipeline.push({
            $match:{
                createdAt:{$gte:new Date(after)}
            }
        })
    }

    const aggregate = OrderItems.aggregate(pipeline);
    const sellerOrders = await OrderItems.aggregatePaginate(aggregate,options);

    if(!sellerOrders){
        throw new ApiError(404,"Orders not found");
    }

    if(sellerOrders.length===0){
        return res.status(200).json(new ApiResponse(200,{},"No orders found"));
    }

    return res.status(200).json(new ApiResponse(200,sellerOrders,"Orders found"));
    
})

const getOrderItemById = asyncHandler(async(req,res)=>{
    const {itemId}=req.params
    if(!itemId) throw new ApiError(400,"Item ID is required");

    const item = await OrderItems.findById(itemId).populate("user").populate("productID");
    if(!item) throw new ApiError(404,"Order item not found");

    return res.status(200).json(new ApiResponse(200,item,"Order item found"))
})

const updateOrderStatus = asyncHandler(async(req,res)=>{
    const {orderItemId} = req.params;
    const {orderStatus} = req.body;

    if(!orderItemId || !orderStatus) throw new ApiError(400,"Order ID and Status are required");

    const orderItem = await OrderItems.findById(orderItemId);
    if(!orderItem) throw new ApiError(404,"Order item not found");

    orderItem.orderStatus = orderStatus;
    const savedStatus = await orderItem.save();
    if(!savedStatus) throw new ApiError(500,"Order status update failed");

    return res.status(200).json(new ApiResponse(200,savedStatus,"Order status updated successfully"));

})

const getAllOrderAndDetails = asyncHandler(async(req,res)=>{
    let {
        page = 1,
        limit = 10,
        sortBy = "_id",
        sortType = "1",
        user = "",
        seller = "",
        status = "",
        before = "",
        after = "",
    } = req.query;
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: parseInt(sortType) },
    };

    const pipeline = [
        {
            $lookup:{
                from:"users",
                localField:"userId",
                foreignField:"_id",
                as:"user",
            }
        },
        {
            $unwind:"$user"
        },
        {
            $lookup:{
                from:"products",
                localField:"productID",
                foreignField:"_id",
                as:"product",
            }
        },
        {
            $unwind:"$product"
        },
        {
            $lookup:{
                from:"orders",
                localField:"orderID",
                foreignField:"_id",
                as:"order",
            }
        },
        {
            $unwind:"$order"
        },
        {
            $lookup:{
                from:"sellers",
                localField:"sellerID",
                foreignField:"_id",
                as:"seller",
            }
        },
        {
            $unwind:"$seller"
        },
        {
            $lookup:{
                from:"payments",
                localField:"order.transactionId",
                foreignField:"transactionId",
                as:"payment",
            }
        },
        {
            $unwind:"$payment"
        },
        {
            $project:{
                user_id: "$user._id",
                user_fullName: "$user.fullName",
                user_username: "$user.username",
                user_email: "$user.email",
                user_phone: "$user.phone",
                user_verified: "$user.isVerified",

                product_id: "$product._id",
                product_name: "$product.name",
                product_productImages: "$product.productImages",
                product_price: "$product.price",
                product_stock: "$product.stock",
                product_category: "$product.categoryId",

                seller_id: "$seller._id",
                seller_Name: "$seller.sellerName",
                seller_email: "$seller.sellerEmail",
                seller_phone: "$seller.sellerPhone",
                seller_GST: "$seller.sellerGST",
                seller_verified: "$seller.sellerVerified",

                order_id: "$order._id",
                order_transactionID: "$order.transactionId",
                order_status: "$order.orderStatus",
                order_total: "$order.total",

                payment_id: "$payment._id",
                payment_modeOfPayment: "$payment.modeOfPayment",
                payment_createdAt: "$payment.createdAt",

                amount: 1,
                quantity: 1,
                createdAt: 1,
                orderStatus: 1,
            }
        }
    ]


    //code given by copilot here
    if (user) {
        pipeline.push({
          $match: { user_id: new mongoose.Types.ObjectId(user) },
        });
    }
    
    if (seller) {
        pipeline.push({
          $match: { seller_id: new mongoose.Types.ObjectId(seller) },
        });
    }
    
    if (orderStatus) {
        pipeline.push({
          $match: { status: { $regex: status, $options: "ix" } },
        });
    }
    
    if (before) {
        pipeline.push({
          $match: { createdAt: { $lte: new Date(before) } },
        });
    }
    
    if (after) {
        pipeline.push({
          $match: { createdAt: { $gte: new Date(after) } },
        });
    }

    const aggregate = OrderItems.aggregate(pipeline);
    const orders = await OrderItems.aggregatePaginate(aggregate, options);

    if(!orders){
        throw new ApiError(404,"Orders not found");
    }

    if(orders.length===0){
        return res.status(200).json(new ApiResponse(200,{},"No orders found"));
    }

    return res.status(200).json(new ApiResponse(200,orders,"Orders found"));
})

export {
    createOrderItems,
    getOrderItems,
    getOrderBySellers,
    getOrderItemById,
    updateOrderStatus,
    getAllOrderAndDetails
}