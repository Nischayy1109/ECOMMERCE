import {Router} from "express"
import { verifyJWT, verifyJWTforSeller, verifySeller } from "../middlewares/auth.middlewares.js";
import { verifyisAdmin } from "../middlewares/admin.middlewares.js";
import { upload } from '../middlewares/multer.middlewares.js';
import { 
    createProduct, 
    deleteProduct, 
    getAllProducts, 
    getProductbyCategory, 
    getProductbyId, 
    getProductbySeller, 
    getProducts, 
    updateProduct 
} from "../controllers/product.controllers.js";



const router=Router();


//getting the products
router.route("/").get(getProducts);
router.route("/p/:productId").get(getProductbyId);
router.route("/category/:categoryId").get(getProductbyCategory)
router.route("/admin").get(verifyJWT,verifyisAdmin,getAllProducts)
router.route("/seller").get(verifyJWTforSeller,getProductbySeller)

//creating the product
router.route("/createProduct").post(
    verifyJWTforSeller,
    verifySeller,
    upload.array("productImage",4),
    createProduct
);

//updating and deleting the product
router.route("/update/:productId").put(verifyJWTforSeller,updateProduct)
router.route("/delete/:productId").delete(verifyJWTforSeller,deleteProduct)


export default router;