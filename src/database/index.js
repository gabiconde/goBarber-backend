// conexão com db
// import models
import Sequelize from 'sequelize';

import User from '../app/models/User';
import File from '../app/models/File';
import databaseConfig from '../config/database';

const models = [User, File];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // conexao com db
    // var esperado no model
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
