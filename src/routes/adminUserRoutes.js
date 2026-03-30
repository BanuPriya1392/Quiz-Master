import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserAttempts,
} from "../controllers/adminUserController.js";

import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

//VIEW ALL USERS (admin/mentor)
router.get(
  "/",
  verifyToken,
  allowRoles("admin", "mentor"),
  getAllUsers
);

router.get(
  "/:userId",
  verifyToken,
  allowRoles("admin", "mentor"),
  getUserById
);

router.get(
  "/:userId/attempts",
  verifyToken,
  allowRoles("admin", "mentor"),
  getUserAttempts
);

//only admin can update/delete users
router.put(
  "/:userId",
  verifyToken,
  allowRoles("admin"),
  updateUser
);

router.delete(
  "/:userId",
  verifyToken,
  allowRoles("admin"),
  deleteUser
);

export default router;