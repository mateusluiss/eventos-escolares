const path = require("node:path");
const express = require("express");
const { engine } = require("express-handlebars");
const { sequelize, Evento } = require("./models");
const indexRouter = require("./routes/index");
const eventosRouter = require("./routes/eventos");

const MESES_ABREVIADOS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

function createApp() {
  const app = express();

  app.engine(
    "hbs",
    engine({
      extname: ".hbs",
      defaultLayout: "main",
      layoutsDir: path.join(__dirname, "views", "layouts"),
      partialsDir: path.join(__dirname, "views", "partials"),
      helpers: {
        // "2026-10-12" -> "12 de outubro de 2026"
        // O campo DATEONLY é lido como meia-noite em UTC; por isso o
        // timeZone "UTC" evita que a data apareça um dia antes no Brasil.
        formatarData(valor) {
          return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "long",
            timeZone: "UTC"
          }).format(new Date(valor));
        },
        // "2026-10-12" -> "12 OUT" (indicador da linha do tempo e da lateral)
        dataAbreviada(valor) {
          const data = new Date(valor);
          const dia = String(data.getUTCDate()).padStart(2, "0");
          return `${dia} ${MESES_ABREVIADOS[data.getUTCMonth()]}`;
        },
        // Reduz a descrição a um resumo para a listagem, sem cortar palavras
        resumir(texto, limite) {
          if (texto.length <= limite) {
            return texto;
          }
          const trecho = texto.slice(0, limite);
          const semPalavraCortada = trecho.slice(0, trecho.lastIndexOf(" "));
          return `${semPalavraCortada.replace(/[,;:.]$/, "")}...`;
        }
      }
    })
  );

  app.set("view engine", "hbs");
  app.set("views", path.join(__dirname, "views"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, "public")));

  // Middleware próprio: registra horário, método e endereço de cada requisição
  app.use((req, res, next) => {
    const horario = new Date().toLocaleTimeString("pt-BR");
    console.log(`[${horario}] [${req.method}] ${req.originalUrl}`);
    next();
  });

  app.use("/", indexRouter);
  app.use("/eventos", eventosRouter);

  // 404: registrado depois de todas as rotas válidas
  app.use((req, res) => {
    res.status(404).render("404", {
      titulo: "Evento não encontrado",
      caminho: req.originalUrl
    });
  });

  // 500: registrado por último e com quatro parâmetros
  app.use((erro, req, res, next) => {
    console.error("Erro tratado pela aplicação:", erro);

    if (res.headersSent) {
      return next(erro);
    }

    return res.status(500).render("erro", {
      titulo: "Erro interno",
      mensagem:
        "Ocorreu uma falha inesperada e não foi possível concluir a solicitação. Tente novamente em instantes."
    });
  });

  return app;
}

async function prepararBanco() {
  await sequelize.authenticate();
  await sequelize.sync();

  const quantidade = await Evento.count();
  if (quantidade === 0) {
    // Os registros são inseridos fora da ordem cronológica de propósito:
    // assim a listagem demonstra a ordenação por data feita no findAll().
    await Evento.bulkCreate([
      {
        titulo: "Mostra tecnológica",
        data: "2026-10-12",
        horario: "08h às 12h",
        local: "Laboratório de Informática",
        descricao:
          "Apresentação de aplicativos, robôs e sistemas desenvolvidos pelos estudantes dos cursos técnicos, com demonstrações abertas a toda a comunidade escolar."
      },
      {
        titulo: "Feira de profissões",
        data: "2026-11-05",
        horario: "09h às 16h",
        local: "Ginásio poliesportivo",
        descricao:
          "Estandes com profissionais de diversas áreas que conversam com os estudantes sobre rotina de trabalho, formação acadêmica e oportunidades no mercado."
      },
      {
        titulo: "Semana de ciências",
        data: "2026-10-15",
        horario: "13h às 17h",
        local: "Auditório principal",
        descricao:
          "Palestras, experimentos e oficinas de física, química e biologia conduzidos por professores da instituição e convidados de universidades da região."
      },
      {
        titulo: "Exposição de projetos",
        data: "2026-11-26",
        horario: "14h às 18h",
        local: "Biblioteca central",
        descricao:
          "Exibição dos projetos de pesquisa e extensão concluídos no ano, com banners, maquetes e conversa com as equipes responsáveis por cada trabalho."
      },
      {
        titulo: "Festival cultural",
        data: "2026-10-18",
        horario: "18h às 21h",
        local: "Pátio central",
        descricao:
          "Noite de música, dança, teatro e poesia com apresentações das turmas e de grupos artísticos convidados da comunidade."
      },
      {
        titulo: "Reunião de integração",
        data: "2026-11-12",
        horario: "19h às 20h30",
        local: "Sala de convivência",
        descricao:
          "Encontro entre famílias, estudantes, professores e coordenação para apresentar o calendário do semestre e acolher os novos alunos."
      }
    ]);
  }
}

module.exports = { createApp, prepararBanco };
