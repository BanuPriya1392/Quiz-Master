// routes/wishlistRoutes.js
import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, addToWishlist);
router.get("/", verifyToken, getWishlist);
router.delete("/:id", verifyToken, removeFromWishlist);

export default router;