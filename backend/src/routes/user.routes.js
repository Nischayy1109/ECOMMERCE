import { Router } from "express";

import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { loginUser, registerUser,logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updatePhone, updateCoverImage, requestEmailUpdate, verifyAndUpdateEmail, sendVerificationEmail, verifyUser } from "../controllers/user.controller.js";

const router = Router();

//register user route
router.route('/register').post(
    upload.single('coverImage'),
    registerUser
)//working
//login route
router.route("/login").post(loginUser)//working

//secured routes - user needs to be logged in to perform these actions
router.route("/verify-user").get(verifyJWT,sendVerificationEmail)
router.route("/verify-user-otp").post(verifyJWT,verifyUser)
router.route("/logout").get(verifyJWT, logoutUser)//working
router.route("/refresh-token").post(refreshAccessToken)//working
router.route("/change-password").post(verifyJWT,changeCurrentPassword)//working
router.route("/current-user").get(verifyJWT,getCurrentUser)//working
router.route("/update-phone").post(verifyJWT,updatePhone)//working
router.route("/update-coverImage").post(verifyJWT,upload.single('coverImage'),updateCoverImage)//working


router.route('/update-email').post(verifyJWT, requestEmailUpdate);
router.route('/verify-email-otp').post(verifyJWT, verifyAndUpdateEmail);

export default router;