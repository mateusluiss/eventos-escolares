const express = require("express");
const { Evento } = require("../models");

const router = express.Router();

// GET /eventos — todos os eventos em ordem crescente de data
router.get("/", async (req, res, next) => {
  try {
    const eventos = await Evento.findAll({
      order: [["data", "ASC"]],
      raw: true
    });

    res.render("eventos/listar", {
      titulo: "Eventos cadastrados",
      eventos,
      quantidade: eventos.length
    });
  } catch (erro) {
    next(erro);
  }
});

// GET /eventos/:id — detalhamento de um evento
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Identificador inválido: nem chega a consultar o banco
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).render("404", {
        titulo: "Evento não encontrado",
        caminho: req.originalUrl
      });
    }

    const evento = await Evento.findByPk(id, { raw: true });

    // Identificador válido, mas sem registro correspondente
    if (!evento) {
      return res.status(404).render("404", {
        titulo: "Evento não encontrado",
        caminho: req.originalUrl
      });
    }

    return res.render("eventos/detalhar", {
      titulo: evento.titulo,
      evento
    });
  } catch (erro) {
    return next(erro);
  }
});

module.exports = router;
