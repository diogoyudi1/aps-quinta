export interface Plano {
    id?: string;
    nome: string;
    descricao: string;
    icon: string;
    ordem_exibicao: number;
    valor_mensal: number;
    duracao_meses: number;
    ativo: boolean;
}
