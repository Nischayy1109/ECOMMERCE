import {Router} from "express"
import { verifyJWT, verifyJWTforSeller, verifySeller } from "../middlewares/auth.middlewares.js";
import { verifyisAdmin } from "../middlewares/admin.middlewares.js";
import { upload } from '../middlewares/multer.middlewares.js';
import {
    createOrder,
    getOrderByUser,
    getOrdersByAllForAdmin
} from "../controllers/order.controllers.js";


const router = Router()

//creating the order
router.route("/createOrder").post(
    verifyJWT,
    createOrder
)

//getting the order
router.route("/getOrderByUser").get(
    verifyJWT,
    getOrderByUser
)//will check again later made some changes for payment

router.route("/getOrdersByAllForAdmin").get(
    verifyJWT,
    //verifyisAdmin,
    getOrdersByAllForAdmin
)//will check later made some changes for payment


export default router