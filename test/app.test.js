const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp, prepararBanco } = require("../app");
const { sequelize, Evento } = require("../models");

let app;

test.before(async () => {
  await prepararBanco();
  app = createApp();
});

test.after(async () => {
  await sequelize.close();
});

test("GET / apresenta a página inicial com o título do projeto", async () => {
  const resposta = await request(app).get("/");

  assert.equal(resposta.status, 200);
  assert.match(resposta.text, /Eventos Escolares/);
  assert.match(resposta.text, /Explore eventos escolares/);
  assert.match(resposta.text, /href="\/eventos"/);
});

test("GET / apresenta três destaques vindos do banco", async () => {
  const resposta = await request(app).get("/");
  const destaques = resposta.text.match(/class="cartao-destaque"/g) || [];

  assert.equal(destaques.length, 3);
  assert.match(resposta.text, /Mostra tecnológica/);
  assert.match(resposta.text, /Semana de ciências/);
  assert.match(resposta.text, /Festival cultural/);
});

test("GET /saude responde status 200 e JSON com status ok", async () => {
  const resposta = await request(app).get("/saude");

  assert.equal(resposta.status, 200);
  assert.match(resposta.headers["content-type"], /application\/json/);
  assert.equal(resposta.body.status, "ok");
});

test("GET /eventos apresenta a listagem com os registros iniciais", async () => {
  const resposta = await request(app).get("/eventos");

  assert.equal(resposta.status, 200);
  assert.match(resposta.text, /Eventos cadastrados/);
  assert.match(resposta.text, /Feira de profissões/);
  assert.match(resposta.text, /6 registro\(s\)/);
});

test("GET /eventos mostra a data formatada como indicador", async () => {
  const resposta = await request(app).get("/eventos");

  assert.match(resposta.text, /12 OUT/);
  assert.match(resposta.text, /26 NOV/);
});

test("GET /eventos ordena os eventos por data crescente", async () => {
  const resposta = await request(app).get("/eventos");
  const ordemEsperada = [
    "Mostra tecnológica",
    "Semana de ciências",
    "Festival cultural",
    "Feira de profissões",
    "Reunião de integração",
    "Exposição de projetos"
  ];
  const posicoes = ordemEsperada.map((titulo) => resposta.text.indexOf(titulo));

  assert.ok(posicoes.every((posicao) => posicao > -1));
  assert.deepEqual(posicoes, [...posicoes].sort((a, b) => a - b));
});

test("GET /eventos gera um link de detalhes para cada evento", async () => {
  const resposta = await request(app).get("/eventos");
  const links = resposta.text.match(/href="\/eventos\/\d+"/g) || [];

  assert.equal(links.length, 6);
});

test("GET /eventos informa quando não há eventos cadastrados", async (t) => {
  t.mock.method(Evento, "findAll", async () => []);

  const resposta = await request(app).get("/eventos");

  assert.equal(resposta.status, 200);
  assert.match(resposta.text, /Nenhum evento foi encontrado/);
});

test("GET /eventos/1 abre um evento existente com todos os campos", async () => {
  const resposta = await request(app).get("/eventos/1");

  assert.equal(resposta.status, 200);
  assert.match(resposta.text, /Mostra tecnológica/);
  assert.match(resposta.text, /12 de outubro de 2026/);
  assert.match(resposta.text, /08h às 12h/);
  assert.match(resposta.text, /Laboratório de Informática/);
  assert.match(resposta.text, /Apresentação de aplicativos, robôs e sistemas/);
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
  assert.match(resposta.text, /Evento não encontrado/);
});

test("GET /eventos/0 e /eventos/-1 respondem 404", async () => {
  const zero = await request(app).get("/eventos/0");
  const negativo = await request(app).get("/eventos/-1");

  assert.equal(zero.status, 404);
  assert.equal(negativo.status, 404);
});

test("rota inexistente responde 404 com página contextualizada", async () => {
  const resposta = await request(app).get("/rota-inexistente");

  assert.equal(resposta.status, 404);
  assert.match(resposta.text, /Evento não encontrado/);
  assert.match(resposta.text, /href="\/eventos"/);
});

test("os dados iniciais não são duplicados ao preparar o banco novamente", async () => {
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

test("arquivos estáticos (CSS e imagem) são disponibilizados", async () => {
  const css = await request(app).get("/stylesheets/style.css");
  const imagem = await request(app).get("/images/agenda-eventos.svg");

  assert.equal(css.status, 200);
  assert.match(css.headers["content-type"], /text\/css/);
  assert.equal(imagem.status, 200);
});
