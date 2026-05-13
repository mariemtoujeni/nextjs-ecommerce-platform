import { useState, useEffect, useCallback, useMemo } from 'react';
import { FilterState } from '../components/filter-panel';

// Utility functions for cookie management
const COOKIE_PREFIX = 'filter_';
const COOKIE_EXPIRY_DAYS = 30;

// Generate a unique key for cookies based on context
const getContextKey = (context?: { store?: string; category?: string; sousCategory?: string }) => {
    if (!context) return 'default';
    const { store, category, sousCategory } = context;
    return `${store || 'no-store'}_${category || 'no-category'}_${sousCategory || 'no-subcategory'}`;
};

const getCookieValue = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

const setCookieValue = (name: string, value: string, days: number = COOKIE_EXPIRY_DAYS) => {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getFilterStateFromCookies = (context?: { store?: string; category?: string; sousCategory?: string }): FilterState => {
    const defaultState: FilterState = {
        selectedSizes: [],
        selectedBrands: [],
        selectedPrices: [0, 1000],
        selectedColors: [],
        selectedAttributes: {}
    };

    try {
        const contextKey = getContextKey(context);
        const sizes = getCookieValue(`${COOKIE_PREFIX}sizes_${contextKey}`);
        const brands = getCookieValue(`${COOKIE_PREFIX}brands_${contextKey}`);
        const prices = getCookieValue(`${COOKIE_PREFIX}prices_${contextKey}`);
        const colors = getCookieValue(`${COOKIE_PREFIX}colors_${contextKey}`);
        const attributes = getCookieValue(`${COOKIE_PREFIX}attributes_${contextKey}`);

        return {
            selectedSizes: sizes ? JSON.parse(sizes) : defaultState.selectedSizes,
            selectedBrands: brands ? JSON.parse(brands) : defaultState.selectedBrands,
            selectedPrices: prices ? JSON.parse(prices) : defaultState.selectedPrices,
            selectedColors: colors ? JSON.parse(colors) : defaultState.selectedColors,
            selectedAttributes: attributes ? JSON.parse(attributes) : defaultState.selectedAttributes
        };
    } catch (error) {
        console.warn('Error parsing filter cookies:', error);
        return defaultState;
    }
};

const saveFilterStateToCookies = (state: FilterState, context?: { store?: string; category?: string; sousCategory?: string }) => {
    const contextKey = getContextKey(context);
    setCookieValue(`${COOKIE_PREFIX}sizes_${contextKey}`, JSON.stringify(state.selectedSizes));
    setCookieValue(`${COOKIE_PREFIX}brands_${contextKey}`, JSON.stringify(state.selectedBrands));
    setCookieValue(`${COOKIE_PREFIX}prices_${contextKey}`, JSON.stringify(state.selectedPrices));
    setCookieValue(`${COOKIE_PREFIX}colors_${contextKey}`, JSON.stringify(state.selectedColors));
    setCookieValue(`${COOKIE_PREFIX}attributes_${contextKey}`, JSON.stringify(state.selectedAttributes));
};

export const useFilterState = (
    onFiltersChange?: (filters: FilterState) => void,
    context?: { store?: string; category?: string; sousCategory?: string },
    onClearAll?: () => void
) => {
    // Memoize context to prevent unnecessary re-renders
    const memoizedContext = useMemo(() => context, [
        context?.store,
        context?.category,
        context?.sousCategory
    ]);
    
    const [filterState, setFilterState] = useState<FilterState>(() => getFilterStateFromCookies(memoizedContext));
    const [lastContext, setLastContext] = useState(memoizedContext);

    // Check if context has changed and reset filters if needed
    useEffect(() => {
        if (memoizedContext && lastContext) {
            const contextChanged = 
                memoizedContext.store !== lastContext.store ||
                memoizedContext.category !== lastContext.category ||
                memoizedContext.sousCategory !== lastContext.sousCategory;
            
            if (contextChanged) {
                // Reset filters when context changes
                const defaultState: FilterState = {
                    selectedSizes: [],
                    selectedBrands: [],
                    selectedPrices: [0, 1000],
                    selectedColors: [],
                    selectedAttributes: {}
                };
                setFilterState(defaultState);
                saveFilterStateToCookies(defaultState, memoizedContext);
            }
        }
        setLastContext(memoizedContext);
    }, [memoizedContext, lastContext]);

    // Save filter state to cookies whenever it changes
    useEffect(() => {
        saveFilterStateToCookies(filterState, memoizedContext);
        onFiltersChange?.(filterState);
    }, [filterState, onFiltersChange, memoizedContext]);

    // Optimized filter update functions
    const updateFilterState = useCallback((updates: Partial<FilterState>) => {
        setFilterState(prev => ({ ...prev, ...updates }));
    }, []);

    const toggleBrand = useCallback((brandName: string) => {
        setFilterState(prev => ({
            ...prev,
            selectedBrands: prev.selectedBrands.includes(brandName)
                ? prev.selectedBrands.filter(b => b !== brandName)
                : [...prev.selectedBrands, brandName]
        }));
    }, []);

    const toggleSize = useCallback((sizeName: string) => {
        setFilterState(prev => ({
            ...prev,
            selectedSizes: prev.selectedSizes.includes(sizeName)
                ? prev.selectedSizes.filter(s => s !== sizeName)
                : [...prev.selectedSizes, sizeName]
        }));
    }, []);

    const toggleColor = useCallback((colorName: string) => {
        setFilterState(prev => ({
            ...prev,
            selectedColors: prev.selectedColors.includes(colorName)
                ? prev.selectedColors.filter(c => c !== colorName)
                : [...prev.selectedColors, colorName]
        }));
    }, []);

    const toggleAttribute = useCallback((attributeName: string, value: string) => {
        setFilterState(prev => ({
            ...prev,
            selectedAttributes: {
                ...prev.selectedAttributes,
                [attributeName]: prev.selectedAttributes[attributeName]?.includes(value)
                    ? prev.selectedAttributes[attributeName].filter(v => v !== value)
                    : [...(prev.selectedAttributes[attributeName] || []), value]
            }
        }));
    }, []);

    // Generic function to toggle any filter value dynamically
    const toggleFilterValue = useCallback((filterType: string, value: string) => {
        setFilterState(prev => {
            const currentValues = prev.selectedAttributes[filterType] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            
            return {
                ...prev,
                selectedAttributes: {
                    ...prev.selectedAttributes,
                    [filterType]: newValues
                }
            };
        });
    }, []);

    const updatePrices = useCallback((prices: number[]) => {
        setFilterState(prev => ({ ...prev, selectedPrices: prices }));
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilterState({
            selectedSizes: [],
            selectedBrands: [],
            selectedPrices: [0, 1000],
            selectedColors: [],
            selectedAttributes: {}
        });
        // Call the callback to trigger fetchFilters
        onClearAll?.();
    }, [onClearAll]);

    // Memoized computed values
    const activeFiltersCount = useMemo(() => {
        return Object.values(filterState.selectedAttributes).flat().length + 
               filterState.selectedSizes.length + 
               filterState.selectedBrands.length + 
               filterState.selectedColors.length;
    }, [filterState]);

    const hasActiveFilters = useMemo(() => {
        return activeFiltersCount > 0;
    }, [activeFiltersCount]);

    return {
        filterState,
        updateFilterState,
        toggleBrand,
        toggleSize,
        toggleColor,
        toggleAttribute,
        toggleFilterValue, // New generic function for dynamic filters
        updatePrices,
        clearAllFilters,
        activeFiltersCount,
        hasActiveFilters
    };
};
