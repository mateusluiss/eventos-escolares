module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Evento",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      titulo: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 120]
        }
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true
        }
      },
      horario: {
        type: DataTypes.STRING(40),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      local: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    },
    {
      tableName: "eventos",
      timestamps: true
    }
  );
};
