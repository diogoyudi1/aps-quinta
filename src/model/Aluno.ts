export interface Aluno {
    id?: string;
    planoId: string;
    nome: string;
    descricao: string;
    email: string;
    telefone: string;
    data_nascimento: string;
    valor_mensalidade: number;
    ativo: boolean;
}
