const express = require("express");
const { Evento } = require("../models");

const router = express.Router();

// GET /eventos — listagem em linha do tempo, por data crescente
router.get("/", async (req, res, next) => {
    try {
        const eventos = await Evento.findAll({
            order: [["data", "ASC"]]
        });

        res.render("eventos/listar", {
            titulo: "Eventos cadastrados",
            eventos: eventos.map((evento) => evento.get({ plain: true }))
        });
    } catch (erro) {
        next(erro);
    }
});

// GET /eventos/:id — detalhamento de um evento
router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render("404", { titulo: "Evento não encontrado" });
        }

        const evento = await Evento.findByPk(id);

        if (!evento) {
            return res.status(404).render("404", { titulo: "Evento não encontrado" });
        }

        res.render("eventos/detalhar", {
            titulo: evento.titulo,
            evento: evento.get({ plain: true })
        });
    } catch (erro) {
        next(erro);
    }
});

module.exports = router;
