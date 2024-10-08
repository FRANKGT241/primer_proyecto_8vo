const Schedule = require('../models/schedulesModel.js');
const { Op } = require('sequelize');

module.exports = {
  // Agregar horas
  createSchedule: async (req, res) => {
    const schedules = req.body;  // Se espera un array de objetos de horarios
  
    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ error: 'No schedules provided' });
    }
  
    try {
      const createdSchedules = [];
      
      for (const scheduleData of schedules) {
        const { user_id, work_date, hours_worked, is_active } = scheduleData;
  
        if (!user_id || !work_date || hours_worked === undefined || is_active === undefined) {
          return res.status(400).json({ error: 'All fields are required for each schedule' });
        }
        
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
  
        createdSchedules.push(schedule);
      }
    
      res.status(201).json({ message: 'Work days created successfully', schedules: createdSchedules });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error creating schedules' });
    }
  },
  
  getAllSchedules: async (req, res) => {
    try {
      const schedules = await Schedule.findAll();
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

  updateSchedule: async (req, res) => {
    const { schedule_id } = req.params; 
    const { is_active } = req.body; 

    try {
      // Buscar el horario por ID
      const schedule = await Schedule.findByPk(schedule_id);

      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Establecer el nuevo valor de is_active
      schedule.is_active = is_active;
      await schedule.save(); // Guardar los cambios

      res.json({ message: 'Schedule status updated successfully' });
    } catch (error) {
      console.error('Error updating schedule:', error); 
      res.status(500).json({ error: 'Error updating schedule status' });
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
