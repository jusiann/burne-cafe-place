import {create} from 'zustand';
import {signIn, signUp, getMe, logout as logoutService, updateProfile as updateProfileService} from '../services/auth.service.js';
import {STORAGE_KEYS, getItem, setItem, removeItem} from '../constants/storage.utils.js';

const useAuthStore = create((set, get) => ({
    user: getItem(STORAGE_KEYS.USER),
    token: getItem(STORAGE_KEYS.TOKEN),
    isLoading: false,
    isAuthenticated: !!getItem(STORAGE_KEYS.TOKEN),

        login: async (credentials) => {
        set({isLoading: true});

        try {
            const response = await signIn(credentials);

            setItem(STORAGE_KEYS.TOKEN, response.access_token);
            setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
            setItem(STORAGE_KEYS.USER, response.user);

            set({
                user: response.user,
                token: response.access_token,
                isAuthenticated: true,
                isLoading: false,
            });

            return {success: true, message: response.message};
        } catch (error) {
            set({isLoading: false});
            return {
                success: false,
                message: error.response?.data?.message || 'Giriş başarısız.',
            };
        }
    },

        register: async (data) => {
        set({isLoading: true});

        try {
            const response = await signUp(data);

            setItem(STORAGE_KEYS.TOKEN, response.access_token);
            setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
            setItem(STORAGE_KEYS.USER, response.user);

            set({
                user: response.user,
                token: response.access_token,
                isAuthenticated: true,
                isLoading: false,
            });

            return {success: true, message: response.message};
        } catch (error) {
            set({isLoading: false});
            return {
                success: false,
                message: error.response?.data?.message || 'Kayıt başarısız.',
            };
        }
    },

        logout: async () => {
        try {
            await logoutService();
        } catch {
                    }

        removeItem(STORAGE_KEYS.TOKEN);
        removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        removeItem(STORAGE_KEYS.USER);

        set({
            user: null,
            token: null,
            isAuthenticated: false,
        });
    },

        checkAuth: async () => {
        const token = getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
            set({user: null, token: null, isAuthenticated: false});
            return;
        }

        set({isLoading: true});

        try {
            const response = await getMe();

            setItem(STORAGE_KEYS.USER, response.user);
            set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch {
            removeItem(STORAGE_KEYS.TOKEN);
            removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            removeItem(STORAGE_KEYS.USER);

            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

        updateProfile: async (data) => {
        set({isLoading: true});

        try {
            const response = await updateProfileService(data);

            setItem(STORAGE_KEYS.USER, response.user);
            set({user: response.user, isLoading: false});

            return {success: true, message: response.message};
        } catch (error) {
            set({isLoading: false});
            return {
                success: false,
                message: error.response?.data?.message || 'Profil güncellenemedi.',
            };
        }
    },

        isCustomer: () => get().user?.role === 'customer',
    isStaff: () => get().user?.role === 'staff',
    isAdmin: () => get().user?.role === 'admin',
}));

export default useAuthStore;
