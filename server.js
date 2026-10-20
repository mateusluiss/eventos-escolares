const { createApp } = require("./app");
const { prepararBanco } = require("./models");

const port = Number(process.env.PORT) || 3000;

async function iniciarServidor() {
  await prepararBanco();

  const app = createApp();

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

iniciarServidor().catch((erro) => {
  console.error("Não foi possível iniciar o servidor:", erro);
});
