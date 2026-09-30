import express from "express";
import planoRoutes from "./routes/planoRoutes.js";
import alunoRoutes from "./routes/alunoRoutes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Academia System - API",
        version: "1.0.0",
    });
});

app.use("/planos", planoRoutes);

app.use("/alunos", alunoRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: "Rota não encontrada.",
    });
});

export default app;
