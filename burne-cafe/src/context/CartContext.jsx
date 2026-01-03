import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import coupons from '../data/coupons.json';

const CART_STORAGE_KEY = 'burne-cafe-cart';
const COUPON_STORAGE_KEY = 'burne-cafe-coupon';
const ORDERS_STORAGE_KEY = 'burne-cafe-orders';

const ORDER_STATUSES = {
    PREPARING: 'preparing',
    ON_THE_WAY: 'on_the_way',
    DELIVERED: 'delivered'
};

const STATUS_LABELS = {
    [ORDER_STATUSES.PREPARING]: 'Hazırlanıyor',
    [ORDER_STATUSES.ON_THE_WAY]: 'Yolda',
    [ORDER_STATUSES.DELIVERED]: 'Teslim Edildi'
};

function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${year}${month}${day}${random}`;
}

const CartContext = createContext(null);

function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        try {
            const stored = localStorage.getItem(COUPON_STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const [orders, setOrders] = useState(() => {
        try {
            const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [latestOrder, setLatestOrder] = useState(null);

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

    const generateItemId = useCallback((productId, size, milkOption, extras) => {
        const extrasStr = extras ? extras.sort().join(',') : '';
        return `${productId}-${size || 'default'}-${milkOption || 'default'}-${extrasStr}`;
    }, []);

    const addToCart = useCallback((product, quantity = 1, size = null, milkOption = null, extras = [], note = '') => {
        const itemId = generateItemId(product.id, size?.name, milkOption?.name, extras.map(e => e.name));

        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.itemId === itemId);

            if (existingItem) {
                return prevItems.map(item =>
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

            const newItem = {
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

            return [...prevItems, newItem];
        });

        return true;
    }, [generateItemId]);

    const removeFromCart = useCallback((itemId) => {
        setItems(prevItems => prevItems.filter(item => item.itemId !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setItems(prevItems =>
            prevItems.map(item =>
                item.itemId === itemId ? { ...item, quantity } : item
            )
        );
    }, [removeFromCart]);

    const updateItem = useCallback((oldItemId, product, quantity, size, milkOption, extras, note) => {
        removeFromCart(oldItemId);
        addToCart(product, quantity, size, milkOption, extras, note);
    }, [removeFromCart, addToCart]);

    const clearCart = useCallback(() => {
        setItems([]);
        setAppliedCoupon(null);
    }, []);

    const applyCoupon = useCallback((code) => {
        const coupon = coupons.find(c =>
            c.code.toLowerCase() === code.toLowerCase() && c.isActive
        );

        if (!coupon) {
            return { success: false, message: 'Geçersiz kupon kodu' };
        }

        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        if (subtotal < coupon.minOrderAmount) {
            return {
                success: false,
                message: `Bu kupon en az ₺${coupon.minOrderAmount} tutarındaki siparişlerde geçerlidir`
            };
        }

        setAppliedCoupon(coupon);
        return { success: true, message: 'Kupon başarıyla uygulandı!' };
    }, [items]);

    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
    }, []);

    const cartTotals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.discountType === 'percentage') {
                discount = subtotal * (appliedCoupon.discountValue / 100);
            } else {
                discount = appliedCoupon.discountValue;
            }
        }

        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.20; // %20 KDV
        const total = afterDiscount + tax;

        return {
            subtotal,
            discount,
            tax,
            total,
            itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
        };
    }, [items, appliedCoupon]);

    const createOrder = useCallback((orderData) => {
        const newOrder = {
            id: `ORD-${Date.now()}`,
            orderNumber: generateOrderNumber(),
            date: new Date().toISOString(),
            status: ORDER_STATUSES.PREPARING,
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
            paymentMethod: orderData.paymentMethod,
            orderNote: orderData.orderNote || '',
            subtotal: cartTotals.subtotal,
            tax: cartTotals.tax,
            discount: cartTotals.discount,
            couponCode: appliedCoupon?.code || null,
            total: cartTotals.total,
            estimatedDelivery: '30-45 dakika'
        };

        setOrders(prevOrders => [newOrder, ...prevOrders]);
        setLatestOrder(newOrder);
        clearCart();

        return newOrder;
    }, [items, cartTotals, appliedCoupon, clearCart]);

    const getOrderById = useCallback((orderId) => {
        return orders.find(order => order.id === orderId);
    }, [orders]);

    const reorderFromOrder = useCallback((orderId, products) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return false;

        order.items.forEach(orderItem => {
            const product = products.find(p => p.id === orderItem.productId);
            if (product) {
                addToCart(
                    product,
                    orderItem.quantity,
                    orderItem.size,
                    orderItem.milkOption,
                    orderItem.extras || [],
                    orderItem.note || ''
                );
            }
        });

        return true;
    }, [orders, addToCart]);

    const clearLatestOrder = useCallback(() => {
        setLatestOrder(null);
    }, []);

    const value = {
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
        reorderFromOrder,
        clearLatestOrder,
        ORDER_STATUSES,
        STATUS_LABELS
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export { CartProvider, ORDER_STATUSES, STATUS_LABELS };
export const useCart = () => useContext(CartContext);
