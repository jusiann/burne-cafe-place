import { create } from 'zustand';
import * as cartService from '../services/cart.service.js';
import { STORAGE_KEYS, getItem, setItem, removeItem } from '../constants/storage.utils.js';

/* CART STORE */
const useCartStore = create((set, get) => ({
    id: null,
    items: [],
    appliedCoupon: null,
    isLoading: false,

    /* FETCH CART (backend sync) */
    fetchCart: async () => {
        set({ isLoading: true });

        try {
            const response = await cartService.getCart();
            const cart = response.cart || response;

            set({
                id: cart.id || cart.cart_id || null,
                items: cart.items || [],
                appliedCoupon: cart.coupon || cart.applied_coupon || null,
                isLoading: false,
            });
        } catch {
            /* Giriş yapılmamışsa localStorage'dan oku */
            const localItems = getItem(STORAGE_KEYS.CART) || [];
            set({ items: localItems, isLoading: false });
        }
    },

    /* ADD TO CART */
    addToCart: async (productData) => {
        try {
            await cartService.addItemToCart(productData);
            await get().fetchCart();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Sepete eklenemedi.',
            };
        }
    },

    /* REMOVE FROM CART */
    removeFromCart: async (itemId) => {
        try {
            await cartService.removeCartItem(itemId);
            await get().fetchCart();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Ürün kaldırılamadı.',
            };
        }
    },

    /* UPDATE QUANTITY */
    updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0)
            return get().removeFromCart(itemId);

        try {
            await cartService.updateCartItem(itemId, { quantity });
            await get().fetchCart();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Miktar güncellenemedi.',
            };
        }
    },

    /* CLEAR CART */
    clearCart: async () => {
        try {
            await cartService.clearCart();
            set({ items: [], appliedCoupon: null });
            removeItem(STORAGE_KEYS.CART);
            removeItem(STORAGE_KEYS.COUPON);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Sepet temizlenemedi.',
            };
        }
    },

    /* COUPON OPERATIONS */
    applyCoupon: async (code) => {
        try {
            const response = await cartService.validateCoupon({ code });
            await get().fetchCart();
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Kupon geçersiz.',
            };
        }
    },

    removeCoupon: () => {
        set({ appliedCoupon: null });
        removeItem(STORAGE_KEYS.COUPON);
    },

    /* COMPUTED HELPERS */
    getCartTotals: () => {
        const { items, appliedCoupon } = get();
        const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.discount_type === 'percentage')
                discount = subtotal * (appliedCoupon.discount_value / 100);
            else
                discount = appliedCoupon.discount_value;
        }
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.20;
        const total = afterDiscount + tax;

        return { subtotal, discount, tax, total };
    },
    getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
    },
    isEmpty: () => get().items.length === 0,
}));

export default useCartStore;
