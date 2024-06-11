import {Router} from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js";
import { addToCart,clearCart,getCartValue,getUserCart, removeItemFromCart, updateCartItem,checkOutCart } from "../controllers/cart.controllers.js";


const router=Router();

//add item to cart
router.route("/addto-cart").post(verifyJWT,addToCart);//working

router.route("/").get(verifyJWT,getUserCart);//working
router.route("/delete/:productId").delete(verifyJWT,removeItemFromCart);//working
router.route("/update").put(verifyJWT,updateCartItem);//working
router.route("/clear-cart").delete(verifyJWT,clearCart);//working
router.route("/get-cart-value").get(verifyJWT,getCartValue);//working
router.route("/checkout").get(verifyJWT,checkOutCart);//working


export default router;