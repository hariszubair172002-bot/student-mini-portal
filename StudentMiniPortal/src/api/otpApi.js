// src/api/otpApi.js
import { post } from './client';

// POST /api/otp/send  { user_id, otp_type: 'email' | 'phone' }
export const sendOtp = (user_id, otp_type) => post('/otp/send', { user_id, otp_type });

// POST /api/otp/verify  { user_id, otp_code, otp_type }
export const verifyOtp = (user_id, otp_code, otp_type) =>
  post('/otp/verify', { user_id, otp_code, otp_type });

// POST /api/otp/resend  { user_id, otp_type }
export const resendOtp = (user_id, otp_type) => post('/otp/resend', { user_id, otp_type });
