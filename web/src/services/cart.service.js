import api from './api.js';
import { ENDPOINTS } from '../constants/api.utils.js';

export const getCart = () => api.get(ENDPOINTS.CART.GET);
export const addItemToCart = (data) => api.post(ENDPOINTS.CART.ADD_ITEM, data);
export const updateCartItem = (itemId, data) => api.put(ENDPOINTS.CART.UPDATE_ITEM(itemId), data);
export const removeCartItem = (itemId) => api.delete(ENDPOINTS.CART.REMOVE_ITEM(itemId));
export const clearCart = () => api.delete(ENDPOINTS.CART.CLEAR);
export const validateCoupon = (data) => api.post(ENDPOINTS.CART.VALIDATE_COUPON, data);
