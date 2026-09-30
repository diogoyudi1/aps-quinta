import { Router } from "express";
import PlanoController from "../controller/PlanoController.js";

const router = Router();

router.get("/", PlanoController.getAll);
router.get("/search", PlanoController.getByKeyword);
router.get("/:id", PlanoController.getById);
router.post("/", PlanoController.create);
router.put("/:id", PlanoController.update);
router.delete("/:id", PlanoController.remove);

export default router;
