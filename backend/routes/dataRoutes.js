import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { 
  uploadFile, getDatasets, getDataset, deleteDataset, getChartData, 
  getPublicDataset, generateAIChartConfig // <-- NEW IMPORTS
} from "../controllers/dataController.js";

const router = Router();

router.post("/upload", authenticate, upload.single("file"), uploadFile);
router.get("/", authenticate, getDatasets);
router.get("/public/:id", getPublicDataset);         // <-- NEW (NO AUTH)
router.get("/:id/charts", authenticate, getChartData);
router.post("/:id/ai-chart", authenticate, generateAIChartConfig); // <-- NEW
router.get("/:id", authenticate, getDataset);
router.delete("/:id", authenticate, deleteDataset);

export default router;