import type { Request, Response } from "express";
import AlunoRepository from "../repositories/AlunoRepository.js";

const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONE = /^[0-9()+\-\s]{8,20}$/;
const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;

function dataValida(data: string) {
    if (!REGEX_DATA.test(data)) {
        return false;
    }

    const [ano, mes, dia] = data.split("-").map(Number);
    const dataInformada = new Date(Date.UTC(ano!, mes! - 1, dia!));

    return dataInformada.getUTCFullYear() === ano
        && dataInformada.getUTCMonth() === mes! - 1
        && dataInformada.getUTCDate() === dia;
}

function validarAluno(body: any) {
    const erros: string[] = [];

    if (!body || typeof body !== "object") {
        return ["Corpo da requisição não informado."];
    }

    if (typeof body.planoId !== "string" || !REGEX_UUID.test(body.planoId)) {
        erros.push("O campo 'planoId' é obrigatório e deve conter o UUID de um plano cadastrado.");
    }

    if (typeof body.nome !== "string" || body.nome.trim() === "") {
        erros.push("O campo 'nome' é obrigatório e deve ser um texto.");
    }

    if (typeof body.descricao !== "string" || body.descricao.trim() === "") {
        erros.push("O campo 'descricao' é obrigatório e deve ser um texto.");
    }

    if (typeof body.email !== "string" || !REGEX_EMAIL.test(body.email)) {
        erros.push("O campo 'email' é obrigatório e deve conter um e-mail válido.");
    }

    if (typeof body.telefone !== "string" || !REGEX_TELEFONE.test(body.telefone)) {
        erros.push("O campo 'telefone' é obrigatório e deve conter um telefone válido.");
    }

    if (typeof body.data_nascimento !== "string" || !dataValida(body.data_nascimento)) {
        erros.push("O campo 'data_nascimento' é obrigatório e deve estar no formato AAAA-MM-DD.");
    } else if (new Date(body.data_nascimento) > new Date()) {
        erros.push("O campo 'data_nascimento' não pode ser uma data futura.");
    }

    if (typeof body.valor_mensalidade !== "number" || Number.isNaN(body.valor_mensalidade) || body.valor_mensalidade < 0) {
        erros.push("O campo 'valor_mensalidade' é obrigatório e deve ser um número maior ou igual a zero.");
    }

    if (typeof body.ativo !== "boolean") {
        erros.push("O campo 'ativo' é obrigatório e deve ser um booleano (true ou false).");
    }

    return erros;
}

async function getAll(req: Request, res: Response) {
    try {
        const alunos = await AlunoRepository.findAll();

        res.status(200).json(alunos)
    } catch (error) {
        console.log("Erro ao buscar alunos: ", error);

        res.status(500).json({
            message: "Erro ao buscar alunos."
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
        const alunos = await AlunoRepository.searchByKeyword(keyword);

        res.status(200).json(alunos);
    } catch (error) {
        console.log("Erro ao pesquisar alunos: ", error);

        res.status(500).json({
            message: "Erro ao pesquisar alunos.",
        });
    }
}

async function getByPlano(req: Request<{ planoId: string }>, res: Response) {
    const { planoId } = req.params;

    if (!planoId) {
        return res.status(404).json({
            message: "ID do plano não informado."
        });
    }

    try {
        const alunos = await AlunoRepository.findByPlano(planoId);

        res.status(200).json(alunos);
    } catch (error) {
        console.log("Erro ao buscar alunos do plano: ", error);

        res.status(500).json({
            message: "Erro ao buscar alunos do plano."
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(404).json({
            message: "ID do aluno não informado."
        });
    }

    try {
        const aluno = await AlunoRepository.findById(id);

        res.status(200).json(aluno)
    } catch (error) {
        console.log("Erro ao buscar aluno: ", error);

        res.status(404).json({
            message: "Aluno não encontrado."
        });
    }
}

async function create(req: Request, res: Response) {
    const erros = validarAluno(req.body);

    if (erros.length > 0) {
        return res.status(400).json({
            message: "Dados inválidos.",
            erros
        });
    }

    try {
        const aluno = await AlunoRepository.create(req.body);

        res.status(201).json(aluno)
    } catch (error) {
        console.log("Erro ao criar aluno: ", error);

        res.status(400).json({
            message: "Erro ao criar aluno. Verifique se o plano informado existe."
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(404).json({
            message: "ID do aluno não informado."
        });
    }

    const erros = validarAluno(req.body);

    if (erros.length > 0) {
        return res.status(400).json({
            message: "Dados inválidos.",
            erros
        });
    }

    try {
        // Verifica se o aluno existe antes de atualizar (404 x sucesso)
        await AlunoRepository.findById(id);
    } catch (error) {
        console.log("Erro ao buscar aluno: ", error);

        return res.status(404).json({
            message: "Aluno não encontrado."
        });
    }

    try {
        const aluno = await AlunoRepository.update(id, req.body);

        res.status(200).json(aluno)
    } catch (error) {
        console.log("Erro ao atualizar aluno: ", error);

        res.status(400).json({
            message: "Erro ao atualizar aluno. Verifique se o plano informado existe."
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(404).json({
            message: "ID do aluno não informado."
        });
    }

    try {
        await AlunoRepository.remove(id);

        res.status(200).json({
            message: "Aluno removido com sucesso."
        })
    } catch (error) {
        console.log("Erro ao excluir aluno: ", error);

        res.status(404).json({
            message: "Aluno não encontrado."
        });
    }
}

export default {
    getAll,
    getByKeyword,
    getByPlano,
    getById,
    create,
    update,
    remove
}
