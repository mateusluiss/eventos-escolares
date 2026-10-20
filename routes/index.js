const express = require("express");
const { Evento } = require("../models");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    // Os três destaques vêm do banco: os primeiros eventos da agenda
    const destaques = await Evento.findAll({
      order: [["data", "ASC"]],
      limit: 3,
      raw: true
    });

    res.render("index", {
      titulo: "Início",
      destaques
    });
  } catch (erro) {
    next(erro);
  }
});

router.get("/saude", (req, res) => {
  res.status(200).json({ status: "ok", aplicacao: "eventos-escolares" });
});

module.exports = router;
