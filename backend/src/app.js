import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app=express();

app.use(cors(
    {
        origin:'http://localhost:5173',
        credentials:true
    }
))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//importing routers
import userRouter from "./routes/user.routes.js"
import sellerRouter from "./routes/seller.routes.js"
import productRouter from "./routes/product.routes.js"
import categoryRouter from "./routes/category.routes.js"
import reviewRouter from "./routes/review.routes.js"
import orderRouter from "./routes/orders.routes.js"
import cartRouter from "./routes/cart.routes.js"
import orderItemRouter from "./routes/orderItems.routes.js"
import offerRouter from "./routes/offers.routes.js"
import paymentRouter from "./routes/payment.routes.js";
import addressRouter from "./routes/address.routes.js";

app.use("/api/v1/users",userRouter)
app.use("/api/v1/sellers",sellerRouter)
app.use("/api/v1/products",productRouter)
app.use("/api/v1/categories",categoryRouter)
app.use("/api/v1/reviews",reviewRouter)
app.use("/api/v1/orders",orderRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/orderItems",orderItemRouter)
app.use("/api/v1/offers",offerRouter)
app.use("/api/v1/payments",paymentRouter)
app.use("/api/v1/addresses", addressRouter);

export {app};