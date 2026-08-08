const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getPool } = require('./config/db');
const app = express();
app.use(cors());
app.use(express.json());
// Rutas 
app.use('/api/postulaciones', require('./routes/postulacionRoutes'));
app.use('/api/donaciones', require('./routes/donacionRoutes'));
app.use('/api/donaciones', require('./routes/donacionRoutes'));
app.use('/api/refugio', require('./routes/refugioRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/mascotas', require('./routes/mascotaRoutes'));
app.use('/api/citas', require('./routes/citaRoutes'));
app.use('/api/atenciones', require('./routes/atencionRoutes'));
app.use('/api/adopciones', require('./routes/adopcionRoutes'));
app.get('/api/health', async (req, res) => {
  try {
    await getPool();
    res.json({ status: 'ok', db: 'conectado' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});