// ============================================================
// controllers/authController.js — LOGIN ka kaam
// Controller ka kaam: database se data lena aur app ko wapas bhejna.
// ============================================================
const { getPool, sql } = require('../config/db');

// POST /api/auth/login
// Frontend: LoginScreen (src/screens/auth/LoginScreen.js) -> authApi.login()
// App se aata hai: email, password, role (student ya admin)
async function login(req, res) {
  try {
    const { email, password, role } = req.body;

    // Teeno cheezein zaroori hain
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password and role are required' });
    }

    const pool = getPool();

    // Step 1: USERS table me email + password + role match karo
    const userResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .input('role', sql.NVarChar, role)
      .query(`
        SELECT id, name, email, role
        FROM USERS
        WHERE LOWER(email) = LOWER(@email) AND password = @password AND role = @role
      `);

    const user = userResult.recordset[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email, password or role' });
    }

    // Step 2a: Agar student hai to STUDENTS table se uski detail lo
    if (role === 'student') {
      const studentResult = await pool.request()
        .input('user_id', sql.Int, user.id)
        .query(`
          SELECT id, arid_number, phone, program, semester, department,
                 status, is_email_verified, is_phone_verified
          FROM STUDENTS WHERE user_id = @user_id
        `);

      const student = studentResult.recordset[0];
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      // App is data ko phone me save kar leti hai (session)
      return res.json({ message: 'Login successful', user, student });
    }

    // Step 2b: Agar admin hai to ADMINS table se admin_code lo
    if (role === 'admin') {
      const adminResult = await pool.request()
        .input('user_id', sql.Int, user.id)
        .query('SELECT id, admin_code FROM ADMINS WHERE user_id = @user_id');

      const admin = adminResult.recordset[0];
      if (!admin) {
        return res.status(404).json({ message: 'Admin profile not found' });
      }
      return res.json({ message: 'Login successful', user, admin });
    }

    return res.status(400).json({ message: 'Invalid role' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { login };
