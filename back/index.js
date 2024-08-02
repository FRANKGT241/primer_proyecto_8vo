const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/web');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Importar y usar las rutas de autenticación
authRoutes(app);

app.get('/', (req, res) => {
  res.send('Bienvenido');
});

app.listen(port, () => {
  console.log(`El servidor se está ejecutando en http://localhost:${port}`);
});
