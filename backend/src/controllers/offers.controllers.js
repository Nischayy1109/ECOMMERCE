import { Cart } from "../models/cart.models.js";
import { Offer } from "../models/offers.models.js";
import { Product } from "../models/product.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createOffer = asyncHandler(async(req,res)=>{
    const {discountValue,Promocode,validFrom,expiryDate,minCartValue,isActive}=req.body;

    if(!discountValue || !Promocode || !validFrom || !expiryDate || !minCartValue){
        throw new ApiError(400,"Please provide all fields")
    }
    const offer=new Offer({
        discountValue,
        Promocode,
        validFrom,
        expiryDate,
        minCartValue,
        isActive
    })
    await offer.save();

    return res.status(201).json(new ApiResponse(201,offer,"Offer created successfully",))

});

const getOffers=asyncHandler(async(req,res)=>{
    const offers=await Offer.find({});
    if(!offers){
        throw new ApiError(400,"No offers found")
    }
    return res.status(200).json(new ApiResponse(200,offers,"Offers found"))
});

const updateOffer=asyncHandler(async(req,res)=>{
    const {offerId}=req.params;
    const {discountValue,Promocode,validFrom,expiryDate,minCartValue,isActive}=req.body;

    if(!discountValue || !Promocode || !validFrom || !expiryDate || !minCartValue){
        throw new ApiError(400,"Please provide all fields")
    }
    const offer=await Offer.findById(offerId);
    if(!offer){
        throw new ApiError(400,"Offer not found")
    }
    offer.discountValue=discountValue;
    offer.Promocode=Promocode;
    offer.validFrom=validFrom;
    offer.expiryDate=expiryDate;
    offer.minCartValue=minCartValue;
    offer.isActive=isActive;

    await offer.save();

    return res.status(200).json(new ApiResponse(200,offer,"Offer updated successfully"))
})

const deleteOffer=asyncHandler(async(req,res)=>{
    const {offerId}=req.params;
    const offer=await Offer.findById(offerId);

    if(!offer){
        throw new ApiError(400,"Offer not found")
    }
    await Offer.findByIdAndDelete(offerId);

    return res.status(200).json(new ApiResponse(200,null,"Offer deleted successfully"))
})

const applyOffer=asyncHandler(async(req,res)=>{
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(400,"Unauthorized access")
    }
    const cart=await Cart.findOne({userId:userId});
    if(!cart){
        throw new ApiError(400,"Cart not found")
    }
    const {Promocode}=req.body;
    const offer=await Offer.findOne({Promocode:Promocode, isActive:true});
    if(!offer){
        throw new ApiError(400,"Invalid promo code")
    }
    const totalCartValue=cart.products.reduce((acc,product)=>acc+product.price*product.quantity,0);
    
    if(totalCartValue<offer.minCartValue){
        throw new ApiError(400,`Minimum cart value should be ${offer.minCartValue}`)
    }
    cart.discountValue=offer.discountValue;

    await cart.save();

    return res.status(200).json(new ApiResponse(200,cart,"Offer applied successfully"))
})

export{createOffer,
    getOffers,
    updateOffer,
    deleteOffer,
    applyOffer
}