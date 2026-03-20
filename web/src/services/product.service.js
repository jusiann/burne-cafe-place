import api from './api.js';
import { ENDPOINTS } from '../constants/api.utils.js';

export const getProducts = (params) => api.get(ENDPOINTS.PRODUCTS.LIST, { params });
export const getProductById = (id) => api.get(ENDPOINTS.PRODUCTS.BY_ID(id));
