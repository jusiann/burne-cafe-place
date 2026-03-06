import type { Product, ProductSize, MilkOption, Extra } from './product';
import type { Coupon } from './coupon';
import type { Order } from './order';
import type { CheckoutFormData } from './checkout';

export interface CartItem {
    itemId: string;
    productId: number;
    name: string;
    image: string;
    category: string;
    basePrice: number;
    discount: number;
    size: ProductSize | null;
    milkOption: MilkOption | null;
    extras: Extra[];
    quantity: number;
    unitPrice: number;
    note: string;
}

export interface CartTotals {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    itemCount: number;
}

export interface CartContextValue {
    items: CartItem[];
    appliedCoupon: Coupon | null;
    cartTotals: CartTotals;
    addToCart: (
        product: Product,
        quantity?: number,
        size?: ProductSize | null,
        milkOption?: MilkOption | null,
        extras?: Extra[],
        note?: string
    ) => boolean;
    removeFromCart: (itemId: string) => void;
    updateItem: (
        oldItemId: string,
        product: Product,
        quantity: number,
        size: ProductSize | null,
        milkOption: MilkOption | null,
        extras: Extra[],
        note: string
    ) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    applyCoupon: (code: string) => { success: boolean; message: string };
    removeCoupon: () => void;
    isEmpty: boolean;
    orders: Order[];
    latestOrder: Order | null;
    createOrder: (orderData: CheckoutFormData) => Order;
    getOrderById: (orderId: string) => Order | undefined;
    cancelOrder: (orderId: string) => void;
    clearLatestOrder: () => void;
}
