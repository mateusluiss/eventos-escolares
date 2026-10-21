# Eventos Escolares

Trabalho do Grupo 04 da disciplina **Programação para Internet (PPI)**, 3ª etapa.

- **Turma:** INFO 4M
- **Professor:** Andre Vieira dos Santos
- **Integrantes:**
  - Mateus Luis Nogueira de Lima
  - Lian Guilherme Silva Medeiros
  - Ryan Gabriel Viturino da Costa
  - Israelly Lorrany Nogueira de Almeida

## Sobre o projeto

Agenda de eventos acadêmicos, científicos e culturais da instituição. O sistema reúne os eventos em um só lugar, organizados por data, para que **estudantes, professores e famílias** consultem cada um com seus detalhes.

O projeto foi construído a partir do `mural-servidor-aula-02`, apresentado em aula, e adaptado ao domínio de eventos.

## Entidade `Evento`

| Campo | Tipo | Finalidade |
| --- | --- | --- |
| `titulo` | STRING | Nome do evento |
| `data` | DATEONLY | Data do evento (usada na ordenação) |
| `horario` | STRING | Horário (ex.: `08h às 12h`) |
| `local` | STRING | Onde acontecerá |
| `descricao` | TEXT | Explicação do evento |

Todos os campos são obrigatórios (`allowNull: false`).

## Tecnologias

Node.js, Express, Handlebars, Sequelize, SQLite, Node Test e Supertest.

## Como executar

Pré-requisito: **Node.js 18 ou superior**.

```bash
npm install   # instala as dependências
npm start     # inicia em http://localhost:3000
npm test      # executa os testes
```

O banco `database/eventos.sqlite` é criado automaticamente ao iniciar, com seis eventos. Os dados só são inseridos se a tabela estiver vazia, então reiniciar o servidor não duplica os registros.

## Rotas

| Rota | Resposta |
| --- | --- |
| `GET /` | Página inicial com três destaques do banco |
| `GET /eventos` | Listagem dos eventos por data crescente |
| `GET /eventos/:id` | Detalhamento de um evento |
| `GET /sobre` | Informações do projeto e integrantes |
| `GET /saude` | JSON `{ "status": "ok" }` |
| Outras rotas | Página 404 "Evento não encontrado" |

Identificadores inválidos (`abc`, `0`, `-1`) ou inexistentes (`99999`) também retornam 404. Falhas internas mostram a página de erro 500 sem detalhes técnicos.

## Estrutura

```
eventos-escolares/
├── app.js            # configuração do Express, helpers, middlewares e banco
├── server.js         # inicia o servidor
├── models/           # conexão e entidade Evento
├── routes/           # index.js (/, /sobre, /saude) e eventos.js
├── views/            # layout, partials, páginas, 404 e erro
├── public/           # CSS e imagens
├── test/             # testes automatizados
└── docs/capturas/    # capturas das telas
```

## Wireframes

- **Página inicial:** composição dividida, com apresentação à esquerda, imagem à direita e três destaques abaixo.
- **Listagem:** linha do tempo vertical, com a data à esquerda e o bloco do evento à direita.
- **Detalhamento:** painel com os campos do evento e a data em destaque na lateral.
- **Erro 404:** "404" à esquerda, mensagem e botão de retorno à direita.

As capturas estão em `docs/capturas`.

## Decisões do grupo

- A listagem e os destaques usam `findAll()` com ordenação por data crescente.
- Foram criados os helpers `formatarData` (12 de outubro de 2026), `dataAbreviada` (12 OUT) e `resumir` (resumo da descrição).
- A página **Sobre** foi criada porque o menu do wireframe tem esse item e o enunciado não permite links sem destino.
- A identidade visual usa laranja e vermelho queimado, com layout responsivo para computador, tablet e celular.
