// ============================================================
// controllers/adminController.js — ADMIN profile ka kaam
// ============================================================
const { getPool, sql } = require('../config/db');

// GET /api/admin/profile/:user_id
// Frontend: AdminProfile screen -> adminApi.getAdminProfile()
// Admin ka naam, email aur admin code wapas bhejta hai
async function getAdminProfile(req, res) {
  try {
    const pool = getPool();

    // USERS aur ADMINS table ko user_id se jor kar data nikalo
    const result = await pool.request()
      .input('user_id', sql.Int, req.params.user_id)
      .query(`
        SELECT u.name, u.email, a.admin_code
        FROM ADMINS a
        JOIN USERS u ON a.user_id = u.id
        WHERE a.user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { getAdminProfile };
