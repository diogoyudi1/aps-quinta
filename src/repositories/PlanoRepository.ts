import supabase from "../config/supabase.js";
import type { Plano } from "../model/Plano.js";

async function findAll() {
    const { data, error } = await supabase
        .from("planos")
        .select("*")
        .order("ordem_exibicao", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string) {
    const { data, error } = await supabase
        .from("planos")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function create(plano: Plano) {
    const { data, error } = await supabase
        .from("planos")
        .insert(plano)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function update(id: string, plano: Plano) {
    const { data, error } = await supabase
        .from("planos")
        .update(plano)
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
        .from("planos")
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
        .from("planos")
        .select("*")
        .or(`nome.ilike.%${keyword}%,descricao.ilike.%${keyword}%`)
        .order("ordem_exibicao", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

export default {
    findAll,
    findById,
    create,
    update,
    remove,
    searchByKeyword,
}
