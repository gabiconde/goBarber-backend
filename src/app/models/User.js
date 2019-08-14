import { Model, Sequelize } from 'sequelize';

class User extends Model {
  //apenas o que será input
  static init(sequelize){
    super.init({
      name: Sequelize.STRING,
      email: Sequelize.STRING,
      password_hash: Sequelize.STRING,
      provider: Sequelize.BOOLEAN,
    },{
      sequelize,
    });

  }
}

export default User;
