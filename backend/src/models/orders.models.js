import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderDate:{
            type:Date,
            required:true
        },
        orderStatus:{
            type:String,
            required:true,
            enum:["pending","shipped","dispatched","delivered","cancelled"],
        },
        items:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"OrderItems"
            }
        ]

    },
    {
        timestamps:true
    }
)

const Order=mongoose.model("Order",orderSchema)