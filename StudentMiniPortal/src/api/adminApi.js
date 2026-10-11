// src/api/adminApi.js
import { get } from './client';

// GET /api/admin/profile/:user_id — AdminProfile screen
export const getAdminProfile = (userId) => get(`/admin/profile/${userId}`);
