import { useState, useEffect, useCallback } from 'react';
import { getProducts, getProductById } from '../services/product.service.js';


export const useProducts = (params = {}) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getProducts(params);
            setProducts(response.products || response || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Ürünler yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        isLoading,
        error,
        refetch: fetchProducts
    };
};

export const useProduct = (id) => {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProduct = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await getProductById(id);
            setProduct(response.product || response);
        } catch (err) {
            setError(err.response?.data?.message || 'Ürün bulunamadı.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    return {
        product,
        isLoading,
        error,
        refetch: fetchProduct
    };
};
