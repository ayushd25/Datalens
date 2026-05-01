// backend/routes/dataRoutes.js
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadFile, getDatasets, getDataset, deleteDataset, getChartData } from "../controllers/dataController.js";

const router = Router();

router.post("/upload", authenticate, upload.single("file"), uploadFile);
router.get("/", authenticate, getDatasets);

// ⚠️ MUST be before /:id so Express doesn't confuse "charts" with an ID
router.get("/:id/charts", authenticate, getChartData); 

router.get("/:id", authenticate, getDataset);
router.delete("/:id", authenticate, deleteDataset);

export default router;