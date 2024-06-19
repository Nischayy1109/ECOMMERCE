import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Address } from "../models/address.models.js";


const addAddress=asyncHandler(async(req,res)=>{
    //get user from req.user
    //get address from req.body
    //check validation on fields of address
    //add address to user
    //save user and send response

    const user=req.user;
    if(!user){
        throw new ApiError(401,"Unauthorized User")
    }

    const {addressLine1,addressLine2,zipcode,city,state,country,phoneNumber}=req.body;
    console.log(req.body);

    if(!addressLine1 || !zipcode || !city || !state || !country || !phoneNumber){
        throw new ApiError(400,"Please provide all fields")
    }

    // if((country==="India" || country==="india" || country==="INDIA")){
    //     throw new ApiError(400,"Please provide a valid pincode")
    // }

    if(!/^\d{10}$/.test(phoneNumber)){
        throw new ApiError(400,"Please provide a valid contact number")
    }

    const newAddress=await Address.create({
        addressLine1,
        addressLine2: addressLine2 || "",
        zipcode,
        city,
        state,
        country,
        phoneNumber,
        userId:user._id,
        isDefault:true
    });
    
    if(!newAddress){
        throw new ApiError(400,"Address creation error")
    }

    return res.status(200)
    .json(new ApiResponse(200,newAddress,"Address added successfully"))
});

const userAddresses=asyncHandler(async(req,res)=>{
    const user=req.user;
    if(!user){
        throw new ApiError(401,"Unauthorized User")
    }
    const addresses=await Address.find({userId:user._id});
    if(!addresses){
        throw new ApiError(400,"No addresses found")
    }
    console.log(addresses)
    return res.status(200)
    .json(new ApiResponse(200,addresses,"Addresses fetched successfully for the user"))
});

const deleteAddress = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Unauthorized User");
    }

    const {addressId} = req.params;
    if (!addressId) {
        throw new ApiError(400, "Please provide address id");
    }

    const address = await Address.findById(addressId);
    if (!address) {
        throw new ApiError(400, "No address found");
    }

    address.isDefault = false;
    if (address.userId.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this address");
    }

    await Address.findByIdAndDelete(addressId);

    return res.status(200).json(new ApiResponse(200, null, "Address deleted successfully"));
});

const updateAddress=asyncHandler(async(req,res)=>{
    const {addressId} = req.params;
    const user=req.user;
    if(!user){
        throw new ApiError(401,"Unauthorized User")
    }
    const{addressLine1,addressLine2,zipcode,city,state,country,phoneNumber}=req.body;

    if(!addressLine1 || !zipcode || !city || !state || !country || !phoneNumber){
        throw new ApiError(400,"Please provide all fields")
    }
    const currentAddress=await Address.findById(addressId);
    if(!currentAddress){
        throw new ApiError(400,"Address not found")
    }
    currentAddress.addressLine1=addressLine1;
    currentAddress.addressLine2=addressLine2;
    currentAddress.zipcode=zipcode;
    currentAddress.city=city;
    currentAddress.state=state;
    currentAddress.country=country;
    currentAddress.phoneNumber=phoneNumber;

    const updatedAddress=await currentAddress.save({validateBeforeSave:false});

    if(!updatedAddress){
        throw new ApiError(400,"Address updation error")
    }
    return res.status(200).json(new ApiResponse(200,updatedAddress,"Address updated successfully"))
});

export{addAddress
    ,userAddresses
    ,deleteAddress
    ,updateAddress
}