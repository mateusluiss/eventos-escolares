const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");

const indexRouter = require("./routes/index");
const eventosRouter = require("./routes/eventos");

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const MESES_EXTENSO = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

// Lê "AAAA-MM-DD" sem passar por new Date(), evitando deslocamento de fuso horário
function partesDaData(valor) {
    const [ano, mes, dia] = String(valor).slice(0, 10).split("-").map(Number);
    if (!ano || !mes || !dia) return null;
    return { ano, mes, dia };
}

const helpers = {
    // 12/10/2026 -> "12 de outubro de 2026"
    formatarData(valor) {
        const p = partesDaData(valor);
        if (!p) return "";
        return `${p.dia} de ${MESES_EXTENSO[p.mes - 1]} de ${p.ano}`;
    },
    // 12/10/2026 -> "12 OUT"
    dataAbreviada(valor) {
        const p = partesDaData(valor);
        if (!p) return "";
        return `${String(p.dia).padStart(2, "0")} ${MESES[p.mes - 1]}`;
    },
    // Usado no link "Ano atual" do rodapé
    anoAtual() {
        return new Date().getFullYear();
    }
};

function createApp() {
    const app = express();

    app.engine("hbs", engine({
        extname: ".hbs",
        defaultLayout: "main",
        layoutsDir: path.join(__dirname, "views/layouts"),
        partialsDir: path.join(__dirname, "views/partials"),
        helpers
    }));
    app.set("view engine", "hbs");
    app.set("views", path.join(__dirname, "views"));

    // Middlewares
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, "public")));

    // Middleware próprio: registra horário, método e endereço
    app.use((req, res, next) => {
        const horario = new Date().toLocaleTimeString("pt-BR");
        console.log(`[${horario}] [${req.method}] ${req.originalUrl}`);
        next();
    });

    // Rotas
    app.use("/", indexRouter);
    app.use("/eventos", eventosRouter);

    // 404 — depois de todas as rotas válidas
    app.use((req, res) => {
        res.status(404).render("404", { titulo: "Evento não encontrado" });
    });

    // 500 — por último e com quatro parâmetros
    app.use((erro, req, res, next) => {
        console.error(erro);
        res.status(500).render("erro", { titulo: "Falha inesperada" });
    });

    return app;
}

module.exports = { createApp };
