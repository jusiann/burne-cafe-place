import api from './api.js';
import { ENDPOINTS } from '../constants/api.utils.js';

export const signUp = (data) => api.post(ENDPOINTS.AUTH.SIGN_UP, data);
export const signIn = (data) => api.post(ENDPOINTS.AUTH.SIGN_IN, data);
export const forgotPassword = (data) => api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
export const checkResetCode = (data) => api.post(ENDPOINTS.AUTH.CHECK_RESET_CODE, data);
export const resetPassword = (data) => api.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
export const refreshToken = (data) => api.post(ENDPOINTS.AUTH.REFRESH_TOKEN, data);
export const updateProfile = (data) => api.put(ENDPOINTS.AUTH.UPDATE_PROFILE, data);
export const getMe = () => api.get(ENDPOINTS.AUTH.ME);
export const logout = () => api.post(ENDPOINTS.AUTH.LOGOUT);
export const deleteAccount = () => api.delete(ENDPOINTS.AUTH.DELETE);