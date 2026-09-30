import { Router } from "express";
import AlunoController from "../controller/AlunoController.js";

const router = Router();

router.get("/", AlunoController.getAll);
router.get("/search", AlunoController.getByKeyword);
router.get("/plano/:planoId", AlunoController.getByPlano);
router.get("/:id", AlunoController.getById);
router.post("/", AlunoController.create);
router.put("/:id", AlunoController.update);
router.delete("/:id", AlunoController.remove);

export default router;
