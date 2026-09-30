import type { Request, Response } from "express";
import PlanoRepository from "../repositories/PlanoRepository.js";

function validarPlano(body: any) {
    const erros: string[] = [];

    if (!body || typeof body !== "object") {
        return ["Corpo da requisição não informado."];
    }

    if (typeof body.nome !== "string" || body.nome.trim() === "") {
        erros.push("O campo 'nome' é obrigatório e deve ser um texto.");
    }

    if (typeof body.descricao !== "string" || body.descricao.trim() === "") {
        erros.push("O campo 'descricao' é obrigatório e deve ser um texto.");
    }

    if (typeof body.icon !== "string" || body.icon.trim() === "") {
        erros.push("O campo 'icon' é obrigatório e deve ser um texto.");
    }

    if (typeof body.ordem_exibicao !== "number" || !Number.isInteger(body.ordem_exibicao) || body.ordem_exibicao < 0) {
        erros.push("O campo 'ordem_exibicao' é obrigatório e deve ser um número inteiro maior ou igual a zero.");
    }

    if (typeof body.valor_mensal !== "number" || Number.isNaN(body.valor_mensal) || body.valor_mensal < 0) {
        erros.push("O campo 'valor_mensal' é obrigatório e deve ser um número maior ou igual a zero.");
    }

    if (typeof body.duracao_meses !== "number" || !Number.isInteger(body.duracao_meses) || body.duracao_meses < 1) {
        erros.push("O campo 'duracao_meses' é obrigatório e deve ser um número inteiro maior ou igual a 1.");
    }

    if (typeof body.ativo !== "boolean") {
        erros.push("O campo 'ativo' é obrigatório e deve ser um booleano (true ou false).");
    }

    return erros;
}

async function getAll(req: Request, res: Response) {
    try {
        const planos = await PlanoRepository.findAll();

        res.status(200).json(planos)
    } catch (error) {
        console.log("Erro ao buscar planos: ", error);

        res.status(500).json({
            message: "Erro ao buscar planos."
        });
    }
}

async function getByKeyword(req: Request, res: Response) {
    const { keyword } = req.query;

    if (!keyword || typeof keyword != "string") {
        return res.status(400).json({
            message: "Palavra-chave não informada."
        });
    }

    try {
        const planos = await PlanoRepository.searchByKeyword(keyword);

        res.status(200).json(planos);
    } catch (error) {
        console.log("Erro ao pesquisar planos: ", error);

        res.status(500).json({
            message: "Erro ao pesquisar planos.",
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(404).json({
            message: "ID do plano não informado."
        });
    }

    try {
        const plano = await PlanoRepository.findById(id);

        res.status(200).json(plano)
    } catch (error) {
        console.log("Erro ao buscar plano: ", error);

        res.status(404).json({
            message: "Plano não encontrado."
        });
    }
}

async function create(req: Request, res: Response) {
    const erros = validarPlano(req.body);

    if (erros.length > 0) {
        return res.status(400).json({
            message: "Dados inválidos.",
            erros
        });
    }

    try {
        const plano = await PlanoRepository.create(req.body);

        res.status(201).json(plano)
    } catch (error) {
        console.log("Erro ao criar plano: ", error);

        res.status(500).json({
            message: "Erro ao criar plano."
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(404).json({
            message: "ID do plano não informado."
        });
    }

    const erros = validarPlano(req.body);

    if (erros.length > 0) {
        return res.status(400).json({
            message: "Dados inválidos.",
            erros
        });
    }

    try {
        await PlanoRepository.findById(id);
    } catch (error) {
        console.log("Erro ao buscar plano: ", error);

        return res.status(404).json({
            message: "Plano não encontrado."
        });
    }

    try {
        const plano = await PlanoRepository.update(id, req.body);

        res.status(200).json(plano)
    } catch (error) {
        console.log("Erro ao atualizar plano: ", error);

        res.status(500).json({
            message: "Erro ao atualizar plano."
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(404).json({
            message: "ID do plano não informado."
        });
    }

    try {
        await PlanoRepository.findById(id);
    } catch (error) {
        console.log("Erro ao buscar plano: ", error);

        return res.status(404).json({
            message: "Plano não encontrado."
        });
    }

    try {
        await PlanoRepository.remove(id);

        res.status(200).json({
            message: "Plano removido com sucesso."
        })
    } catch (error) {
        console.log("Erro ao excluir plano: ", error);

        res.status(409).json({
            message: "Não foi possível remover o plano. Existem alunos vinculados a ele."
        });
    }
}

export default {
    getAll,
    getByKeyword,
    getById,
    create,
    update,
    remove
}
