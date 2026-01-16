import { useState, useEffect } from 'react';

/**
 * Hook that provides live time updates every second
 * Uses user's local timezone automatically
 */
export function useTime() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Format time: "8:44:42 PM"
    const time = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(now);

    // Format date: "January 16, 2026"
    const date = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).format(now);

    return { time, date };
}
