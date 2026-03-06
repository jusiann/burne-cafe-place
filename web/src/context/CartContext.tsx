import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Product, ProductSize, MilkOption, Extra } from '../types/product';
import type { CartItem, CartTotals, CartContextValue } from '../types/cart';
import type { Coupon } from '../types/coupon';
import type { Order, OrderStatus } from '../types/order';
import type { CheckoutFormData } from '../types/checkout';
import couponsData from '../data/coupons.json';
import ordersData from '../data/orders.json';

/* STORAGE KEYS */
const CART_STORAGE_KEY = 'burne-cafe-cart';
const COUPON_STORAGE_KEY = 'burne-cafe-coupon';
const ORDERS_STORAGE_KEY = 'burne-cafe-orders';

const CartContext = createContext<CartContextValue | null>(null);

function CartProvider({ children }: { children: ReactNode }) {
    const [latestOrder, setLatestOrder] = useState<Order | null>(null);

    /* STATE INITIALIZATION */
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? (JSON.parse(stored) as CartItem[]) : [];
        } catch {
            return [];
        }
    });

    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
        try {
            const stored = localStorage.getItem(COUPON_STORAGE_KEY);
            return stored ? (JSON.parse(stored) as Coupon) : null;
        } catch {
            return null;
        }
    });

    const [orders, setOrders] = useState<Order[]>(() => {
        try {
            const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
            return stored ? (JSON.parse(stored) as Order[]) : (ordersData as Order[]);
        } catch {
            return ordersData as Order[];
        }
    });

    /* COUPON VALIDATION */
    const validateCouponConditions = useCallback((
        coupon: Coupon,
        cartItems: CartItem[],
        currentOrders: Order[]
    ): { valid: boolean; message: string } => {
        if (!coupon)
            return { valid: false, message: '' };

        const subtotal = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        if (subtotal < coupon.minOrderAmount)
            return { valid: false, message: `Bu kupon için minimum sepet tutarı ${coupon.minOrderAmount} TL olmalıdır.` };

        if (coupon.code === 'ILK15') {
            if (currentOrders.length > 0)
                return { valid: false, message: 'Bu kupon sadece ilk siparişinizde geçerlidir.' };
        }

        if (coupon.code === 'IKILIM20') {
            const hasAmericano = cartItems.some(item => item.productId === 11);
            const hasLatte = cartItems.some(item => item.productId === 12);
            if (!hasAmericano || !hasLatte)
                return { valid: false, message: 'Bu kupon için sepetinizde Americano ve Latte bulunmalıdır.' };
        }

        if (coupon.code === 'MIEL10') {
            const mielItems = cartItems.filter(item => item.productId === 1);
            if (mielItems.length === 0) {
                return { valid: false, message: 'Bu kupon sadece Miel siparişlerinde geçerlidir.' };
            }
        }

        return {
            valid: true,
            message: ''
        };
    }, []);

    /* CART OPERATIONS */
    const generateItemId = useCallback((
        productId: number,
        size: string | undefined,
        milkOption: string | undefined,
        extras: string[] | undefined
    ): string => {
        const extrasStr = extras ? extras.sort().join(',') : '';
        return `${productId}-${size || 'default'}-${milkOption || 'default'}-${extrasStr}`;
    }, []);

    const addToCart = useCallback((
        product: Product,
        quantity = 1,
        size: ProductSize | null = null,
        milkOption: MilkOption | null = null,
        extras: Extra[] = [],
        note = ''
    ): boolean => {
        const itemId = generateItemId(product.id, size?.name, milkOption?.name, extras.map(extra => extra.name));

        setItems(previous => {
            const existingItem = previous.find(item => item.itemId === itemId);

            if (existingItem) {
                return previous.map(item =>
                    item.itemId === itemId
                        ? { ...item, quantity: item.quantity + quantity, note: note || item.note }
                        : item
                );
            }

            const basePrice = product.discount > 0
                ? product.price - (product.price * product.discount / 100)
                : product.price;
            const sizePrice = size?.price || 0;
            const milkPrice = milkOption?.price || 0;
            const extrasPrice = extras.reduce((sum, extra) => sum + (extra.price || 0), 0);
            const unitPrice = basePrice + sizePrice + milkPrice + extrasPrice;

            const newItem: CartItem = {
                itemId,
                productId: product.id,
                name: product.name,
                image: product.image,
                category: product.category,
                basePrice: product.price,
                discount: product.discount || 0,
                size,
                milkOption,
                extras,
                quantity,
                unitPrice,
                note
            };

            return [...previous, newItem];
        });

        return true;
    }, [generateItemId]);

    const removeFromCart = useCallback((itemId: string) => {
        setItems(previous => previous.filter(item => item.itemId !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setItems(previous =>
            previous.map(item =>
                item.itemId === itemId ? { ...item, quantity } : item
            )
        );
    }, [removeFromCart]);

    const updateItem = useCallback((
        oldItemId: string,
        product: Product,
        quantity: number,
        size: ProductSize | null,
        milkOption: MilkOption | null,
        extras: Extra[],
        note: string
    ) => {
        removeFromCart(oldItemId);
        addToCart(product, quantity, size, milkOption, extras, note);
    }, [removeFromCart, addToCart]);

    const clearCart = useCallback(() => {
        setItems([]);
        setAppliedCoupon(null);
    }, []);

    /* COUPON OPERATIONS */
    const applyCoupon = useCallback((code: string): { success: boolean; message: string } => {
        const coupon = (couponsData as Coupon[]).find(couponItem =>
            couponItem.code.toLowerCase() === code.toLowerCase() && couponItem.isActive
        );

        if (!coupon)
            return { success: false, message: 'Geçersiz kupon kodu' };

        const validation = validateCouponConditions(coupon, items, orders);
        if (!validation.valid)
            return { success: false, message: validation.message };

        setAppliedCoupon(coupon);
        return {
            success: true,
            message: 'Kupon başarıyla uygulandı!'
        };
    }, [items, orders, validateCouponConditions]);

    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
    }, []);

    /* CART TOTALS CALCULATION */
    const cartTotals = useMemo((): CartTotals => {
        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

        let discount = 0;
        if (appliedCoupon) {
            const validation = validateCouponConditions(appliedCoupon, items, orders);

            if (validation.valid) {
                if (appliedCoupon.discountType === 'percentage') {
                    discount = subtotal * (appliedCoupon.discountValue / 100);
                } else {
                    discount = appliedCoupon.discountValue;
                }
            }
        }

        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.20;
        const total = afterDiscount + tax;

        return {
            subtotal,
            discount,
            tax,
            total,
            itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
        };
    }, [items, appliedCoupon, orders, validateCouponConditions]);

    /* ORDER OPERATIONS */
    const createOrder = useCallback((orderData: CheckoutFormData): Order => {
        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            orderNumber: `#${Date.now()}`,
            date: new Date().toISOString(),
            status: 'preparing' as OrderStatus,
            items: items.map(item => ({
                productId: item.productId,
                name: item.name,
                image: item.image,
                quantity: item.quantity,
                size: item.size,
                milkOption: item.milkOption,
                extras: item.extras,
                note: item.note,
                unitPrice: item.unitPrice,
                totalPrice: item.unitPrice * item.quantity
            })),
            customer: {
                name: orderData.customerName,
                phone: orderData.customerPhone
            },
            address: {
                city: orderData.city,
                district: orderData.district,
                neighborhood: orderData.neighborhood,
                fullAddress: orderData.fullAddress
            },
            deliveryTime: orderData.deliveryTime,
            customTime: orderData.customTime,
            paymentMethod: orderData.paymentMethod,
            orderNote: orderData.orderNote || '',
            subtotal: cartTotals.subtotal,
            tax: cartTotals.tax,
            discount: cartTotals.discount,
            couponCode: appliedCoupon?.code || null,
            total: cartTotals.total,
            estimatedDelivery: orderData.deliveryTime === 'asap'
                ? '15-20 dakika'
                : orderData.deliveryTime === 'custom' && orderData.customTime
                    ? orderData.customTime
                    : '30-45 dakika'
        };

        setOrders(previous => [newOrder, ...previous]);
        setLatestOrder(newOrder);
        clearCart();

        return newOrder;
    }, [items, cartTotals, appliedCoupon, clearCart]);

    const getOrderById = useCallback((orderId: string): Order | undefined => {
        return orders.find(order => order.id === orderId);
    }, [orders]);

    const cancelOrder = useCallback((orderId: string) => {
        setOrders(previous =>
            previous.map(order =>
                order.id === orderId
                    ? { ...order, status: 'cancelled' as OrderStatus }
                    : order
            )
        );
    }, []);

    const clearLatestOrder = useCallback(() => {
        setLatestOrder(null);
    }, []);

    /* CONTEXT VALUE */
    const value: CartContextValue = {
        items,
        appliedCoupon,
        cartTotals,
        addToCart,
        removeFromCart,
        updateItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        isEmpty: items.length === 0,
        orders,
        latestOrder,
        createOrder,
        getOrderById,
        cancelOrder,
        clearLatestOrder
    };

    /* STORAGE SYNC EFFECTS */
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        if (appliedCoupon) {
            localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
        } else {
            localStorage.removeItem(COUPON_STORAGE_KEY);
        }
    }, [appliedCoupon]);

    useEffect(() => {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        if (appliedCoupon) {
            const validation = validateCouponConditions(appliedCoupon, items, orders);
            if (!validation.valid) {
                setAppliedCoupon(null);
            }
        }
    }, [items, orders, appliedCoupon, validateCouponConditions]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export { CartProvider };
export const useCart = (): CartContextValue => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
