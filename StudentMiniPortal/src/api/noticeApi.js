import { get, post, del } from './client';
 
// GET /api/notices?limit=&category=&search=&department=&semester=
// Pass department/semester (from the logged-in student's profile) to get
// audience-filtered results; omit both for the unfiltered admin view.
export const getAllNotices = ({ limit, category, search, department, semester } = {}) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  if (department) params.append('department', department);
  if (semester) params.append('semester', semester);
  const qs = params.toString();
  return get(`/notices${qs ? `?${qs}` : ''}`);
};
 
// GET /api/notices/:id — NoticeDetail screen
export const getNoticeById = (id) => get(`/notices/${id}`);
 
// POST /api/notices — Admin PostNotice screen
export const createNotice = (payload) => post('/notices', payload);
 
// DELETE /api/notices/:id — Admin archives a notice
export const deleteNotice = (id) => del(`/notices/${id}`);
 
