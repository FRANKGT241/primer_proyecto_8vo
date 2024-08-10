const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const secretKey = 'tu_clave_secreta'; 
const blacklistedTokens = []; 

module.exports = {

  // Lógica de inicio de sesión
  async login(req, res) {
    const { username, password } = req.body;

    try {
     
      const user = await User.findOne({ where: { username } });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }


      const token = jwt.sign({ username: user.username, role: user.role }, secretKey, { expiresIn: '1h' });

    
      await user.update({ token });

      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  },

  // Lógica de cierre de sesión
  async logout(req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    try {
      // Buscar usuario por token
      const user = await User.findOne({ where: { token } });

      if (!user) {
        return res.sendStatus(401);
      }

      // Desasignar el token (eliminar de la base de datos)
      await user.update({ token: null });

      // Opcional: añadir el token a la lista negra para evitar su uso posterior
      blacklistedTokens.push(token);

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: 'Error logging out' });
    }
  },

  // Lógica para autenticar el token
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);
    if (blacklistedTokens.includes(token)) return res.sendStatus(403);

    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  },

  // Ejemplo de una ruta protegida
  protectedRoute(req, res) {
    res.send('This is a protected route');
  },

  logintest(req, res) {
    const { username, password } = req.body;
  
    // Datos quemados
    const hardcodedUser = {
      username: 'usuario1',
      password: 'password1',
      role: 'user',
      token: null,
    };
  
    try {
      // Comparar con el usuario quemado
      if (username !== hardcodedUser.username || password !== hardcodedUser.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Crear un token JWT
      const token = jwt.sign(
        { username: hardcodedUser.username, role: hardcodedUser.role },
        secretKey,
        { expiresIn: '1h' }
      );
  
      // Guardar el token (en este caso, solo se simula)
      hardcodedUser.token = token;
  
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  }


};
