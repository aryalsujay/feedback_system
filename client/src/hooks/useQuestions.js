import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const useQuestions = () => {
    const [questions, setQuestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/config/questions`)
            .then(res => res.json())
            .then(data => {
                setQuestions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching config:', err);
                setError(err);
                setLoading(false);
            });
    }, []);

    return { questions, loading, error };
};

export default useQuestions;
