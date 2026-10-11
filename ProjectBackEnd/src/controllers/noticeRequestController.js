// ============================================================
// controllers/noticeRequestController.js — Student ki NOTICE REQUESTS ka kaam
// Tareeqa: student request bhejta hai (pending) -> admin approve/reject karta hai.
// Approve hone par request NOTICES table me copy ho jati hai.
// ============================================================
const { getPool, sql } = require('../config/db');

// POST /api/notice-requests
// Frontend: PostRequest screen (Student -> New Request) ka Submit button
// App se aata hai: student_id, title, category, description, department, semester_from, semester_to
async function createRequest(req, res) {
  try {
    const { student_id, title, category, description, image_url,
            department, semester_from, semester_to } = req.body;

    if (!student_id || !title || !category) {
      return res.status(400).json({ message: 'student_id, title and category are required' });
    }

    const pool = getPool();
    // Naye request ka status database khud "pending" rakhta hai
    await pool.request()
      .input('student_id', sql.Int, student_id)
      .input('title', sql.NVarChar, title)
      .input('category', sql.NVarChar, category)
      .input('description', sql.NVarChar, description)
      .input('image_url', sql.NVarChar, image_url)
      .input('department', sql.NVarChar, department)
      .input('semester_from', sql.NVarChar, semester_from)
      .input('semester_to', sql.NVarChar, semester_to)
      .query(`
        INSERT INTO NOTICE_REQUESTS
          (student_id, title, category, description, image_url, department, semester_from, semester_to)
        VALUES
          (@student_id, @title, @category, @description, @image_url, @department, @semester_from, @semester_to)
      `);

    res.status(201).json({ message: 'Notice request submitted. Waiting for admin approval.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET /api/notice-requests?status=pending
// Frontend: AdminApprovals screen (list + filter chips: All / Pending / Approved / Rejected)
//           AdminDashboard (pending requests ki ginti, status=pending ke sath)
async function getAllRequests(req, res) {
  try {
    const { status } = req.query;
    const pool    = getPool();
    const request = pool.request();

    // Request ke saath student ka naam aur program bhi chahiye (JOIN se)
    let query = `
      SELECT nr.id, nr.title, nr.category, nr.description, nr.department,
             nr.semester_from, nr.semester_to, nr.status, nr.created_at,
             u.name AS student_name, s.program
      FROM NOTICE_REQUESTS nr
      JOIN STUDENTS s ON nr.student_id = s.id
      JOIN USERS u    ON s.user_id = u.id
      WHERE 1=1
    `;

    if (status) {
      query += ' AND nr.status = @status';
      request.input('status', sql.NVarChar, status);
    }

    query += ' ORDER BY nr.created_at DESC';

    const result = await request.query(query);
    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// PUT /api/notice-requests/:id    (app se aata hai: status = "approved" ya "rejected")
// Frontend: AdminApprovals screen ke Approve / Reject buttons
async function updateRequestStatus(req, res) {
  try {
    const { status } = req.body;
    const pool = getPool();

    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    // Step 1: request dhoondo (student ka user_id bhi chahiye, notice ka "posted_by" banane ke liye)
    const found = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT nr.*, s.user_id AS student_user_id
        FROM NOTICE_REQUESTS nr
        JOIN STUDENTS s ON nr.student_id = s.id
        WHERE nr.id = @id
      `);

    const row = found.recordset[0];
    if (!row) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Step 2: jo request pehle hi approve/reject ho chuki ho, dobara na chalne do
    // (warna ek hi notice do dafa ban jata)
    if (row.status !== 'pending') {
      return res.status(400).json({ message: `This request is already ${row.status}` });
    }

    // Step 3: approve ho to notice NOTICES table me copy karo
    // (department aur semester ki targeting bhi sath copy hoti hai)
    if (status === 'approved') {
      await pool.request()
        .input('posted_by', sql.Int, row.student_user_id)
        .input('title', sql.NVarChar, row.title)
        .input('category', sql.NVarChar, row.category)
        .input('description', sql.NVarChar, row.description)
        .input('image_url', sql.NVarChar, row.image_url)
        .input('department', sql.NVarChar, row.department)
        .input('semester_from', sql.NVarChar, row.semester_from)
        .input('semester_to', sql.NVarChar, row.semester_to)
        .query(`
          INSERT INTO NOTICES
            (posted_by, title, category, description, image_url, department, semester_from, semester_to)
          VALUES
            (@posted_by, @title, @category, @description, @image_url, @department, @semester_from, @semester_to)
        `);
    }

    // Step 4: request ka status update karo
    await pool.request()
      .input('status', sql.NVarChar, status)
      .input('id', sql.Int, req.params.id)
      .query('UPDATE NOTICE_REQUESTS SET status = @status WHERE id = @id');

    res.json({ message: `Request ${status} successfully` });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { createRequest, getAllRequests, updateRequestStatus };
