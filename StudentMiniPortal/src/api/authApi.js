// src/api/authApi.js
import { post } from './client';

// POST /api/auth/login  { email, password, role }
export const login = (email, password, role) =>
  post('/auth/login', { email, password, role });
