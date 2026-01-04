import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import coupons from '../data/coupons.json';
import ordersData from '../data/orders.json';

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
            return stored ? JSON.parse(stored) : ordersData;
        } catch {
            return ordersData;
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

    const validateCouponConditions = useCallback((coupon, cartItems, currentOrders) => {
        if (!coupon) return { valid: false, message: '' };

        // 1. Min Tutar Kontrolü
        const subtotal = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        if (subtotal < coupon.minOrderAmount) {
            return { valid: false, message: `Bu kupon için minimum sepet tutarı ${coupon.minOrderAmount} TL olmalıdır.` };
        }

        // 2. Özel Kurallar (Hardcoded Validation)
        // ILK15 - İlk Sipariş
        if (coupon.code === 'ILK15') {
            if (currentOrders.length > 0) {
                return { valid: false, message: 'Bu kupon sadece ilk siparişinizde geçerlidir.' };
            }
        }

        // IKILIM20 - Americano (11) & Latte (12)
        if (coupon.code === 'IKILIM20') {
            const hasAmericano = cartItems.some(i => i.productId === 11);
            const hasLatte = cartItems.some(i => i.productId === 12);
            if (!hasAmericano || !hasLatte) {
                return { valid: false, message: 'Bu kupon için sepetinizde Americano ve Latte bulunmalıdır.' };
            }
        }

        // MIEL10 - Miel (1)
        if (coupon.code === 'MIEL10') {
            const mielItems = cartItems.filter(i => i.productId === 1);
            if (mielItems.length === 0) {
                return { valid: false, message: 'Bu kupon sadece Miel siparişlerinde geçerlidir.' };
            }

            // Check if any Miel item has extras that would generate a discount
            const hasExtras = mielItems.some(item => {
                const sizePrice = item.size?.price || 0;
                const milkPrice = item.milkOption?.price || 0;
                const extrasPrice = item.extras?.reduce((sum, e) => sum + (e.price || 0), 0) || 0;
                return (sizePrice + milkPrice + extrasPrice) > 0;
            });

            if (!hasExtras) {
                return { valid: false, message: 'Bu kupon Miel ürününün ekstraları (boyut, süt vb.) için geçerlidir.' };
            }
        }

        return { valid: true, message: '' };
    }, []);

    useEffect(() => {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    }, [orders]);

    // Sepet değiştiğinde veya sipariş durumunda kupon geçerliliğini kontrol et
    useEffect(() => {
        if (appliedCoupon) {
            const validation = validateCouponConditions(appliedCoupon, items, orders);
            if (!validation.valid) {
                setAppliedCoupon(null);
            }
        }
    }, [items, orders, appliedCoupon, validateCouponConditions]);

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

        const validation = validateCouponConditions(coupon, items, orders);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        setAppliedCoupon(coupon);
        return { success: true, message: 'Kupon başarıyla uygulandı!' };
    }, [items, orders, validateCouponConditions]);

    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
    }, []);

    const cartTotals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

        let discount = 0;
        if (appliedCoupon) {
            // Kupon gereksinimini tüm kurallara göre kontrol et
            const validation = validateCouponConditions(appliedCoupon, items, orders);

            if (validation.valid) {
                if (validation.valid) {
                    if (appliedCoupon.code === 'MIEL10') {
                        // MIEL10 Logic: Sadece Miel (id: 1) ürününün ekstraları (boyut, süt, şurup vb.) üzerinden indirim
                        let mielExtrasTotal = 0;
                        items.forEach(item => {
                            if (item.productId === 1) { // Miel ID is 1
                                const sizePrice = item.size?.price || 0;
                                const milkPrice = item.milkOption?.price || 0;
                                const extrasPrice = item.extras?.reduce((sum, e) => sum + (e.price || 0), 0) || 0;
                                mielExtrasTotal += (sizePrice + milkPrice + extrasPrice) * item.quantity;
                            }
                        });

                        if (appliedCoupon.discountType === 'percentage') {
                            discount = mielExtrasTotal * (appliedCoupon.discountValue / 100);
                        } else {
                            // Eğer sabit tutarlı ise direkt uygula (bu case şu an json'da % ama genel destek olsun)
                            discount = appliedCoupon.discountValue;
                        }
                    }
                    else if (appliedCoupon.discountType === 'percentage') {
                        discount = subtotal * (appliedCoupon.discountValue / 100);
                    } else {
                        discount = appliedCoupon.discountValue;
                    }
                }
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
    }, [items, appliedCoupon, orders, validateCouponConditions]);

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
