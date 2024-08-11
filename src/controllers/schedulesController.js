const Schedule = require('../models/schedulesModel.js');
const { Op } = require('sequelize');

module.exports = {
  // Agregar horas
  createSchedule: async (req, res) => {
    const { user_id, work_date, hours_worked, is_active } = req.body;

    if (!user_id || !work_date || hours_worked === undefined || is_active === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const startOfWeekUTC = new Date(work_date);
      startOfWeekUTC.setUTCDate(startOfWeekUTC.getUTCDate() - startOfWeekUTC.getUTCDay());
  
      const endOfWeekUTC = new Date(startOfWeekUTC);
      endOfWeekUTC.setUTCDate(startOfWeekUTC.getUTCDate() + 6);

      const totalHoursThisWeek = await Schedule.sum('hours_worked', {
        where: {
          user_id: user_id,
          work_date: {
            [Op.between]: [startOfWeekUTC, endOfWeekUTC]
          }
        }
      });
  
      if ((totalHoursThisWeek || 0) + hours_worked > 40) {
        return res.status(400).json({ error: 'Total weekly hours exceed 40 hours' });
      }
     
      const schedule = await Schedule.create({
        user_id,
        work_date: work_date, 
        hours_worked,
        is_active: is_active !== undefined ? is_active : true,
      });
  
      res.status(201).json({ message: 'Work day created successfully', scheduleId: schedule.schedule_id });
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: 'Error creating schedule' });
    }
  },
  
  getAllSchedules:async (req, res) => {
    try {
      const schedules = await Schedule.findAll({
        where: { is_active: 1 },
      });
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
   updateSchedule:async (req, res) => {
    try {
      const { schedule_id } = req.params;
      const [updated] = await Schedule.update(req.body, {
        where: { schedule_id },
      });
      if (updated) {
        const updatedSchedule = await Schedule.findOne({ where: { schedule_id } });
        res.status(200).json(updatedSchedule);
      } else {
        res.status(404).json({ message: 'Horario no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // "Eliminar" un horario (cambiar is_active a 0)
 deleteSchedule:async (req, res) => {
    const { id } = req.params;

    try {
      const schedule = await schedule.findByPk(id);
  
      if (!schedule) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      schedule.is_active = schedule.is_active === 1 ? 0 : 1;
      await user.save();
  
      res.json({ message: 'User status updated to inactive' });
    } catch (error) {
      res.status(500).json({ error: 'Error updating user status' });
    }
},
getScheduleById: async (req, res) => {
  try {
    const { schedule_id } = req.params;

    const schedule = await Schedule.findOne({ where: { schedule_id } });

    if (schedule) {
      res.status(200).json(schedule);
    } else {
      res.status(404).json({ message: 'Horario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

}
