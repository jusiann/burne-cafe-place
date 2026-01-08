import {createContext,useContext,useState,useEffect,useMemo,useCallback} from 'react';
import coupons from '../data/coupons.json';
import ordersData from '../data/orders.json';

/* STORAGE KEYS */
const CART_STORAGE_KEY = 'burne-cafe-cart';
const COUPON_STORAGE_KEY = 'burne-cafe-coupon';
const ORDERS_STORAGE_KEY = 'burne-cafe-orders';

const CartContext = createContext(null);

function CartProvider({children}) {

    /* STATE INITIALIZATION */
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

    /* COUPON VALIDATION */
    const validateCouponConditions = useCallback((coupon,cartItems,currentOrders) => {
        if (!coupon) return {valid: false,message: ''};

        const subtotal = cartItems.reduce((sum,item) => sum + (item.unitPrice * item.quantity), 0);
        if (subtotal < coupon.minOrderAmount) {
            return {valid: false,message: `Bu kupon için minimum sepet tutarı ${coupon.minOrderAmount} TL olmalıdır.`};
        }

        if (coupon.code === 'ILK15') {
            if (currentOrders.length > 0) {
                return {valid: false,message: 'Bu kupon sadece ilk siparişinizde geçerlidir.'};
            }
        }

        if (coupon.code === 'IKILIM20') {
            const hasAmericano = cartItems.some(item => item.productId === 11);
            const hasLatte = cartItems.some(item => item.productId === 12);
            if (!hasAmericano || !hasLatte) {
                return {valid: false,message: 'Bu kupon için sepetinizde Americano ve Latte bulunmalıdır.'};
            }
        }

        if (coupon.code === 'MIEL10') {
            const mielItems = cartItems.filter(item => item.productId === 1);
            if (mielItems.length === 0) {
                return {valid: false,message: 'Bu kupon sadece Miel siparişlerinde geçerlidir.'};
            }
        }

        return {valid: true,message: ''};
    }, []);

    useEffect(() => {
        if (appliedCoupon) {
            const validation = validateCouponConditions(appliedCoupon,items,orders);
            if (!validation.valid) {
                setAppliedCoupon(null);
            }
        }
    }, [items,orders,appliedCoupon,validateCouponConditions]);

    /* CART OPERATIONS */
    const generateItemId = useCallback((productId,size,milkOption,extras) => {
        const extrasStr = extras ? extras.sort().join(',') : '';
        return `${productId}-${size || 'default'}-${milkOption || 'default'}-${extrasStr}`;
    }, []);

    const addToCart = useCallback((product,quantity = 1,size = null,milkOption = null,extras = [],note = '') => {
        const itemId = generateItemId(product.id,size?.name,milkOption?.name,extras.map(extra => extra.name));

        setItems(previous => {
            const existingItem = previous.find(item => item.itemId === itemId);

            if (existingItem) {
                return previous.map(item =>
                    item.itemId === itemId
                        ? {...item,quantity: item.quantity + quantity,note: note || item.note}
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

            return [...previous,newItem];
        });

        return true;
    }, [generateItemId]);

    const removeFromCart = useCallback((itemId) => {
        setItems(previous => previous.filter(item => item.itemId !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId,quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setItems(previous =>
            previous.map(item =>
                item.itemId === itemId ? {...item,quantity} : item
            )
        );
    }, [removeFromCart]);

    const updateItem = useCallback((oldItemId,product,quantity,size,milkOption,extras,note) => {
        removeFromCart(oldItemId);
        addToCart(product,quantity,size,milkOption,extras,note);
    }, [removeFromCart,addToCart]);

    const clearCart = useCallback(() => {
        setItems([]);
        setAppliedCoupon(null);
    }, []);

    /* COUPON OPERATIONS */
    const applyCoupon = useCallback((code) => {
        const coupon = coupons.find(couponItem =>
            couponItem.code.toLowerCase() === code.toLowerCase() && couponItem.isActive
        );

        if (!coupon) {
            return {success: false,message: 'Geçersiz kupon kodu'};
        }

        const validation = validateCouponConditions(coupon,items,orders);
        if (!validation.valid) {
            return {success: false,message: validation.message};
        }

        setAppliedCoupon(coupon);
        return {success: true,message: 'Kupon başarıyla uygulandı!'};
    }, [items,orders,validateCouponConditions]);

    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
    }, []);

    /* CART TOTALS CALCULATION */
    const cartTotals = useMemo(() => {
        const subtotal = items.reduce((sum,item) => sum + (item.unitPrice * item.quantity), 0);

        let discount = 0;
        if (appliedCoupon) {
            const validation = validateCouponConditions(appliedCoupon,items,orders);

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
            itemCount: items.reduce((sum,item) => sum + item.quantity, 0)
        };
    }, [items,appliedCoupon,orders,validateCouponConditions]);

    /* ORDER OPERATIONS */
    const createOrder = useCallback((orderData) => {
        const newOrder = {
            id: `ORD-${Date.now()}`,
            orderNumber: `#${Date.now()}`,
            date: new Date().toISOString(),
            status: 'preparing',
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

        setOrders(previous => [newOrder,...previous]);
        setLatestOrder(newOrder);
        clearCart();

        return newOrder;
    }, [items,cartTotals,appliedCoupon,clearCart]);

    const getOrderById = useCallback((orderId) => {
        return orders.find(order => order.id === orderId);
    }, [orders]);

    const clearLatestOrder = useCallback(() => {
        setLatestOrder(null);
    }, []);

    /* CONTEXT VALUE */
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
        clearLatestOrder
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export {CartProvider};
export const useCart = () => useContext(CartContext);
