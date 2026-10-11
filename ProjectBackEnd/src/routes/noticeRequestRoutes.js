// ============================================================
// routes/noticeRequestRoutes.js — Student ki notice requests ke rastay (URLs)
// ============================================================
const express = require('express');
const router  = express.Router();
const noticeRequestController = require('../controllers/noticeRequestController');

// POST /api/notice-requests — student nayi request bhejta hai
// Frontend: PostRequest screen (Student -> New Request) ka Submit button
router.post('/', noticeRequestController.createRequest);

// GET /api/notice-requests — requests ki list (?status=pending bhi ho sakta hai)
// Frontend: AdminApprovals screen aur AdminDashboard (pending requests count)
router.get('/', noticeRequestController.getAllRequests);

// PUT /api/notice-requests/:id — admin Approve ya Reject karta hai
// Frontend: AdminApprovals screen ke Approve / Reject buttons
router.put('/:id', noticeRequestController.updateRequestStatus);

module.exports = router;
