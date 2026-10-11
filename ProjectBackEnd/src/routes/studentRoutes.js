// ============================================================
// routes/studentRoutes.js — Students ke rastay (URLs)
// ============================================================
const express = require('express');
const router  = express.Router();
const studentController = require('../controllers/studentController');

// GET /api/students — saare students ki list (search + program filter ke sath)
// Frontend: StudentDirectory screen aur AdminDashboard (total students count)
router.get('/', studentController.getAllStudents);

// GET /api/students/profile/:user_id — login hue student ka apna profile
// Frontend: StudentProfile screen
// DHYAN: yeh "/:id" se PEHLE likhna zaroori hai, warna Express "profile" ko id samajh leta hai
router.get('/profile/:user_id', studentController.getStudentByUserId);

// GET /api/students/:id — ek student ki detail
// Frontend: StudentDirectory screen ka VIEW button
router.get('/:id', studentController.getStudentById);

// PUT /api/students/:id — email aur phone update karna
// Frontend: StudentEditProfile screen ka Save Changes button
router.put('/:id', studentController.updateStudent);

module.exports = router;
