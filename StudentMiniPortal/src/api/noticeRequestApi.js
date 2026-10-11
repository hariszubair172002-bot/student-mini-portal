// src/api/noticeRequestApi.js
import { get, post, put } from './client';

// POST /api/notice-requests — Student RequestNotice screen
export const createRequest = (payload) => post('/notice-requests', payload);

// GET /api/notice-requests?status= — Admin NoticeApproval screen
export const getAllRequests = (status) =>
  get(`/notice-requests${status ? `?status=${status}` : ''}`);

// PUT /api/notice-requests/:id — Admin Approve or Reject { status }
export const updateRequestStatus = (id, status) => put(`/notice-requests/${id}`, { status });
