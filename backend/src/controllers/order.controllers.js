import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import Order from '../models/orders.models.js'
import { OrderItems } from '../models/orderItems.models.js'

const createOrder = asyncHandler(async (req, res) => {
    const {total}=req.body;

    if(!total){
        res.status(400);
        throw new ApiError("All fields are required");
    }

    const userId=req.user._id;
    const createdOrder = await Order.create({
        total,
        //transactionId,
        userId:userId
    })
    if(!createdOrder){
        res.status(400);
        throw new ApiError("Order creation failed")
    }

    return res.status(201).json(new ApiResponse(201,createdOrder,"Order created successfully"));

})

const getOrderByUser = asyncHandler(async (req, res) => {
    const { page = 1, limit = 5, sortBy = "_id", sortType = "1" } = req.query;
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: parseInt(sortType) },
    };

    const aggregate = Order.aggregate([
        {
            $match: {
                userId: req.user?._id
            }
        },
        {
            $sort: options.sort // Apply sorting
        },
        {
            $skip: (options.page - 1) * options.limit // Apply pagination: skip records
        },
        {
            $limit: options.limit // Apply pagination: limit records
        }
    ]);

    const orders = await aggregate.exec();

    return res.status(200).json(new ApiResponse(200,orders,"Order created"));
});

const getOrdersByAllForAdmin = asyncHandler(async(req,res)=>{
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
            },
        },
        {
            $unwind:"$user",
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
            $unwind:"$product",
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
            $lookup:{
                from:"sellers",
                localField:"product.sellerInfo",
                foreignField:"_id",
                as:"seller"
            }
        },
        {
            $unwind:"$seller"
        },
        {
            $project:{
                order_id:"$order._id",
                user:{
                    _id:"$user._id",
                    fullName:"$user.fullName",
                    email:"$user.email",
                    username:"$user.username",
                    isVerified:"$user.isVerified",
                },
                product:{
                    _id:"$product._id",
                    name:"$product.name",
                    price:"$product.price",
                    stock:"$product.stock",
                    productImages:"$product.productImages",
                    sellerInfo:{
                        _id:"$product.sellerInfo._id",
                        sellerName:"$product.seller.sellerName",
                        sellerEmail:"$product.seller.sellerEmail",
                        sellerUsername:"$product.seller.sellerUsername",
                        sellerImage:"$product.seller.sellerImage",
                        sellerGST:"$product.seller.sellerGST",
                    }
                },
                order:{
                    _id:"$order._id",
                    transactionId:"$order.transactionId",
                    status:"$order.orderStatus",
                    orderDate:"$order.orderDate",
                    total:"$order.total",
                },
                payment:{
                    _id:"$payment._id",
                    paymentStatus:"$payment.paymentStatus",
                    paymentDate:"$payment.paymentDate",
                },
                quantity:1,
                price:1,
                createdAt:1
            },
        },
        {
            $group:{
                _id:"$order_id",
                user:{$first:"$user"},
                //product:{$first:"$product"},
                order:{$first:"$order"},
                payment:{$first:"$payment"},
                //quantity:{$sum:1},
                //price:{$sum:1},
                //createdAt:{$first:"$createdAt"}
                items:{
                    $push:{
                        product:{
                            product_id:"$product._id",
                            product_name:"$product.name",
                            product_price:"$product.price",
                            product_stock:"$product.stock",
                            product_images:"$product.productImages",
                            product_category:"$product.categoryId",
                            product_seller:"$product.sellerInfo",
                        },
                        quantity:"$quantity",
                        price:"$price",
                        createdAt:"$createdAt"
                    }
                
                }
            }
        }
    ]

    if(user){
        pipeline.push({
            $match: { userId: new mongoose.Types.ObjectId(user) },
        })
    }

    if(status){
        pipeline.push({
            $match: { "order.orderStatus": { $regex: status, $options: "ix" } },
        })
    }

    if (before) {
        pipeline.push({
          $match: { "order.createdAt": { $lte: new Date(before) } },
        });
    }
    
    if (after) {
        pipeline.push({
          $match: { "order.createdAt": { $gte: new Date(after) } },
        });
    }

    const aggregate = OrderItems.aggregate(pipeline);
    const allOrders = await OrderItems.aggregatePaginate(aggregate, options);
    
    if(!allOrders){
        throw new ApiError(404,"No orders found");
    }
    if(allOrders.length===0){
        return res.status(200).json(new ApiResponse(200,{},"No orders found"));
    }

    return res.status(200).json(new ApiResponse(200,allOrders,"Orders found"));
    
})

export {
    createOrder,
    getOrderByUser,
    getOrdersByAllForAdmin
}