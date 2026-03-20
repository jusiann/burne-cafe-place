import api from './api.js';
import { ENDPOINTS } from '../constants/api.utils.js';

export const createOrder = (data) => api.post(ENDPOINTS.ORDERS.CREATE, data);
export const getMyOrders = () => api.get(ENDPOINTS.ORDERS.MY_ORDERS);
export const getOrders = (params) => api.get(ENDPOINTS.ORDERS.LIST, { params });
export const getOrderById = (id) => api.get(ENDPOINTS.ORDERS.BY_ID(id));
export const updateOrderStatus = (id, data) => api.patch(ENDPOINTS.ORDERS.UPDATE_STATUS(id), data);
export const cancelOrder = (id, data) => api.patch(ENDPOINTS.ORDERS.CANCEL(id), data);
