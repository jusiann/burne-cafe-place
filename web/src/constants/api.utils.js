export const API_BASE_URL = '/api';
export const API_TIMEOUT = 10000;

export const ENDPOINTS = {
    AUTH: {
        SIGN_UP: '/auth/sign-up',
        SIGN_IN: '/auth/sign-in',
        FORGOT_PASSWORD: '/auth/forgot-password',
        CHECK_RESET_CODE: '/auth/check-reset-code',
        RESET_PASSWORD: '/auth/reset-password',
        REFRESH_TOKEN: '/auth/refresh-token',
        UPDATE_PROFILE: '/auth/update-profile',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        DELETE: '/auth/delete',
    },
    BRANCHES: {
        LIST: '/branches',
        BY_ID: (id) => `/branches/${id}`,
    },
    CART: {
        GET: '/cart',
        ADD_ITEM: '/cart/items',
        UPDATE_ITEM: (itemId) => `/cart/items/${itemId}`,
        REMOVE_ITEM: (itemId) => `/cart/items/${itemId}`,
        CLEAR: '/cart',
        VALIDATE_COUPON: '/cart/coupons/validate',
    },
    CATEGORIES: {
        LIST: '/categories',
        BY_ID: (id) => `/categories/${id}`,
    },
    ORDERS: {
        CREATE: '/orders',
        MY_ORDERS: '/orders/my',
        LIST: '/orders',
        BY_ID: (id) => `/orders/${id}`,
        UPDATE_STATUS: (id) => `/orders/${id}/status`,
        CANCEL: (id) => `/orders/${id}/cancel`,
    },
    PRODUCTS: {
        LIST: '/products',
        BY_ID: (id) => `/products/${id}`,
    },
};
