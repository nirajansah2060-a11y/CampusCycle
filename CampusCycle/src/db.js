const mysql = require('mysql2/promise');

const {
  DB_HOST = 'db',
  DB_USER = 'campus_user',
  DB_PASSWORD = 'campus_password',
  DB_NAME = 'campuscycle',
  DB_PORT = 3306
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function waitForDatabase(maxAttempts = 15, delayMs = 2000) {
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      const connection = await pool.getConnection();
      await connection.query('SELECT 1');
      connection.release();
      return true;
    } catch (error) {
      attempt += 1;
      if (attempt >= maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return false;
}

module.exports = {
  pool,
  waitForDatabase
};
