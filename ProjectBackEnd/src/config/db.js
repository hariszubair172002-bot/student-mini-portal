// ============================================================
// config/db.js — Database (SQL Server) se connection yahan banta hai.
// Baaqi saari controller files isi file se getPool() le kar database use karti hain.
// ============================================================

const mssql = require('mssql');

// Database ki settings (username, password, port waghera)
const dbConfig = {
  user: 'sa',
  password: 'Hariskhan@123',
  server: 'localhost',
  port: 14330,              // SQL Server (SQLEXPRESS01) ka port
  database: 'BIIT_Portal',  // database ka naam

  options: {
    encrypt: false,                // apne PC par encryption ki zaroorat nahi
    trustServerCertificate: true,
    enableArithAbort: true,
  },

  // Pool = ek saath 10 connections tak khule rakhta hai taake app tez rahe
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool; // yahan connection save hota hai

// Server start hote waqt yeh function ek dafa chalta hai
async function connectDB() {
  try {
    pool = await mssql.connect(dbConfig);
    console.log('Connected to MSSQL Database (SQLEXPRESS01)');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    console.log('Tip: "sa" login enabled hona chahiye aur SQL Server chal raha ho.');
    process.exit(1); // database na mile to server band kar do
  }
}

// Controllers is function se connection mangte hain
function getPool() {
  return pool;
}

module.exports = { connectDB, getPool, sql: mssql };
