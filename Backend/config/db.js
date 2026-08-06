const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool;

async function getPool() {
  if (pool) return pool;
  try {
    pool = await sql.connect(config);
    console.log('Conectado a DB_Veterinaria');
    return pool;
  } catch (err) {
    console.error('Error de conexion a la base de datos:', err.message);
    throw err;
  }
}

module.exports = { sql, getPool };
