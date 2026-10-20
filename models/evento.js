const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Evento = sequelize.define("Evento", {
        titulo: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: true }
        },
        data: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: { isDate: true }
        },
        horario: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: true }
        },
        local: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: true }
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: { notEmpty: true }
        }
    }, {
        tableName: "eventos"
    });

    return Evento;
};
