const ERROR_MESSAGES = {
    400: 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.',
    401: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
    403: 'Bu işlem için yetkiniz bulunmuyor.',
    404: 'Aradığınız kaynak bulunamadı.',
    409: 'Bu bilgilerle zaten bir kayıt mevcut.',
    422: 'Girdiğiniz bilgiler doğrulanamadı.',
    429: 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.',
    500: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    NETWORK: 'İnternet bağlantınızı kontrol edin.',
    DEFAULT: 'Beklenmeyen bir hata oluştu.',
};
export const getErrorMessage = (error) => {
    if (!error.response)
        return ERROR_MESSAGES.NETWORK;

    const { status, data } = error.response;
    if (data?.error)
        return data.error;
    if (data?.message)
        return data.message;

    return ERROR_MESSAGES[status] || ERROR_MESSAGES.DEFAULT;
};
export const isAuthError = (error) => {
    return error?.response?.status === 401;
};
export const isValidationError = (error) => {
    return error?.response?.status === 422 || error?.response?.status === 400;
};
