import supabase from "../config/supabase.js";
import type { Aluno } from "../model/Aluno.js";

async function findAll() {
    const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .order("nome", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string) {
    const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function findByPlano(planoId: string) {
    const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .eq("planoId", planoId)
        .order("nome", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function create(aluno: Aluno) {
    const { data, error } = await supabase
        .from("alunos")
        .insert(aluno)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function update(id: string, aluno: Aluno) {
    const { data, error } = await supabase
        .from("alunos")
        .update(aluno)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function remove(id: string) {
    const { data, error } = await supabase
        .from("alunos")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function searchByKeyword(keyword: string) {
    const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .or(`nome.ilike.%${keyword}%,email.ilike.%${keyword}%`)
        .order("nome", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

export default {
    findAll,
    findById,
    findByPlano,
    create,
    update,
    remove,
    searchByKeyword,
}
