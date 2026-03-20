import api from './api.js';
import { ENDPOINTS } from '../constants/api.utils.js';

export const getCategories = () => api.get(ENDPOINTS.CATEGORIES.LIST);
export const getCategoryById = (id) => api.get(ENDPOINTS.CATEGORIES.BY_ID(id));
