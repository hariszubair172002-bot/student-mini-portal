// ============================================================
// routes/adminRoutes.js — Admin ka rasta (URL)
// ============================================================
const express = require('express');
const router  = express.Router();
const adminController = require('../controllers/adminController');

// GET /api/admin/profile/:user_id — admin ka profile
// Frontend: AdminProfile screen -> adminApi.getAdminProfile()
router.get('/profile/:user_id', adminController.getAdminProfile);

module.exports = router;
