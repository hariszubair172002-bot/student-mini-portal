// ============================================================
// routes/authRoutes.js — Login ka rasta (URL)
// Route ka kaam: URL ko sahi controller function se jodna.
// ============================================================
const express = require('express');
const router  = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
// Frontend: LoginScreen (src/screens/auth/LoginScreen.js) -> authApi.login()
router.post('/login', authController.login);

module.exports = router;
