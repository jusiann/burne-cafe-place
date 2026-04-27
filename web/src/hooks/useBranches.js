import { useState, useEffect, useCallback } from 'react';
import { getBranches, getBranchById } from '../services/branch.service.js';

export const useBranches = (params = {}) => {
    const [branches, setBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBranches = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getBranches(params);
            setBranches(response.branches || response || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Şubeler yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    return {
        branches,
        isLoading,
        error,
        refetch: fetchBranches
    };
};

export const useBranch = (id) => {
    const [branch, setBranch] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBranch = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await getBranchById(id);
            setBranch(response.branch || response);
        } catch (err) {
            setError(err.response?.data?.error || 'Şube bulunamadı.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchBranch();
    }, [fetchBranch]);

    return {
        branch,
        isLoading,
        error, refetch: fetchBranch
    };
};
