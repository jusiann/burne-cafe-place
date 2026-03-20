export const USER_ROLES = {
    CUSTOMER: 'customer',
    STAFF: 'staff',
    ADMIN: 'admin',
};

export const ORDER_STATUS = {
    PREPARING: 'preparing',
    READY: 'ready',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
    preparing: 'Hazırlanıyor',
    ready: 'Hazır',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
};
export const PAYMENT_METHODS = {
    CASH: 'cash',
    CREDIT_CARD: 'credit_card',
};
export const PAYMENT_METHOD_LABELS = {
    cash: 'Nakit',
    credit_card: 'Kredi Kartı',
};
export const PRODUCT_OPTION_TYPES = {
    SIZE: 'size',
    MILK: 'milk',
    EXTRA: 'extra',
};
export const APP_CONFIG = {
    POLLING_INTERVAL: 30000,
    TAX_RATE: 0.20,
    DEFAULT_LANGUAGE: 'tr',
};
