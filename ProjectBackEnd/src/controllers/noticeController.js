// ============================================================
// controllers/noticeController.js — NOTICES ka kaam
// Targeting ka rule:
//   - Notice par department / semester ki range na ho  -> SAB students ko dikhta hai
//   - Notice par department / semester ki range ho     -> sirf matching students ko dikhta hai
// ============================================================
const { getPool, sql } = require('../config/db');

// Semester ke text se number nikalta hai:  "BSCS-7B" -> 7,  "6th" -> 6,  "1st" -> 1
function semesterNumber(text) {
  const match = String(text || '').match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

// Check karta hai ke student ka semester notice ki range (from..to) ke andar hai ya nahi
function semesterInRange(studentSemester, from, to) {
  if (!from && !to) return true;                // notice par range nahi -> sab ko dikhao
  const student = semesterNumber(studentSemester);
  if (student === null) return true;            // student ka semester samajh na aaye -> hide mat karo
  const low  = semesterNumber(from) || 1;       // from na ho to 1st se
  const high = semesterNumber(to)   || 8;       // to na ho to 8th tak
  return student >= low && student <= high;
}

// GET /api/notices?limit=4&category=Academic&search=exam&department=CS&semester=BSCS-7B
// Frontend:
//   StudentDashboard   -> "Latest Notices" (limit + student ka department/semester bhejti hai)
//   StudentNoticeBoard -> search, category filter + student ka department/semester
//   AdminNoticeBoard   -> sirf search (admin ko SAB notices dikhte hain, department/semester nahi bhejta)
//   AdminDashboard     -> "Recent Notices" (limit) aur notices ki ginti
async function getAllNotices(req, res) {
  try {
    const { category, search, limit, department, semester } = req.query;
    const pool    = getPool();
    const request = pool.request();

    // Sirf active notices (archived wale nahi)
    let where = `WHERE n.status = 'active'`;

    // Category filter (Academic / Facility / Event / Update)
    if (category) {
      where += ' AND n.category = @category';
      request.input('category', sql.NVarChar, category);
    }

    // Title me search
    if (search) {
      where += ' AND n.title LIKE @search';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    // Department targeting: notice ka department khali (NULL) ho to sab ko dikhta hai,
    // warna sirf us student ko jis ka department same ho
    if (department) {
      where += ' AND (n.department IS NULL OR n.department = @department)';
      request.input('department', sql.NVarChar, department);
    }

    // limit = kitne notices chahiye (TOP 4 waghera)
    let top = '';
    if (limit && !isNaN(limit)) {
      top = 'TOP (@limit)';
      request.input('limit', sql.Int, parseInt(limit, 10));
    }

    const result = await request.query(`
      SELECT ${top}
        n.id, n.title, n.category, n.description, n.image_url,
        n.department, n.semester_from, n.semester_to, n.status, n.created_at,
        u.name AS posted_by_name
      FROM NOTICES n
      JOIN USERS u ON n.posted_by = u.id
      ${where}
      ORDER BY n.created_at DESC
    `);

    let notices = result.recordset;

    // Semester targeting: database se aane ke baad JavaScript me check hota hai
    if (semester) {
      notices = notices.filter((n) => semesterInRange(semester, n.semester_from, n.semester_to));
    }

    res.json(notices);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET /api/notices/:id
// Frontend: abhi koi screen use nahi karti (list me hi poori detail aa jati hai)
async function getNoticeById(req, res) {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT n.id, n.title, n.category, n.description, n.image_url,
               n.department, n.semester_from, n.semester_to, n.status, n.created_at,
               u.name AS posted_by_name
        FROM NOTICES n
        JOIN USERS u ON n.posted_by = u.id
        WHERE n.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.json(result.recordset[0]);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// POST /api/notices
// Frontend: AdminPostNotice screen ka Publish button
// App se aata hai: posted_by, title, category, description, department, semester_from, semester_to
// department khali (NULL) rahe to notice sab departments ke liye hota hai
async function createNotice(req, res) {
  try {
    const { posted_by, title, category, description, image_url,
            department, semester_from, semester_to } = req.body;

    // Yeh teen cheezein zaroori hain
    if (!posted_by || !title || !category) {
      return res.status(400).json({ message: 'posted_by, title and category are required' });
    }

    const pool = getPool();
    await pool.request()
      .input('posted_by', sql.Int, posted_by)
      .input('title', sql.NVarChar, title)
      .input('category', sql.NVarChar, category)
      .input('description', sql.NVarChar, description)
      .input('image_url', sql.NVarChar, image_url)
      .input('department', sql.NVarChar, department)
      .input('semester_from', sql.NVarChar, semester_from)
      .input('semester_to', sql.NVarChar, semester_to)
      .query(`
        INSERT INTO NOTICES
          (posted_by, title, category, description, image_url, department, semester_from, semester_to)
        VALUES
          (@posted_by, @title, @category, @description, @image_url, @department, @semester_from, @semester_to)
      `);

    res.status(201).json({ message: 'Notice posted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE /api/notices/:id
// Frontend: AdminNoticeBoard screen ka Delete button
// Notice asal me delete nahi hota, sirf status "archived" ho jata hai (data safe rehta hai)
async function deleteNotice(req, res) {
  try {
    const pool = getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`UPDATE NOTICES SET status = 'archived' WHERE id = @id`);

    res.json({ message: 'Notice archived successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { getAllNotices, getNoticeById, createNotice, deleteNotice };
