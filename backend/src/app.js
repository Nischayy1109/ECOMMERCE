import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app=express();

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
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

app.use("/api/v1/users",userRouter)
app.use("/api/v1/sellers",sellerRouter)
app.use("/api/v1/products",productRouter)
app.use("/api/v1/categories",categoryRouter)
app.use("/api/v1/reviews",reviewRouter)
app.use("/api/v1/orders",orderRouter)

export {app};