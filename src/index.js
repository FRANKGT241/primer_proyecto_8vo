const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/web');
const usersRoutes = require('./routes/usersRoutes');
const perishableRoutes = require('./routes/perishableProductRoutes')
const schedulesRoutes = require('./routes/schedulesRoutes')
const nonPerishableRoutes = require('./routes/nonPerishableProductsRoutes')
const categoryRoutes = require('./routes/categoryRoutes');

const cors = require('cors');

const app = express();
app.use(cors());
const port = 3001;

app.use(bodyParser.json());

// Importar y usar las rutas de autenticación
authRoutes(app);
usersRoutes(app);
schedulesRoutes(app);
perishableRoutes(app);
nonPerishableRoutes(app);
categoryRoutes(app);

app.get('/', (req, res) => {
  res.send('Bienvenido');
});

app.listen(port, () => {
  console.log(`El servidor se está ejecutando en http://localhost:${port}`);
});
