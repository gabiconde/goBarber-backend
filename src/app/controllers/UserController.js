import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }
    const userExists = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (userExists) {
      return res.status(400).json({
        error: 'User already exists',
      });
    }
    const { id, name, email, provider } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    // validar dados
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }
    // Buscar user
    const user = await User.findByPk(req.userId);

    // recuperar body
    const { email, oldPassword } = req.body;

    // verificar se o email esta diferente
    if (email !== user.email) {
      // verifica se email ja existe
      const userExists = await User.findOne({
        where: {
          email,
        },
      });
      if (userExists) {
        return res.status(400).json({
          error: 'User already exists',
        });
      }
    }

    // verificar se ele quer alterar a senha
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({
        error: 'Password does not match',
      });
    }

    // alterar dados
    const { id, name, provider } = await user.update(req.body);

    // enviar resposta
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
