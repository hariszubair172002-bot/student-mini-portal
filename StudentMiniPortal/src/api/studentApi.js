// src/api/studentApi.js
import { get, put } from './client';

// GET /api/students?program=&search=  — Directory list
export const getAllStudents = (program, search) => {
  const params = new URLSearchParams();
  if (program && program !== 'All Programs') params.append('program', program);
  if (search) params.append('search', search);
  const qs = params.toString();
  return get(`/students${qs ? `?${qs}` : ''}`);
};

// GET /api/students/:id — Directory VIEW button
export const getStudentById = (id) => get(`/students/${id}`);

// GET /api/students/profile/:user_id — Profile screen
export const getStudentByUserId = (userId) => get(`/students/profile/${userId}`);

// PUT /api/students/:id — Edit Profile Save button { email, phone }
export const updateStudent = (id, { email, phone }) => put(`/students/${id}`, { email, phone });
