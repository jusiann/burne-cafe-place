export const STORAGE_KEYS = {
    TOKEN: 'burne-cafe-token',
    REFRESH_TOKEN: 'burne-cafe-refresh-token',
    USER: 'burne-cafe-user',
    LOCATION: 'burne-cafe-location',
    CART: 'burne-cafe-cart',
    COUPON: 'burne-cafe-coupon',
    LANGUAGE: 'burne-cafe-language',
};
export const getItem = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
};
export const setItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Storage setItem error:', error);
    }
};
export const removeItem = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Storage removeItem error:', error);
    }
};
export const clearAll = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
    });
};
