import express from "express";
import { addToWishlist, removeFromWishlist } from "../controllers/wishlistController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, addToWishlist);
router.delete("/:questionId", verifyToken, removeFromWishlist);

export default router;