// ============================================================
// controllers/studentController.js — STUDENTS ka kaam
// (directory, profile, profile edit)
// ============================================================
const { getPool, sql } = require('../config/db');

// GET /api/students?program=BSCS&search=Ahmed
// Frontend: StudentDirectory screen (list, search, program filter)
//           AdminDashboard (sirf total students ginne ke liye)
async function getAllStudents(req, res) {
  try {
    const { program, search } = req.query;
    const pool    = getPool();
    const request = pool.request();

    // Basic query. "WHERE 1=1" ka matlab: neeche jitne chahein filter jor do
    let query = `
      SELECT s.id, s.arid_number, s.program, s.semester,
             s.status, s.department, u.name, u.email
      FROM STUDENTS s
      JOIN USERS u ON s.user_id = u.id
      WHERE 1=1
    `;

    // Program filter (BSCS / BSSE / ALUMNI). ALUMNI "status" column se check hota hai
    if (program && program !== 'All Programs') {
      if (program === 'ALUMNI') {
        query += " AND s.status = 'alumni'";
      } else {
        query += ' AND s.program = @program';
        request.input('program', sql.NVarChar, program);
      }
    }

    // Search: naam ya ARID number se
    if (search) {
      query += ' AND (u.name LIKE @search OR s.arid_number LIKE @search)';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    query += ' ORDER BY u.name';

    const result = await request.query(query);
    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET /api/students/:id
// Frontend: StudentDirectory screen ka VIEW button (student ki poori detail)
async function getStudentById(req, res) {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT s.id, s.arid_number, s.phone, s.program, s.semester, s.status,
               s.department, s.is_email_verified, s.is_phone_verified,
               u.name, u.email
        FROM STUDENTS s
        JOIN USERS u ON s.user_id = u.id
        WHERE s.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(result.recordset[0]);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET /api/students/profile/:user_id
// Frontend: StudentProfile screen (screen khulte hi taaza data mangti hai)
async function getStudentByUserId(req, res) {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('user_id', sql.Int, req.params.user_id)
      .query(`
        SELECT s.id, s.arid_number, s.phone, s.program, s.semester, s.status,
               s.department, s.is_email_verified, s.is_phone_verified,
               u.name, u.email
        FROM STUDENTS s
        JOIN USERS u ON s.user_id = u.id
        WHERE s.user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(result.recordset[0]);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// PUT /api/students/:id    (app se aata hai: email, phone)
// Frontend: StudentEditProfile screen ka Save Changes button
// Sirf email aur phone badal sakte hain, baaqi cheezein sirf admin badal sakta hai
async function updateStudent(req, res) {
  try {
    const { email, phone } = req.body;
    const pool = getPool();

    // Pehle student dhoondo (email USERS table me hai, isliye user_id chahiye)
    const found = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT user_id FROM STUDENTS WHERE id = @id');

    if (found.recordset.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const userId = found.recordset[0].user_id;

    // Email USERS table me update hoti hai
    if (email) {
      await pool.request()
        .input('email', sql.NVarChar, email)
        .input('user_id', sql.Int, userId)
        .query('UPDATE USERS SET email = @email WHERE id = @user_id');
    }

    // Phone STUDENTS table me update hota hai
    if (phone) {
      await pool.request()
        .input('phone', sql.NVarChar, phone)
        .input('id', sql.Int, req.params.id)
        .query('UPDATE STUDENTS SET phone = @phone WHERE id = @id');
    }

    res.json({ message: 'Profile updated successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { getAllStudents, getStudentById, getStudentByUserId, updateStudent };
