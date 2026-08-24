console.log('>>>> ESTE APP.JS SE ESTÁ EJECUTANDO DESDE:', __filename);
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getPool } = require('./config/db');
const app = express();
app.use(cors());
app.use(express.json());
// Rutas 
app.use('/api/postulaciones', require('./routes/PostulacionRoutes'));
app.use('/api/donaciones', require('./routes/DonacionRoutes'));
app.use('/api/refugio', require('./routes/RefugioRoutes'));
app.use('/api/clientes', require('./routes/ClienteRoutes'));
app.use('/api/mascotas', require('./routes/MascotaRoutes'));
app.use('/api/citas', require('./routes/CitaRoutes'));
app.use('/api/atenciones', require('./routes/AtencionRoutes'));
app.use('/api/adopciones', require('./routes/AdopcionRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

app.get('/api/debug-conexion', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT @@SERVERNAME AS Servidor, DB_NAME() AS BaseDeDatos, @@SPID AS SPID');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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