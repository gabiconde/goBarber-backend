import {
  Router
} from 'express'
import User from './app/models/User'

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: "Gabriela Conde",
    email: 'gabi@gmail.com',
    password_hash: 'senhaSecreta',
  });


  return res.json(user);
})

export default routes;
