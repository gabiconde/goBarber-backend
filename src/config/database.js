module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'gobarber',
  define: {
    //adiciona data e hora de alteração/criação
    timestamps: true,
    //cria no banco nome_assim com caixa baixa
    underscored: true,
    underscoredAll: true
  },
};
