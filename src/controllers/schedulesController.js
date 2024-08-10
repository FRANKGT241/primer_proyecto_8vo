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
      const workDateUTC = new Date(new Date(work_date).toISOString().slice(0, 10) + "T00:00:00.000Z");
  
      const startOfWeekUTC = new Date(workDateUTC);
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
        work_date: workDateUTC, 
        hours_worked,
        is_active: is_active !== undefined ? is_active : true,
      });
  
      res.status(201).json({ message: 'Work day created successfully', scheduleId: schedule.schedule_id });
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: 'Error creating schedule' });
    }
  },
}
