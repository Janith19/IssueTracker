import { Router } from "express";
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
} from "../controllers/issueController";
import auth from "../middleware/auth";

const router = Router();

router.use(auth);
//issue routes
router.post("/", createIssue);
router.get("/", getIssues);
router.get("/:id", getIssue);
router.put("/:id", updateIssue);
router.delete("/:id", deleteIssue);

export default router;
