'use client'
import { useEffect, useState } from "react";

export const useDebounce = (initialValue: string = '', delay: number = 250) => {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);

    // Update both values when initialValue changes
    useEffect(() => {
        setValue(initialValue);
        setDebouncedValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timeout);
    }, [value, delay]);

    return [debouncedValue, setValue] as const;
}