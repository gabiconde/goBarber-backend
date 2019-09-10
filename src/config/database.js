require('dotenv/config');

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    // adiciona data e hora de alteração/criação
    timestamps: true,
    // cria no banco nome_assim com caixa baixa
    underscored: true,
    underscoredAll: true,
  },
};
