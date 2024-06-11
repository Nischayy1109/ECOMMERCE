import {Router} from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js";
import { applyOffer, createOffer, deleteOffer, getOffers, updateOffer } from "../controllers/offers.controllers.js";
import { verifyisAdmin } from "../middlewares/admin.middlewares.js";

const router=Router();

//create offer
router.route("/create-offer").post(verifyJWT,verifyisAdmin,createOffer);//working
router.route("/get-offers").get(verifyJWT,verifyisAdmin,getOffers);//working
router.route("/update-offer/:offerId").put(verifyJWT,verifyisAdmin,updateOffer);//working
router.route("/delete-offer/:offerId").delete(verifyJWT,verifyisAdmin,deleteOffer);
router.route("/apply-offer").post(verifyJWT,applyOffer);//working

export default router;