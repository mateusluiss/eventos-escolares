const path = require("path");
const { Sequelize } = require("sequelize");

// Em testes usamos um banco em memória (DB_STORAGE=":memory:"),
// para não interferir no arquivo usado pela aplicação.
const storage = process.env.DB_STORAGE || path.join(__dirname, "..", "database.sqlite");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false
});

const Evento = require("./evento")(sequelize);

const eventosIniciais = [
    {
        titulo: "Mostra tecnológica",
        data: "2026-10-12",
        horario: "08h às 12h",
        local: "Laboratório de Informática",
        descricao: "Apresentação de aplicativos, robôs e sistemas desenvolvidos pelos estudantes dos cursos técnicos, com demonstrações abertas ao público."
    },
    {
        titulo: "Semana de ciências",
        data: "2026-10-15",
        horario: "13h às 17h",
        local: "Auditório principal",
        descricao: "Palestras, experimentos e oficinas sobre física, química e biologia conduzidos por professores e convidados de universidades da região."
    },
    {
        titulo: "Festival cultural",
        data: "2026-10-18",
        horario: "18h às 21h",
        local: "Pátio central",
        descricao: "Noite de música, dança, teatro e poesia com apresentações das turmas e de grupos artísticos da comunidade escolar."
    },
    {
        titulo: "Feira de profissões",
        data: "2026-11-05",
        horario: "09h às 16h",
        local: "Ginásio poliesportivo",
        descricao: "Estandes com profissionais de diversas áreas que conversam com os estudantes sobre rotina de trabalho, formação e mercado."
    },
    {
        titulo: "Reunião de integração",
        data: "2026-11-12",
        horario: "19h às 20h30",
        local: "Sala de convivência",
        descricao: "Encontro entre famílias, estudantes, professores e coordenação para apresentar o calendário do semestre e acolher novos alunos."
    },
    {
        titulo: "Exposição de projetos",
        data: "2026-11-26",
        horario: "14h às 18h",
        local: "Biblioteca",
        descricao: "Exibição dos projetos de pesquisa e extensão concluídos no ano, com banners, maquetes e conversa com as equipes responsáveis."
    }
];

// Sincroniza a tabela e insere os dados iniciais apenas se ela estiver vazia.
async function prepararBanco() {
    await sequelize.sync();

    const quantidade = await Evento.count();
    if (quantidade === 0) {
        await Evento.bulkCreate(eventosIniciais);
    }
}

module.exports = { sequelize, Evento, prepararBanco };
