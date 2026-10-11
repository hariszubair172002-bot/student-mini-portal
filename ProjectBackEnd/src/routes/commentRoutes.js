// ============================================================
// routes/commentRoutes.js — Notice ke comments ke rastay (URLs)
// Yeh server.js me '/api' ke neeche lagi hai, isliye poora URL /api/... bana
// ============================================================
const express = require('express');
const router  = express.Router();
const commentController = require('../controllers/commentController');

// GET /api/notices/:notice_id/comments — ek notice ke saare comments
// Frontend: StudentNoticeBoard aur AdminNoticeBoard ka notice popup (abhi hide hai)
router.get('/notices/:notice_id/comments', commentController.getComments);

// POST /api/notices/:notice_id/comments — naya comment likhna
// Frontend: StudentNoticeBoard aur AdminNoticeBoard ka "Send" button (abhi hide hai)
router.post('/notices/:notice_id/comments', commentController.createComment);

// DELETE /api/comments/:id — comment delete karna
// Frontend: comment ke saath wala dustbin icon (abhi hide hai)
router.delete('/comments/:id', commentController.deleteComment);

module.exports = router;
