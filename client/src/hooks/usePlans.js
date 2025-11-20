// src/hooks/usePlans.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export const usePlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Use the public route to get active plans
                const { data } = await api.get('/api/plans');
                setPlans(data);
            } catch (error) {
                console.error("Failed to fetch plans:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    return { plans, loading };
};