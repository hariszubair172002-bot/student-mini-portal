// ============================================================
// routes/noticeRoutes.js — Notices ke rastay (URLs)
// ============================================================
const express = require('express');
const router  = express.Router();
const noticeController = require('../controllers/noticeController');

// GET /api/notices — notices ki list
// Frontend: StudentDashboard, StudentNoticeBoard, AdminNoticeBoard, AdminDashboard
router.get('/', noticeController.getAllNotices);

// GET /api/notices/:id — ek notice ki detail
// Frontend: abhi koi screen use nahi karti (list me hi poori detail aa jati hai)
router.get('/:id', noticeController.getNoticeById);

// POST /api/notices — naya notice banana
// Frontend: AdminPostNotice screen ka Publish button
router.post('/', noticeController.createNotice);

// DELETE /api/notices/:id — notice archive (delete) karna
// Frontend: AdminNoticeBoard screen ka Delete button
router.delete('/:id', noticeController.deleteNotice);

module.exports = router;
