const express = require("express");
const { Evento } = require("../models");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        // Três destaques vindos do banco: os próximos eventos por data
        const destaques = await Evento.findAll({
            order: [["data", "ASC"]],
            limit: 3
        });

        res.render("index", {
            titulo: "Eventos Escolares",
            destaques: destaques.map((evento) => evento.get({ plain: true }))
        });
    } catch (erro) {
        next(erro);
    }
});

router.get("/saude", (req, res) => {
    res.status(200).json({ status: "ok" });
});

module.exports = router;
