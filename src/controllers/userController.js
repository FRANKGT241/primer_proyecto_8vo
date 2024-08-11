const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

module.exports = {

  // Crear un nuevo usuario
  createUser: async (req, res) => {
    const { username, password, full_name, role, is_active } = req.body;

    if (!username || !password || !full_name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        password: hashedPassword,
        full_name,
        role,
        is_active: is_active !== undefined ? is_active : true,
      });

      res.status(201).json({ message: 'User created successfully', userId: user.user_id });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  },

  // Obtener todos los usuarios
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['user_id', 'username', 'full_name', 'role', 'is_active'],
      });
      res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
      }
      
  },

  // Obtener un usuario por ID
  getUserById: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id, {
        attributes: ['user_id', 'username', 'full_name', 'role', 'is_active'],
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user' });
    }
  },

  // Actualizar un usuario por ID
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { username, password, full_name, role, is_active } = req.body;

    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (username) user.username = username;
      if (password) user.password = await bcrypt.hash(password, 10);
      if (full_name) user.full_name = full_name;
      if (role) user.role = role;
      if (is_active !== undefined) user.is_active = is_active;

      await user.save();

      res.json({ message: 'User updated successfully', user });
    } catch (error) {
      res.status(500).json({ error: 'Error updating user' });
    }
  },

  // Cambiar de estado el usuario por ID
  deleteUser: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      user.is_active = user.is_active === 1 ? 0 : 1;
      await user.save();
  
      res.json({ message: 'User status updated to inactive' });
    } catch (error) {
      res.status(500).json({ error: 'Error updating user status' });
    }
}
}