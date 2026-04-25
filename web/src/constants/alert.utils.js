import { toast } from 'sonner';

const DEFAULT_TOAST_DURATION = 2200;
const ERROR_TOAST_DURATION = 3200;

export const showSuccess = (message, options = {}) =>
    toast.success(message, { duration: DEFAULT_TOAST_DURATION, ...options });
export const showError = (message, options = {}) =>
    toast.error(message, { duration: ERROR_TOAST_DURATION, ...options });
export const showWarning = (message, options = {}) =>
    toast.warning(message, { duration: DEFAULT_TOAST_DURATION, ...options });
export const showInfo = (message, options = {}) =>
    toast.info(message, { duration: DEFAULT_TOAST_DURATION, ...options });
export const showPromise = (promise, messages) =>
    toast.promise(promise, {
        loading: messages.loading || 'Yükleniyor...',
        success: messages.success || 'Başarılı!',
        error: messages.error || 'Bir hata oluştu.',
    });
