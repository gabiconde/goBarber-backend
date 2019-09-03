import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json({ appointments });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation Fails',
      });
    }

    const { date, provider_id } = req.body;

    /*
      Check Provider is valid
    */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: 'You can only create appointments with providers',
      });
    }
    /**
     * Check if provider and user are the same
     */
    if (provider_id === req.userId) {
      return res
        .status(400)
        .json({ error: 'You can not create appointments with yourself' });
    }
    /*
    Check if date is valid not past
    startHour change to oclock 19:30 --> 19:00
    */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: 'Past dates are not allowed',
      });
    }

    /*
      check if the hour with the provider is available
    */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        date: hourStart,
        canceled_at: null,
      },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }
    const appointmet = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    /**
     * Notify provider
     */
    const user = await User.findByPk(req.userId);
    // 1 - o que vai ser formatado
    // 2 - como? '' não sobre alteração
    // 3 - traduz para pt-br
    const formattedDate = format(
      hourStart,
      "'dia 'dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json({ appointmet });
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(400).json({ error: 'Appointment do not exists' });
    }

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'You do not have permission to cancel this appointment',
      });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointments 2 hours in advance.',
      });
    }

    appointment.canceled_at = new Date();
    await appointment.save();
    return res.json({ appointment });
  }
}

export default new AppointmentController();
