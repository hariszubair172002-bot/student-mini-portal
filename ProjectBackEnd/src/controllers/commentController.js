// ============================================================
// controllers/commentController.js — Notice ke COMMENTS ka kaam
// Student aur admin dono comment kar sakte hain.
// NOTE: abhi yeh feature app me hide (comment out) hai, lekin backend tayyar hai.
// ============================================================
const { getPool, sql } = require('../config/db');

// GET /api/notices/:notice_id/comments
// Frontend: StudentNoticeBoard / AdminNoticeBoard ka notice popup (comments ki list)
async function getComments(req, res) {
  try {
    const pool = getPool();
    // Comment ke saath likhne wale ka naam aur role (student/admin) bhi bhejte hain
    const result = await pool.request()
      .input('notice_id', sql.Int, req.params.notice_id)
      .query(`
        SELECT c.id, c.notice_id, c.user_id, c.comment_text, c.created_at,
               u.name, u.role
        FROM NOTICE_COMMENTS c
        JOIN USERS u ON c.user_id = u.id
        WHERE c.notice_id = @notice_id
        ORDER BY c.created_at ASC
      `);

    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// POST /api/notices/:notice_id/comments    (app se aata hai: user_id, comment_text)
// Frontend: notice popup ka "Send" button
async function createComment(req, res) {
  try {
    const { user_id, comment_text } = req.body;

    if (!user_id || !comment_text || !comment_text.trim()) {
      return res.status(400).json({ message: 'user_id and comment_text are required' });
    }

    const pool = getPool();

    // Comment save karo. OUTPUT se naya bana hua comment wapas mil jata hai
    const saved = await pool.request()
      .input('notice_id', sql.Int, req.params.notice_id)
      .input('user_id', sql.Int, user_id)
      .input('comment_text', sql.NVarChar, comment_text.trim())
      .query(`
        INSERT INTO NOTICE_COMMENTS (notice_id, user_id, comment_text)
        OUTPUT INSERTED.id, INSERTED.notice_id, INSERTED.user_id,
               INSERTED.comment_text, INSERTED.created_at
        VALUES (@notice_id, @user_id, @comment_text)
      `);

    // Likhne wale ka naam/role bhi jorte hain taake app foran dikha sake
    const author = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query('SELECT name, role FROM USERS WHERE id = @user_id');

    res.status(201).json({ ...saved.recordset[0], ...author.recordset[0] });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE /api/comments/:id    (app se aata hai: requesting_user_id, requesting_role)
// Frontend: comment ke saath wala dustbin icon
// Rule: comment likhne wala apna comment delete kar sakta hai, admin kisi ka bhi
async function deleteComment(req, res) {
  try {
    const { requesting_user_id, requesting_role } = req.body;

    if (!requesting_user_id) {
      return res.status(400).json({ message: 'requesting_user_id is required' });
    }

    const pool = getPool();

    // Pehle dekho comment kis ka hai
    const found = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT user_id FROM NOTICE_COMMENTS WHERE id = @id');

    if (found.recordset.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isOwner = found.recordset[0].user_id === requesting_user_id;
    const isAdmin = requesting_role === 'admin';

    // Na apna comment hai na admin hai -> ijazat nahi
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not allowed to delete this comment' });
    }

    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM NOTICE_COMMENTS WHERE id = @id');

    res.json({ message: 'Comment deleted' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { getComments, createComment, deleteComment };
