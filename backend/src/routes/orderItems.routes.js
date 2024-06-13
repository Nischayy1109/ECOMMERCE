import { Router } from "express";
import { verifyJWT, verifyJWTforSeller, verifySeller } from "../middlewares/auth.middlewares.js";
import { verifyisAdmin } from "../middlewares/admin.middlewares.js";
import {
    createOrderItems,
    getOrderItems,
    getOrderBySellers,
    getOrderItemById,
    updateOrderStatus,
    getAllOrderAndDetails
} from "../controllers/orderItems.controllers.js";

const router = Router()

router.route("/create").post(verifyJWT, createOrderItems)
router.route("/:orderID").get(verifyJWT, getOrderItems)

router.route("/seller").get(verifyJWT, getOrderBySellers)
router.route("/status/:itemId").get(verifyJWT, getOrderItemById)
router.route("/status/:orderItemId").put(verifyJWT, updateOrderStatus)


router.route("/").get(
    verifyJWT, 
    //verifyisAdmin,
    getAllOrderAndDetails 
)

export default router;