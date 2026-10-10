import express from "express";
import { userRegister, userLogin, logout} from "../controllers/authController.js";
import { registerValidation, loginValidation } from "../validaters/authValidater.js";
import { validaterMiddleware } from "../middlware/validaterMiddleware.js"

const router = express.Router();

router.post("/register", registerValidation,validaterMiddleware, userRegister);
router.post("/login", loginValidation, validaterMiddleware, userLogin);
router.post("/logout", logout);



export default router;