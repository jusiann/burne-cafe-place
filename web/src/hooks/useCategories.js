import { useState, useEffect, useCallback } from 'react';
import { getCategories } from '../services/category.service.js';


export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getCategories();
            setCategories(response.categories || response || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Kategoriler yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        isLoading,
        error,
        refetch: fetchCategories
    };
};
