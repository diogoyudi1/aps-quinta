# 🏋️ Academia System – API REST

API REST para o gerenciamento de **planos** e **alunos** de uma academia, desenvolvida como Atividade Prática
Supervisionada (APS) da disciplina de **Desenvolvimento Back-End** – 4º período de Engenharia de Software,
Campus SJP.

---

## Sumário

1. [Nome e descrição do projeto](#1-nome-e-descrição-do-projeto)
2. [Integrantes da equipe](#2-integrantes-da-equipe)
3. [Tecnologias utilizadas](#3-tecnologias-utilizadas)
4. [Entidades e relacionamento](#4-entidades-e-relacionamento)
5. [Estrutura do projeto](#5-estrutura-do-projeto)
6. [Configuração e execução](#6-configuração-e-execução)
7. [Variáveis de ambiente](#7-variáveis-de-ambiente)
8. [Banco de dados](#8-banco-de-dados)
9. [Documentação dos endpoints](#9-documentação-dos-endpoints)
10. [Exemplos de requisições](#10-exemplos-de-requisições)
11. [Códigos de resposta HTTP utilizados](#11-códigos-de-resposta-http-utilizados)
12. [Funcionalidades adicionais](#12-funcionalidades-adicionais)
13. [Roteiro sugerido de demonstração](#13-roteiro-sugerido-de-demonstração)

---

## 1. Nome e descrição do projeto

**Academia System – API REST**

### Qual problema ela busca resolver

Academias precisam controlar, de forma organizada, quais **planos** oferecem (Musculação, Cross Training,
Funcional, etc.) e **quais alunos** estão matriculados em cada plano. Quando esse controle é feito em
planilhas soltas ou em anotações manuais, as informações ficam duplicadas, desatualizadas e sem
consistência entre os planos ofertados e as matrículas realizadas.

### Domínio escolhido

**Academia / Fitness** – gestão de planos de treino e de alunos matriculados.

### Objetivo da API

Disponibilizar uma API REST que permita **cadastrar, consultar, atualizar e remover** planos e alunos,
garantindo que:

- todo aluno esteja vinculado a um plano existente (**integridade referencial** garantida pela chave estrangeira);
- não seja possível excluir um plano que ainda possua alunos vinculados;
- os dados trafeguem em **JSON**, com validação de entrada e tratamento de erros padronizados;
- a persistência seja feita em um banco **PostgreSQL** hospedado no **Supabase**.

---

## 2. Integrantes da equipe

| Integrante |
| --- |
| Eduardo Lopes |
| Diogo Yudi |

---

## 3. Tecnologias utilizadas

| Tecnologia | Para que foi utilizada |
| --- | --- |
| **Node.js** | Ambiente de execução do JavaScript no servidor |
| **TypeScript** | Linguagem utilizada no desenvolvimento, com tipagem estática |
| **Express** | Framework responsável pelo servidor HTTP, rotas e middlewares |
| **Supabase** | Backend como serviço (BaaS) usado como camada de acesso ao banco |
| **PostgreSQL** | Banco de dados relacional hospedado pelo Supabase |
| **@supabase/supabase-js** | Biblioteca oficial que conecta a aplicação ao Supabase |
| **tsx** | Executa arquivos TypeScript diretamente, com recarregamento automático (`--watch`) |
| **Postman** | Testes manuais dos endpoints (collection disponível no repositório) |
| **Git / GitHub** | Versionamento e disponibilização do código-fonte |

> Recursos nativos do Node.js utilizados: `--env-file` (carregamento do arquivo `.env`),
> `--watch` (recarregamento automático em desenvolvimento) e `node:crypto` — usados nas aulas.

---

## 4. Entidades e relacionamento

O projeto possui **duas entidades relacionadas**, ambas com **UUID como identificador**, gerado
automaticamente pelo banco de dados (`gen_random_uuid()`).

### 4.1 Plano

Representa um plano oferecido pela academia.

| Atributo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | uuid | gerado pelo banco | Identificador único do plano (chave primária) |
| `nome` | text | sim | Nome do plano (ex.: "Musculação") |
| `descricao` | text | sim | Descrição do plano |
| `icon` | text | sim | Ícone/emoji que representa o plano (ex.: "💪") |
| `ordem_exibicao` | int4 | sim | Ordem em que o plano é exibido na listagem |
| `valor_mensal` | numeric | sim | Valor mensal do plano em reais |
| `duracao_meses` | int4 | sim | Duração do plano em meses |
| `ativo` | boolean | sim | Indica se o plano está ativo |
| `created_at` | timestamptz | gerado pelo banco | Data/hora de criação do registro |

### 4.2 Aluno

Representa um aluno matriculado em um plano da academia.

| Atributo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | uuid | gerado pelo banco | Identificador único do aluno (chave primária) |
| `planoId` | uuid | sim | **Chave estrangeira** → `planos.id` |
| `nome` | text | sim | Nome completo do aluno |
| `descricao` | text | sim | Observações sobre o aluno (objetivo, nível, etc.) |
| `email` | text | sim | E-mail do aluno |
| `telefone` | text | sim | Telefone de contato |
| `data_nascimento` | date | sim | Data de nascimento (formato `AAAA-MM-DD`) |
| `valor_mensalidade` | numeric | sim | Valor pago pelo aluno (pode diferir do valor do plano, por desconto) |
| `ativo` | boolean | sim | Indica se o aluno está ativo |
| `created_at` | timestamptz | gerado pelo banco | Data/hora de criação do registro |

### 4.3 Relacionamento

> **Um Plano pode possuir vários Alunos e cada Aluno pertence a um único Plano.**

- Trata-se de um relacionamento **1:N (um para muitos)**.
- É implementado pela coluna `alunos.planoId`, que é uma **chave estrangeira (Foreign Key)** apontando
  para `planos.id`.
- Graças à chave estrangeira:
  - não é possível cadastrar um aluno com um `planoId` inexistente (a API responde **400**);
  - não é possível excluir um plano que ainda tenha alunos vinculados (a API responde **409**).

```
┌──────────────────────┐                  ┌────────────────────────────────┐
│        planos        │                  │            alunos              │
├──────────────────────┤                  ├────────────────────────────────┤
│ id            (PK)   │───┐              │ id                      (PK)   │
│ nome                 │   │              │ planoId                 (FK)   │
│ descricao            │   └─────────────▶│ nome                           │
│ icon                 │      1      N    │ descricao                      │
│ ordem_exibicao       │                  │ email                          │
│ valor_mensal         │                  │ telefone                       │
│ duracao_meses        │                  │ data_nascimento                │
│ ativo                │                  │ valor_mensalidade              │
│ created_at           │                  │ ativo                          │
└──────────────────────┘                  │ created_at                     │
                                          └────────────────────────────────┘
```

---

## 5. Estrutura do projeto

```
academia_system/
├── .vscode/
│   └── launch.json              # Configuração de debug da API no VS Code
├── src/
│   ├── config/
│   │   └── supabase.ts          # Cria o cliente Supabase usando as variáveis de ambiente
│   ├── controller/
│   │   ├── PlanoController.ts   # Validações + requisição/resposta dos planos
│   │   └── AlunoController.ts   # Validações + requisição/resposta dos alunos
│   ├── model/
│   │   ├── Plano.ts             # Interface (modelo) do Plano
│   │   └── Aluno.ts             # Interface (modelo) do Aluno
│   ├── repositories/
│   │   ├── PlanoRepository.ts   # CRUD dos planos no Supabase
│   │   └── AlunoRepository.ts   # CRUD dos alunos no Supabase
│   ├── routes/
│   │   ├── planoRoutes.ts       # Rotas de /planos
│   │   └── alunoRoutes.ts       # Rotas de /alunos
│   ├── app.ts                   # Cria a aplicação Express e registra as rotas
│   └── server.ts                # Inicia o servidor na porta configurada
├── academia_system.postman_collection.json
├── .env                         # Variáveis de ambiente reais (NÃO versionado)
├── .env.example                 # Modelo das variáveis de ambiente (versionado)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Responsabilidade de cada camada

| Camada | Pasta | Responsabilidade |
| --- | --- | --- |
| **Model** | `src/model` | Define a **estrutura das entidades** (interfaces TypeScript com os atributos de cada tabela). |
| **Repository** | `src/repositories` | Única camada que conversa com o **banco de dados (Supabase)**. Contém os métodos `findAll`, `findById`, `findByPlano`, `create`, `update`, `remove` e `searchByKeyword`. |
| **Controller** | `src/controller` | Recebe a requisição, **valida os dados de entrada**, chama o Repository e devolve a **resposta HTTP** com o código adequado. Não conhece SQL nem tabelas. |
| **Routes** | `src/routes` | Define os **endpoints** (método HTTP + caminho) e delega cada um para a função correspondente do Controller. |
| **App/Server** | `src/app.ts` e `src/server.ts` | `app.ts` monta a aplicação Express (middleware `express.json`, rotas e rota 404); `server.ts` apenas sobe o servidor. |

**Fluxo de uma requisição:**

```
Cliente (Postman/navegador)
        │  HTTP + JSON
        ▼
server.ts → app.ts → routes/ → controller/  ── (validação) ──▶ repositories/ ──▶ Supabase/PostgreSQL
                                    ▲                                        │
                                    └──────────── JSON + status HTTP ◀────────┘
```

---

## 6. Configuração e execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) **20.6 ou superior** — recomendamos a versão **22 ou superior**
  (a biblioteca do Supabase passou a exigir o WebSocket nativo do Node.js 22+; veja
  [Solução de problemas](#solução-de-problemas))
- npm (já vem com o Node.js)
- Uma conta gratuita no [Supabase](https://supabase.com/) com o projeto de banco criado (veja a [seção 8](#8-banco-de-dados))
- (Opcional) [Postman](https://www.postman.com/downloads/) para testar os endpoints

### 1) Clonar o repositório

```bash
git clone https://github.com/<usuario>/academia_system.git
cd academia_system
```

### 2) Instalar as dependências

```bash
npm install
```

### 3) Configurar as variáveis de ambiente

Copie o arquivo de exemplo e preencha com as credenciais do seu projeto Supabase
(veja a [seção 7](#7-variáveis-de-ambiente)):

```bash
cp .env.example .env
```

`.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SECRET_KEY=sua_chave_secreta_aqui
PORT=3000
```

> ⚠️ O arquivo `.env` está no `.gitignore` e **não deve** ser enviado ao repositório.

### 4) Criar as tabelas no Supabase

Siga o passo a passo do painel do Supabase descrito na [seção 8](#8-banco-de-dados).

### 5) Iniciar a aplicação

```bash
npm run dev
```

O servidor carrega as variáveis do `.env` automaticamente e reinicia a cada alteração no código:

```
Servidor executando em http://localhost:3000
```

### Outros comandos disponíveis

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia a API em modo desenvolvimento (`--watch` + `.env`) |
| `npm run build` | Compila o TypeScript para a pasta `dist/` |
| `npm start` | Executa a versão compilada (`dist/server.js`) |
| `npm test` | Script padrão do npm (não há testes automatizados nesta entrega) |

### Testando rapidamente

```bash
curl http://localhost:3000/
```

Resposta esperada (**200**):

```json
{
  "message": "Academia System - API",
  "version": "1.0.0"
}
```

Para testar todos os endpoints, importe no Postman o arquivo
`academia_system.postman_collection.json` (Collection → Import):

1. Execute **POST - Criar Plano** e copie o `id` retornado;
2. Cole esse valor na variável **`planoId`** da collection (aba *Variables*);
3. Execute **POST - Criar Aluno** e copie o `id` retornado para a variável **`alunoId`**;
4. Execute os demais endpoints normalmente.

### Solução de problemas

| Mensagem / sintoma | Causa | Solução |
| --- | --- | --- |
| `Node.js detected but native WebSocket not found` | Versão do Node.js anterior à 22, sem `WebSocket` global | O projeto já possui compatibilidade para Node.js 20/21 (veja o comentário em `src/config/supabase.ts`). Recomenda-se atualizar para o **Node.js 22+**, que é o requisito da biblioteca do Supabase. |
| `As variáveis de ambiente SUPABASE_URL e SUPABASE_SECRET_KEY não foram configuradas` | Arquivo `.env` ausente ou incompleto | Crie o arquivo com `cp .env.example .env` e preencha com os dados do seu projeto Supabase. |
| `EADDRINUSE: address already in use :::3000` | Já existe uma aplicação usando a porta | Encerre o outro processo ou altere a porta no `.env` (`PORT=3001`). |
| Todas as rotas de `/planos` e `/alunos` respondem **500** | URL ou chave do Supabase incorretas, sem internet ou tabelas inexistentes | Confira `SUPABASE_URL` e `SUPABASE_SECRET_KEY` no painel do Supabase e verifique se as tabelas foram criadas (seção 8). O console do servidor mostra a causa exata do erro. |
| `Erro: relation "public.planos" does not exist` (no terminal) | As tabelas ainda não foram criadas no Supabase | Siga o passo a passo da [seção 8](#8-banco-de-dados). |

### Publicação do repositório Git

```bash
git init
git add .
git commit -m "feat: API REST de planos e alunos da academia com Node.js, TypeScript e Supabase"
git branch -M main
git remote add origin https://github.com/<usuario>/academia_system.git
git push -u origin main
```

Confirme com `git status` que o arquivo `.env` **não** aparece na lista de arquivos versionados
(ele é ignorado pelo `.gitignore`).

---

## 7. Variáveis de ambiente

| Variável | Obrigatória | Descrição | Exemplo |
| --- | --- | --- | --- |
| `SUPABASE_URL` | sim | URL do projeto Supabase (Dashboard → *Project Settings* → *Data API* → *Project URL*) | `https://abcdefghijkl.supabase.co` |
| `SUPABASE_SECRET_KEY` | sim | Chave secreta do Supabase (Dashboard → *Project Settings* → *API Keys* → *Secret key*). Usada **somente no servidor**. | `sua_chave_secreta_aqui` |
| `PORT` | não | Porta em que a API é executada. Se não for informada, a aplicação usa `3000`. | `3000` |

### Segurança das credenciais

- O arquivo `.env` contém dados sensíveis e está listado no `.gitignore`, portanto **não é versionado**.
- O repositório disponibiliza apenas o arquivo **`.env.example`**, com os **nomes** das variáveis e
  valores de exemplo — sem nenhuma credencial real.
- A chave secreta fica restrita ao servidor: ela nunca é enviada ao cliente nas respostas da API.
- Recomenda-se **rotacionar a chave** no painel do Supabase caso ela seja exposta acidentalmente.

---

## 8. Banco de dados

Os dados são persistidos em um banco **PostgreSQL** hospedado no **Supabase**. A estrutura é composta por
duas tabelas: `planos` e `alunos`.

### 8.1 Criar o projeto no Supabase

1. Acesse <https://supabase.com> e faça login;
2. Clique em **New project**, escolha organização, nome, senha do banco e região — aguarde a criação;
3. No menu lateral, abra **Table Editor**;
4. Em **Project Settings → Data API**, copie a **Project URL**;
5. Em **Project Settings → API Keys**, copie a **Secret key**;
6. Cole os dois valores no arquivo `.env` do projeto (`SUPABASE_URL` e `SUPABASE_SECRET_KEY`).

### 8.2 Tabela `planos`

No **Table Editor**, clique em **New table** e informe o nome `planos`. O Supabase sugere
automaticamente uma coluna `id` do tipo `int8` — **remova-a** e crie a coluna `id` do tipo `uuid`,
porque o projeto utiliza **UUID** como identificador. As demais colunas são:

| Nome da coluna | Tipo | Configuração |
| --- | --- | --- |
| `id` | `uuid` | **Primary Key** marcada; *Default value*: `gen_random_uuid()` |
| `nome` | `text` | *Is Nullable* desmarcado |
| `descricao` | `text` | *Is Nullable* desmarcado |
| `icon` | `text` | *Is Nullable* desmarcado |
| `ordem_exibicao` | `int4` | *Is Nullable* desmarcado; *Default value*: `0` |
| `valor_mensal` | `numeric` | *Is Nullable* desmarcado; *Default value*: `0` |
| `duracao_meses` | `int4` | *Is Nullable* desmarcado; *Default value*: `1` |
| `ativo` | `bool` | *Is Nullable* desmarcado; *Default value*: `true` |
| `created_at` | `timestamptz` | *Default value*: `now()` |

### 8.3 Tabela `alunos`

Crie uma segunda tabela com o nome `alunos`:

| Nome da coluna | Tipo | Configuração |
| --- | --- | --- |
| `id` | `uuid` | **Primary Key** marcada; *Default value*: `gen_random_uuid()` |
| `planoId` | `uuid` | *Is Nullable* desmarcado; **Foreign Key** → `planos.id` (veja abaixo) |
| `nome` | `text` | *Is Nullable* desmarcado |
| `descricao` | `text` | *Is Nullable* desmarcado |
| `email` | `text` | *Is Nullable* desmarcado |
| `telefone` | `text` | *Is Nullable* desmarcado |
| `data_nascimento` | `date` | *Is Nullable* desmarcado |
| `valor_mensalidade` | `numeric` | *Is Nullable* desmarcado; *Default value*: `0` |
| `ativo` | `bool` | *Is Nullable* desmarcado; *Default value*: `true` |
| `created_at` | `timestamptz` | *Default value*: `now()` |

**Criando a chave estrangeira:** ao editar a coluna `planoId`, use a opção **Add foreign key relation**
(*Foreign key relation* → tabela `planos` → coluna `id`). O Supabase cria a constraint
`alunos_planoId_fkey`, que é exatamente o relacionamento 1:N descrito na [seção 4](#4-entidades-e-relacionamento).

> 💡 **Atenção à grafia do nome `planoId`:** o PostgreSQL diferencia maiúsculas de minúsculas quando o
> nome é criado entre aspas e o Supabase preserva a grafia digitada. Por isso, crie a coluna exatamente
> como `planoId` — é esse o nome usado pelo código da aplicação.

> 🔐 **Row Level Security (RLS):** pode permanecer habilitado ou desabilitado. A API acessa o banco
> **somente pelo servidor**, utilizando a *Secret key*, que tem permissão de serviço e não é bloqueada
> pelo RLS. Nenhuma chave é exposta ao cliente.

### 8.4 Dados de exemplo (opcional, para demonstração)

O `id` é gerado automaticamente pelo banco. Se quiser popular as tabelas, use o **Table Editor → Insert row**
(ou os endpoints `POST` da API). Exemplos:

**`planos`**

| nome | descricao | icon | ordem_exibicao | valor_mensal | duracao_meses | ativo |
| --- | --- | --- | --- | --- | --- | --- |
| Musculação | Treino de força com pesos livres e máquinas. | 💪 | 1 | 129.90 | 12 | true |
| Cross Training | Treino funcional de alta intensidade. | 🏋️ | 2 | 189.90 | 6 | true |
| Funcional | Aulas em grupo com foco em condicionamento. | 🤸 | 3 | 149.90 | 6 | true |
| Natação | Aulas de natação para adultos. | 🏊 | 4 | 219.90 | 12 | false |

**`alunos`** (o campo `planoId` deve receber o `id` de um plano já cadastrado)

| nome | descricao | email | telefone | data_nascimento | valor_mensalidade | ativo | planoId |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Eduardo Lopes | Aluno iniciante, foco em hipertrofia. | eduardo.lopes@email.com | (41) 99999-1111 | 2003-05-14 | 129.90 | true | *id de "Musculação"* |
| Diogo Yudi | Aluno intermediário, foco em condicionamento. | diogo.yudi@email.com | (41) 98888-2222 | 2002-11-02 | 189.90 | true | *id de "Cross Training"* |

### 8.5 Como a aplicação acessa o banco

O arquivo `src/config/supabase.ts` cria o cliente com as variáveis de ambiente (e valida se elas
foram configuradas):

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
        "As variáveis de ambiente SUPABASE_URL e SUPABASE_SECRET_KEY não foram configuradas. " +
        "Verifique o arquivo .env (use o .env.example como modelo)."
    );
}

const supabase = createClient(
    supabaseUrl,
    supabaseSecretKey,
    compatibilidadeComNodeAntigo,
);

export default supabase;
```

Cada consulta é montada nos Repositories — por exemplo, a busca dos planos ordenados:

```ts
const { data, error } = await supabase
    .from("planos")
    .select("*")
    .order("ordem_exibicao", { ascending: true });
```

---

## 9. Documentação dos endpoints

**Base URL:** `http://localhost:3000`

### 9.1 Endpoint raiz

| Método | Endpoint | Descrição | Corpo da requisição |
| --- | --- | --- | --- |
| GET | `/` | Retorna o nome e a versão da API (verificação de disponibilidade) | não |

### 9.2 Planos

| Método | Endpoint | Descrição | Corpo da requisição |
| --- | --- | --- | --- |
| GET | `/planos` | Lista todos os planos, ordenados por `ordem_exibicao` | não |
| GET | `/planos/:id` | Consulta um plano pelo ID (UUID) | não |
| GET | `/planos/search?keyword=<termo>` | Pesquisa planos por palavra-chave em `nome` e `descricao` | não |
| POST | `/planos` | Cadastra um novo plano | [JSON de exemplo](#101-criar-plano-post-planos) |
| PUT | `/planos/:id` | Atualiza um plano | [JSON de exemplo](#102-atualizar-plano-put-planosid) |
| DELETE | `/planos/:id` | Remove um plano | não |

**Dados necessários no POST/PUT de Plano:** `nome` (texto), `descricao` (texto), `icon` (texto),
`ordem_exibicao` (inteiro ≥ 0), `valor_mensal` (número ≥ 0), `duracao_meses` (inteiro ≥ 1),
`ativo` (booleano).

### 9.3 Alunos

| Método | Endpoint | Descrição | Corpo da requisição |
| --- | --- | --- | --- |
| GET | `/alunos` | Lista todos os alunos, ordenados por `nome` | não |
| GET | `/alunos/:id` | Consulta um aluno pelo ID (UUID) | não |
| GET | `/alunos/plano/:planoId` | Lista os alunos de um plano específico (relacionamento) | não |
| GET | `/alunos/search?keyword=<termo>` | Pesquisa alunos por palavra-chave em `nome` e `email` | não |
| POST | `/alunos` | Cadastra um novo aluno | [JSON de exemplo](#103-criar-aluno-post-alunos) |
| PUT | `/alunos/:id` | Atualiza um aluno | [JSON de exemplo](#104-atualizar-aluno-put-alunosid) |
| DELETE | `/alunos/:id` | Remove um aluno | não |

**Dados necessários no POST/PUT de Aluno:** `planoId` (UUID de um plano existente), `nome` (texto),
`descricao` (texto), `email` (e-mail válido), `telefone` (texto), `data_nascimento` (data no formato
`AAAA-MM-DD`, não pode ser futura), `valor_mensalidade` (número ≥ 0), `ativo` (booleano).

> O campo `id` **não** é enviado nas requisições: ele é gerado automaticamente pelo banco de dados.

### 9.4 Resumo geral das rotas (CRUD)

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| GET | `/planos` | Listar planos |
| GET | `/planos/:id` | Consultar plano por ID |
| POST | `/planos` | Criar plano |
| PUT | `/planos/:id` | Atualizar plano |
| DELETE | `/planos/:id` | Excluir plano |
| GET | `/alunos` | Listar alunos |
| GET | `/alunos/:id` | Consultar aluno por ID |
| POST | `/alunos` | Criar aluno |
| PUT | `/alunos/:id` | Atualizar aluno |
| DELETE | `/alunos/:id` | Excluir aluno |

---

## 10. Exemplos de requisições

### 10.1 Criar Plano — `POST /planos`

Corpo da requisição:

```json
{
  "nome": "Musculação",
  "descricao": "Treino de força com pesos livres e máquinas.",
  "icon": "💪",
  "ordem_exibicao": 1,
  "valor_mensal": 129.9,
  "duracao_meses": 12,
  "ativo": true
}
```

Resposta (**201 Created**):

```json
{
  "id": "f358a43b-43af-4387-a433-c376a385ca27",
  "nome": "Musculação",
  "descricao": "Treino de força com pesos livres e máquinas.",
  "icon": "💪",
  "ordem_exibicao": 1,
  "valor_mensal": 129.9,
  "duracao_meses": 12,
  "ativo": true
}
```

### 10.2 Atualizar Plano — `PUT /planos/:id`

Corpo da requisição (envia o recurso completo):

```json
{
  "nome": "Musculação Premium",
  "descricao": "Treino de força com acompanhamento de personal trainer.",
  "icon": "💪",
  "ordem_exibicao": 1,
  "valor_mensal": 199.9,
  "duracao_meses": 12,
  "ativo": true
}
```

Resposta (**200 OK**): o plano atualizado em JSON.

### 10.3 Criar Aluno — `POST /alunos`

Corpo da requisição (o `planoId` deve ser o UUID de um plano já cadastrado):

```json
{
  "planoId": "f358a43b-43af-4387-a433-c376a385ca27",
  "nome": "Eduardo Lopes",
  "descricao": "Aluno iniciante, com foco em hipertrofia.",
  "email": "eduardo.lopes@email.com",
  "telefone": "(41) 99999-1111",
  "data_nascimento": "2003-05-14",
  "valor_mensalidade": 129.9,
  "ativo": true
}
```

Resposta (**201 Created**):

```json
{
  "id": "c7e5fd29-539e-43a4-bdcb-ec36c18ab465",
  "planoId": "f358a43b-43af-4387-a433-c376a385ca27",
  "nome": "Eduardo Lopes",
  "descricao": "Aluno iniciante, com foco em hipertrofia.",
  "email": "eduardo.lopes@email.com",
  "telefone": "(41) 99999-1111",
  "data_nascimento": "2003-05-14",
  "valor_mensalidade": 129.9,
  "ativo": true
}
```

### 10.4 Atualizar Aluno — `PUT /alunos/:id`

```json
{
  "planoId": "f358a43b-43af-4387-a433-c376a385ca27",
  "nome": "Eduardo Lopes",
  "descricao": "Aluno intermediário, com foco em hipertrofia.",
  "email": "eduardo.lopes@email.com",
  "telefone": "(41) 99999-1111",
  "data_nascimento": "2003-05-14",
  "valor_mensalidade": 199.9,
  "ativo": true
}
```

Resposta (**200 OK**): o aluno atualizado em JSON.

### 10.5 Exemplo de erro de validação — `POST /alunos`

Requisição com dados inválidos:

```json
{
  "planoId": "abc",
  "nome": "",
  "email": "email-invalido",
  "data_nascimento": "14/05/2003",
  "valor_mensalidade": -5,
  "ativo": "sim"
}
```

Resposta (**400 Bad Request**) — todos os problemas encontrados são retornados de uma só vez:

```json
{
  "message": "Dados inválidos.",
  "erros": [
    "O campo 'planoId' é obrigatório e deve conter o UUID de um plano cadastrado.",
    "O campo 'nome' é obrigatório e deve ser um texto.",
    "O campo 'descricao' é obrigatório e deve ser um texto.",
    "O campo 'email' é obrigatório e deve conter um e-mail válido.",
    "O campo 'telefone' é obrigatório e deve conter um telefone válido.",
    "O campo 'data_nascimento' é obrigatório e deve estar no formato AAAA-MM-DD.",
    "O campo 'valor_mensalidade' é obrigatório e deve ser um número maior ou igual a zero.",
    "O campo 'ativo' é obrigatório e deve ser um booleano (true ou false)."
  ]
}
```

### 10.6 Exemplos de resposta de erro

**Aluno não encontrado — `GET /alunos/:id` (404 Not Found):**

```json
{
  "message": "Aluno não encontrado."
}
```

**Excluir plano com alunos vinculados — `DELETE /planos/:id` (409 Conflict):**

```json
{
  "message": "Não foi possível remover o plano. Existem alunos vinculados a ele."
}
```

**Pesquisa sem palavra-chave — `GET /planos/search` (400 Bad Request):**

```json
{
  "message": "Palavra-chave não informada."
}
```

**Rota inexistente — `GET /rota-qualquer` (404 Not Found):**

```json
{
  "message": "Rota não encontrada."
}
```

---

## 11. Códigos de resposta HTTP utilizados

| Código | Quando é retornado |
| --- | --- |
| **200 OK** | Consultas (`GET`) e atualizações (`PUT`) realizadas com sucesso; exclusão (`DELETE`) concluída |
| **201 Created** | Registro criado com sucesso (`POST`) |
| **400 Bad Request** | Dados inválidos na requisição (campos obrigatórios ausentes, tipos errados, e-mail/data inválidos, `planoId` inexistente) ou palavra-chave não informada na pesquisa |
| **404 Not Found** | Registro inexistente para o `id` informado, ID não informado ou rota não encontrada |
| **409 Conflict** | Tentativa de excluir um plano que ainda possui alunos vinculados (violação de chave estrangeira) |
| **500 Internal Server Error** | Falha inesperada na comunicação com o banco de dados |

> Os códigos são definidos explicitamente nos Controllers (ex.: `res.status(201).json(plano)`), e os
> erros são tratados com `try/catch` em todas as funções, registrando a causa no console do servidor
> sem expor detalhes internos ao cliente.

---

## 12. Funcionalidades adicionais

Além do CRUD completo exigido, foram implementadas melhorias previstas como evolução da solução:

| Funcionalidade | Endpoint | Descrição |
| --- | --- | --- |
| **Pesquisa por palavra-chave (Planos)** | `GET /planos/search?keyword=muscula` | Busca planos cujo `nome` ou `descricao` contenham o termo informado (busca parcial, sem diferenciar maiúsculas/minúsculas) |
| **Pesquisa por palavra-chave (Alunos)** | `GET /alunos/search?keyword=eduardo` | Busca alunos por `nome` ou `email` |
| **Filtro por relacionamento** | `GET /alunos/plano/:planoId` | Lista somente os alunos matriculados em um plano específico |
| **Ordenação** | — | Planos ordenados por `ordem_exibicao`; alunos ordenados por `nome` |
| **Rota de verificação** | `GET /` | Informa nome e versão da API |
| **Tratamento de rota inexistente** | — | Qualquer rota não registrada responde **404** com JSON padronizado |
| **Integridade referencial** | — | Bloqueio de exclusão de plano com alunos vinculados (**409**) e de cadastro de aluno com plano inexistente (**400**) |

---

## 13. Roteiro sugerido de demonstração

Sequência sugerida para demonstração e arguição do projeto:

1. **Apresentar o domínio e as entidades** (seção 4): problema, planos, alunos e o relacionamento 1:N.
2. **Mostrar a estrutura de pastas** (seção 5) e explicar o caminho da requisição:
   `routes → controller → repository → Supabase`.
3. **Mostrar as tabelas no Supabase** (`planos` e `alunos`), destacando a coluna `id` do tipo `uuid`,
   a chave primária e a chave estrangeira `alunos.planoId → planos.id`.
4. **Executar `npm run dev`** e abrir `GET /` no Postman para verificar que a API está no ar.
5. **CRUD de Planos:** `POST` (201) → `GET` (200) → `GET /planos/:id` (200) → `PUT` (200) → `DELETE` (200).
6. **CRUD de Alunos:** `POST` usando o `planoId` de um plano existente (201) → `GET` (200) →
   `PUT` (200) → `DELETE` (200).
7. **Demonstrar as validações:** enviar um `POST /alunos` com e-mail inválido e data no formato
   `DD/MM/AAAA` para exibir a resposta **400** com a lista de erros.
8. **Demonstrar o tratamento de erros e a integridade referencial:**
   - `GET /alunos/<uuid-inexistente>` → **404**;
   - `DELETE /planos/<id-do-plano-com-alunos>` → **409**;
   - `GET /rota-inexistente` → **404**.
9. **Demonstrar as funcionalidades adicionais:** pesquisa por palavra-chave e filtro de alunos por plano.
10. **Mostrar o `.gitignore` e o `.env.example`**, explicando que as credenciais reais ficam apenas no
    `.env` local e nunca são versionadas.

---

Desenvolvido para a APS da disciplina de **Desenvolvimento Back-End** — 2026.
