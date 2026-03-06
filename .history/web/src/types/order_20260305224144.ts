import type { ProductSize, MilkOption, Extra } from './product';

export type OrderStatus = 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';

export interface OrderItem {
    productId: number;
    name: string;
    image: string;
    quantity: number;
    size: ProductSize | null;
    milkOption: MilkOption | null;
    extras: Extra[];
    note: string;
    unitPrice: number;
    totalPrice: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    date: string;
    status: OrderStatus;
    items: OrderItem[];
    customer: {
        name: string;
        phone: string;
    };
    address: {
        city: string;
        district: string;
        neighborhood: string;
        fullAddress: string;
    };
    deliveryTime: string;
    customTime: string;
    paymentMethod: string;
    orderNote: string;
    subtotal: number;
    tax: number;
    discount: number;
    couponCode: string | null;
    total: number;
    estimatedDelivery: string;
}
