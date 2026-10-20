# Eventos Escolares

Aplicação web do **Grupo 04** da disciplina Programação para Internet.

## Integrantes

- _Nome do integrante 1_
- _Nome do integrante 2_
- _Nome do integrante 3_
- _Nome do integrante 4_

## Problema atendido e público

Os eventos da instituição (mostras, feiras, palestras e apresentações culturais) costumam ser divulgados de forma dispersa. O sistema reúne esses eventos em uma agenda única, consultável por estudantes, famílias, professores e demais membros da comunidade escolar.

## Entidade principal: `Evento`

Definida em `models/evento.js` (tabela `eventos`).

| Campo       | Tipo       | Obrigatório | Finalidade                    |
|-------------|------------|-------------|-------------------------------|
| `id`        | INTEGER    | automático  | Identificador do registro     |
| `titulo`    | STRING     | sim         | Identificar o evento          |
| `data`      | DATEONLY   | sim         | Registrar a data              |
| `horario`   | STRING     | sim         | Informar o horário            |
| `local`     | STRING     | sim         | Informar onde acontecerá      |
| `descricao` | TEXT       | sim         | Explicar o evento             |

Nenhum campo adicional foi criado.

## Tecnologias

Node.js, Express, Express Handlebars, Sequelize, SQLite, Node Test e Supertest.

## Pré-requisitos

- Node.js 20 ou superior (testado no Node 22)
- NPM

## Instalação

```bash
npm install
```

## Execução

```bash
npm start        # inicia em http://localhost:3000
npm run dev      # reinicia automaticamente ao salvar arquivos
```

A porta pode ser alterada pela variável de ambiente `PORT`. Ao iniciar, o `server.js` sincroniza o banco (`database.sqlite`, criado automaticamente) e insere os seis eventos iniciais **somente se a tabela estiver vazia**, evitando duplicação a cada reinicialização. Para recriar os dados do zero, basta apagar o arquivo `database.sqlite`.

## Testes

```bash
npm test
```

Os testes usam um banco SQLite em memória, então não alteram o `database.sqlite`. São verificados: página inicial e destaques, `/saude`, listagem e ordenação, detalhamento existente, ids inexistentes e inválidos (`99999`, `abc`, `0`, `-1`), rota desconhecida, não duplicação dos dados e o tratamento de erro 500 sem exposição de detalhes técnicos.

## Rotas

| Método | Rota            | Resposta                                    |
|--------|-----------------|---------------------------------------------|
| GET    | `/`             | Página inicial com três destaques do banco  |
| GET    | `/saude`        | `{ "status": "ok" }`                        |
| GET    | `/eventos`      | Listagem em linha do tempo, por data        |
| GET    | `/eventos/:id`  | Detalhamento de um evento                   |
| GET    | qualquer outra  | 404 — "Evento não encontrado"               |

## Organização dos diretórios

```
eventos-escolares/
├── app.js                 configuração do Express, Handlebars, helpers, middlewares e erros
├── server.js              prepara o banco e inicia o servidor
├── models/
│   ├── index.js           conexão Sequelize, dados iniciais e prepararBanco()
│   └── evento.js          definição da entidade Evento
├── routes/
│   ├── index.js           GET / e GET /saude
│   └── eventos.js         GET /eventos e GET /eventos/:id
├── views/
│   ├── layouts/main.hbs   estrutura comum (header, nav, main, footer)
│   ├── partials/componente-evento.hbs   item da linha do tempo
│   ├── eventos/listar.hbs
│   ├── eventos/detalhar.hbs
│   ├── index.hbs
│   ├── 404.hbs
│   └── erro.hbs
├── public/
│   ├── images/agenda.svg
│   └── stylesheets/style.css
└── test/app.test.js
```

## Fluxo de uma requisição

O navegador solicita um endereço → o Express recebe a requisição → os middlewares (`express.json`, `express.urlencoded`, `express.static` e o registrador próprio) atuam → a rota valida o `id`, quando houver → o Model `Evento` consulta o SQLite via Sequelize (`findAll` / `findByPk`) → a rota envia os dados para a view → o Handlebars gera o HTML com layout, partial, `{{#each}}`, `{{#if}}` e helpers → o Express devolve a resposta.

## Correspondência com os wireframes

| Wireframe       | Implementação |
|-----------------|---------------|
| Página inicial  | `index.hbs`: composição dividida, texto e botão "Acessar listagem" à esquerda, área visual (`agenda.svg`) à direita e três "Destaques do portal" vindos do banco. |
| Listagem        | `eventos/listar.hbs` + partial: linha do tempo vertical com data abreviada à esquerda, marcador circular e bloco com título, horário, local, resumo e botão de detalhes. Contador de registros no topo. |
| Detalhamento    | `eventos/detalhar.hbs`: trilha de navegação, painel principal com todos os campos rotulados e lateral com a data destacada (ex.: "12 OUT") e botão "Voltar para a lista". |
| Erro 404        | `404.hbs`: "404" à esquerda, "Evento não encontrado", explicação e botão para `/eventos`. |

## Decisões e adaptações

- **Ordenação:** data crescente (`order: [["data", "ASC"]]`), conforme exigido.
- **Destaques:** os três primeiros eventos por data.
- **`DATEONLY`:** o evento só precisa do dia; o horário fica em campo de texto próprio ("08h às 12h"), o que permite intervalos.
- **Helpers:** `formatarData` ("12 de outubro de 2026"), `dataAbreviada` ("12 OUT", indicador da linha do tempo e da lateral) e `anoAtual` (rodapé). As datas são lidas como texto `AAAA-MM-DD` para evitar deslocamento de fuso horário.
- **Condicionais `{{#if}}`:** tratam lista de eventos vazia e ausência de destaques.
- **Indicadores textuais:** a data aparece sempre como texto, não dependendo apenas de cor.
- **Erro 500:** o erro é registrado no terminal (`console.error`) e a página `erro.hbs` mostra apenas uma mensagem genérica.
- **Testes:** usam `DB_STORAGE=":memory:"` para isolar o banco de teste.
