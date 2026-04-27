import { useState, useEffect, useCallback } from 'react';
import { getMyOrders, getOrderById } from '../services/order.service.js';


export const useMyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getMyOrders();
            setOrders(response.orders || response || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Siparişler yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        orders,
        isLoading,
        error,
        refetch: fetchOrders
    };
};

export const useOrder = (id) => {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchOrder = useCallback(async () => {
        if (!id)
            return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await getOrderById(id);
            setOrder(response.order || response);
        } catch (err) {
            setError(err.response?.data?.error || 'Sipariş bulunamadı.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    return {
        order,
        isLoading,
        error,
        refetch: fetchOrder
    };
};
