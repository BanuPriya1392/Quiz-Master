// src/routes/moduleRoutes.js
import express from "express";
import {
  createModule,
  getModulesByCollection,
  getModuleById,
  updateModule,
  deleteModule,
  getAllModules,
} from "../controllers/moduleController.js";

import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";

const router = express.Router({ mergeParams: true });

//  GET modules by category
router.get("/", verifyToken, getModulesByCollection);

// GET single module
router.get("/:moduleId", verifyToken, getModuleById);

//  CREATE module
router.post("/", verifyToken, allowRoles("mentor", "admin"), createModule);

//  UPDATE module
router.patch("/:moduleId", verifyToken, allowRoles("mentor", "admin"), updateModule);

// DELETE module
router.delete("/:moduleId", verifyToken, allowRoles("mentor", "admin"), deleteModule);

router.get("/all/modules", verifyToken, allowRoles("admin"), getAllModules);

export default router;