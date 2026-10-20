// Banco em memória: os testes não alteram o database.sqlite da aplicação
process.env.DB_STORAGE = ":memory:";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { createApp } = require("../app");
const { prepararBanco, sequelize, Evento } = require("../models");

let app;

before(async () => {
    await prepararBanco();
    app = createApp();
});

after(async () => {
    await sequelize.close();
});

test("GET / apresenta a página inicial com o título do projeto", async () => {
    const resposta = await request(app).get("/");
    assert.equal(resposta.status, 200);
    assert.match(resposta.text, /Eventos Escolares/);
    assert.match(resposta.text, /Explore eventos escolares/);
});

test("GET / apresenta três destaques vindos do banco", async () => {
    const resposta = await request(app).get("/");
    const quantidade = (resposta.text.match(/class="destaque"/g) || []).length;
    assert.equal(quantidade, 3);
    assert.match(resposta.text, /Mostra tecnológica/);
});

test("GET /saude responde JSON com status ok", async () => {
    const resposta = await request(app).get("/saude");
    assert.equal(resposta.status, 200);
    assert.deepEqual(resposta.body, { status: "ok" });
});

test("GET /eventos apresenta a listagem com registros iniciais", async () => {
    const resposta = await request(app).get("/eventos");
    assert.equal(resposta.status, 200);
    assert.match(resposta.text, /Eventos cadastrados/);
    assert.match(resposta.text, /Semana de ciências/);
    assert.match(resposta.text, /12 OUT/);
});

test("GET /eventos ordena por data crescente", async () => {
    const resposta = await request(app).get("/eventos");
    const posMostra = resposta.text.indexOf("Mostra tecnológica");
    const posExposicao = resposta.text.indexOf("Exposição de projetos");
    assert.ok(posMostra > -1 && posMostra < posExposicao);
});

test("GET /eventos/1 abre um registro existente", async () => {
    const resposta = await request(app).get("/eventos/1");
    assert.equal(resposta.status, 200);
    assert.match(resposta.text, /Mostra tecnológica/);
    assert.match(resposta.text, /Laboratório de Informática/);
    assert.match(resposta.text, /Voltar para a lista/);
});

test("GET /eventos/99999 responde 404", async () => {
    const resposta = await request(app).get("/eventos/99999");
    assert.equal(resposta.status, 404);
    assert.match(resposta.text, /Evento não encontrado/);
});

test("GET /eventos/abc responde 404", async () => {
    const resposta = await request(app).get("/eventos/abc");
    assert.equal(resposta.status, 404);
});

test("GET /eventos/0 e /eventos/-1 respondem 404", async () => {
    assert.equal((await request(app).get("/eventos/0")).status, 404);
    assert.equal((await request(app).get("/eventos/-1")).status, 404);
});

test("rota inexistente responde 404 com página contextualizada", async () => {
    const resposta = await request(app).get("/rota-inexistente");
    assert.equal(resposta.status, 404);
    assert.match(resposta.text, /Evento não encontrado/);
    assert.match(resposta.text, /href="\/eventos"/);
});

test("dados iniciais não são duplicados ao preparar o banco novamente", async () => {
    await prepararBanco();
    assert.equal(await Evento.count(), 6);
});

test("falha interna responde 500 sem expor detalhes técnicos", async (t) => {
    t.mock.method(Evento, "findAll", async () => {
        throw new Error("SQLITE_ERROR: falha simulada em /caminho/interno");
    });
    t.mock.method(console, "error", () => {});

    const resposta = await request(app).get("/eventos");
    assert.equal(resposta.status, 500);
    assert.match(resposta.text, /falha inesperada/);
    assert.doesNotMatch(resposta.text, /SQLITE_ERROR|caminho\/interno/);
});
