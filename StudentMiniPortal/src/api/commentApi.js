// src/api/commentApi.js
import { get, post, del } from './client';

// GET /api/notices/:notice_id/comments
export const getComments = (noticeId) => get(`/notices/${noticeId}/comments`);

// POST /api/notices/:notice_id/comments  { user_id, comment_text }
export const addComment = (noticeId, userId, commentText) =>
  post(`/notices/${noticeId}/comments`, { user_id: userId, comment_text: commentText });

// DELETE /api/comments/:id  { requesting_user_id, requesting_role }
export const deleteComment = (commentId, requestingUserId, requestingRole) =>
  del(`/comments/${commentId}`, { requesting_user_id: requestingUserId, requesting_role: requestingRole });