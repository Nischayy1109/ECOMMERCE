import {Cart} from '../models/cart.models.js';
import {Product} from '../models/product.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

const addToCart =asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const {productId}=req.body;

    const product=await Product.findById(productId);
    if(!product){
        throw new ApiError(404,'Product not found');
    }
    
    let cart=await Cart.findOne({userId});
    if(!cart){
        cart=new Cart({
            userId,
            products:[{productId,quantity:1}]
        })
    }
    const itemIndex=cart.products.findIndex(p=>p.productId==productId);
    if(itemIndex>-1){
        cart.products[itemIndex].quantity+=1;
    }
    else{
        cart.products.push({productId,quantity:1});
    }
    await cart.save();
    res.status(201).json(new ApiResponse(201,cart,'Product added to cart'));

});
// const increaseItemQuantity=asyncHandler(async(req,res)=>{
//     const user=req.user._id;
//     const {productId}=req.params;
//     const cart=await Cart.findOne({userId:user});
//     if(!cart){
//         throw new ApiError(404,'Cart not found');
//     }
//     const itemIndex=cart.products.findIndex(p=>p.productId==productId);
//     if(itemIndex>-1){
//         cart.products[itemIndex].quantity+=1;
//     }
//     else{
//         throw new ApiError(404,'Product not found in cart');
//     }
//     await cart.save();
//     return res.status(200).json(
//         new ApiResponse(200,cart,'Product quantity increased')
//     )
// })

// const decrementItemQuantity=asyncHandler(async(req,res)=>{
//     const user=req.user._id;
//     const {productId}=req.params;
//     const cart=await Cart.findOne({userId:user});
//     if(!cart){
//         throw new ApiError(404,'Cart not found');
//     }
//     const itemIndex=cart.products.findIndex(p=>p.productId==productId);
//     if(itemIndex>-1){
//         cart.products[itemIndex].quantity+=1;
//     }
//     else{
//         throw new ApiError(404,'Product not found in cart');
//     }
//     await cart.save();
//     return res.status(200).json(
//         new ApiResponse(200,cart,'Product quantity increased')
//     )
// })

const removeItemFromCart=asyncHandler(async(req,res)=>{

    const {productId}=req.params;
    console.log(productId);
    const userId=req.user._id;
    const cart=await Cart.findOne({userId:userId});
    if(!cart){
        throw new ApiError(404,'Cart not found');
    }

    cart.products=cart.products.filter(p=>p.productId!=productId);

    await cart.save();
    
    return res.status(200).json(
        new ApiResponse(200,cart,'Product removed from cart')
    )
})

const getUserCart = asyncHandler(async (req, res) => {
  const user = req.user._id;

  const cart = await Cart.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(user) }
    },
    {
      $unwind: "$products"
    },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    {
      $unwind: "$productDetails"
    },
    {
      $group: {
        _id: "$_id",
        userId: { $first: "$userId" },
        discountValue: { $first: "$discountValue" },
        products: {
          $push: {
            productId: "$productDetails._id",
            name: "$productDetails.name",
            price: "$productDetails.price",
            stock: "$productDetails.stock",
            productImages: "$productDetails.productImages",
            categoryId: "$productDetails.categoryId",
            sellerInfo: "$productDetails.sellerInfo",
            quantity: "$products.quantity"
          }
        }
      }
    }
  ]);

  if (!cart || cart.length === 0) {
    throw new ApiError(404, 'Cart not found');
  }

  return res.status(200).json(
    new ApiResponse(200, cart[0], 'Cart retrieved for the user')
  );
});
  

const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) 
        throw new ApiError(404, "Cart not found");

    const productIndex = cart.products.findIndex(p => p.productId.equals(productId));
    if (productIndex !== -1) {
        cart.products[productIndex].quantity = quantity;
        await cart.save();
    } else {
        throw new ApiError(404, "Product not found in cart");
    }

    res.status(200).json(new ApiResponse(200, cart, "Cart item updated"));
});

const clearCart=asyncHandler(async(req,res)=>{
    const user=req.user._id;

    const cart=await Cart.findOne({userId:user});
    if(!cart){
        throw new ApiError(404,'Cart not found');
    }
    cart.products=[];
    await cart.save();

    return res.status(200).json(
        new ApiResponse(200,cart,'Cart is empty now')
    )
})
const getCartValue=asyncHandler(async(req,res)=>{
    const user=req.user._id;
    const cart=await Cart.findOne({userId:user}).populate('products.productId');
    if(!cart){
        throw new ApiError(404,'Cart not found');
    }
    let total=0;
    cart.products.forEach(p=>{
        total+=p.productId.price*p.quantity;
    })
    total-=cart.discountValue;
    return res.status(200).json(
        new ApiResponse(200,total,'Cart value retrieved')
    )
})

const getCart = asyncHandler(async (req, res) => {
  const user = req.user._id;

  const cart = await Cart.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(user) } },
      { $unwind: "$products" },
      {
          $lookup: {
              from: "products",
              localField: "products.productId",
              foreignField: "_id",
              as: "productDetails"
          }
      },
      { $unwind: "$productDetails" },
      {
          $group: {
              _id: "$_id",
              userId: { $first: "$userId" },
              products: {
                  $push: {
                      productId: "$products.productId",
                      quantity: "$products.quantity",
                      details: {
                          name: "$productDetails.name",
                          description: "$productDetails.description",
                          price: "$productDetails.price",
                          stock: "$productDetails.stock",
                          productImages: "$productDetails.productImages",
                          categoryId: "$productDetails.categoryId",
                          sellerInfo: "$productDetails.sellerInfo"
                      }
                  }
              },
              discountValue: { $first: "$discountValue" },
              createdAt: { $first: "$createdAt" },
              updatedAt: { $first: "$updatedAt" }
          }
      }
  ]);

  if (!cart || cart.length === 0) {
      throw new ApiError(404, 'Cart not found');
  }

  return res.status(200).json(
      new ApiResponse(200, cart[0], 'Cart retrieved')
  );
});


const checkOutCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId })
    if (!cart) throw new ApiError(404, "Cart not found");
    const cartProducts = cart.products;
    if(cartProducts.length === 0) throw new ApiError(400, "Cart is empty");
    
    for(const cartProduct of cartProducts){
        const {productId, quantity} = cartProduct;
        const product = await Product.findById(productId);
        if(!product) throw new ApiError(404, "Product not found");
        const stock = product.stock;
        if(stock < quantity) throw new ApiError(400, "Stock not available");
        }

    const orderId = new mongoose.Types.ObjectId();

    return res.status(200).json(new ApiResponse(200, orderId, "Order placed successfully"));
})


export {
    addToCart,
    removeItemFromCart,
    getUserCart,
    updateCartItem,
    // increaseItemQuantity,
    // decrementItemQuantity,
    clearCart,
    getCartValue,
    getCart,
    checkOutCart
}