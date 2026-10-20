const path = require("node:path");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "database", "eventos.sqlite"),
  logging: false
});

const Evento = require("./evento")(sequelize, DataTypes);

module.exports = { sequelize, Evento };
