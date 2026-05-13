'use client';

import { useState, useEffect, useCallback } from "react";
import { FilterAttributePresenter, FilterAttributeInput } from "@repo/core/models";
import FilterPanel from "./filter-panel";
import { useFilterState } from "../hooks/useFilterState";

export interface FilterWrapperProps {
    title: string;
    store?: string;
    category?: string;
    sousCategory?: string;
    filterAttributes: FilterAttributePresenter[];
    baseFilters?: any[];
    onFilterChange?: (filterInput: FilterAttributeInput[]) => void;
    onFetchProducts?: (filterInput: FilterAttributeInput[]) => void;
}

export default function FilterWrapper({
    title,
    store,
    category,
    sousCategory,
    filterAttributes,
    baseFilters = [],
    onFilterChange,
    onFetchProducts
}: FilterWrapperProps) {
    const [filterAttributeInput, setFilterAttributeInput] = useState<FilterAttributeInput[]>([]);

    // Use filter state hook to get cookie-based selections
    const context = { store, category, sousCategory };
    const { filterState } = useFilterState(undefined, context);

    // Function to build filter input from cookie state
    const buildFilterInputFromCookies = useCallback(() => {
        const input: FilterAttributeInput[] = [];
        
        // Helper function to process attribute selections
        const processAttribute = (
            selectedValues: string[],
            attribute: FilterAttributePresenter | undefined,
            type: string
        ) => {
            if (selectedValues.length > 0 && attribute) {
                const filteredFilters = attribute.filters.filter(filter => selectedValues.includes(filter.nom));
                const valueIds = filteredFilters.map(filter => filter.attribut_values?.map(attr => attr.id) || []).flat();
                
                if (valueIds.length > 0) {
                    input.push({
                        id_attribute: attribute.id,
                        attribute_value_ids: valueIds,
                        attribute_value: selectedValues,
                        type: type as 'size' | 'color' | 'brand' | 'price' | 'attribute' | 'dynamic'
                    });
                }
            }
        };

        // Process each filter type from cookies
        const sizeAttribute = filterAttributes.find(attr => attr.nom.toLowerCase() === "taille");
        processAttribute(filterState.selectedSizes, sizeAttribute, "size");

        const brandAttribute = filterAttributes.find(attr => attr.type?.toLowerCase() === "brand");
        processAttribute(filterState.selectedBrands, brandAttribute, "brand");

        const colorAttribute = filterAttributes.find(attr => attr.filters.some(f => f.couleur !== ""));
        processAttribute(filterState.selectedColors, colorAttribute, "color");

        // Process dynamic attributes from cookies
        Object.entries(filterState.selectedAttributes).forEach(([attributeName, values]) => {
            if (values.length > 0) {
                const attribute = filterAttributes.find(attr => attr.nom === attributeName);
                processAttribute(values, attribute, "dynamic");
            }
        });

        // Process price from cookies
        if (filterState.selectedPrices && filterState.selectedPrices.length === 2) {
            const [minPrice, maxPrice] = filterState.selectedPrices;
            if (minPrice !== undefined && maxPrice !== undefined && (minPrice !== 0 || maxPrice !== 1000)) {
                input.push({
                    id_attribute: 0,
                    attribute_value_ids: [],
                    attribute_value: [minPrice.toFixed(2).toString(), maxPrice.toFixed(2).toString()],
                    type: "price"
                });
            }
        }

        return input;
    }, [filterState, filterAttributes]);


    // Handle filter changes
    const handleFilterAttributeInputChange = useCallback((filterInput: FilterAttributeInput[]) => {
        setFilterAttributeInput(filterInput);
        
        // Notify parent component about filter changes
        onFilterChange?.(filterInput);
        
        // Call the fetch products callback if provided
        if (onFetchProducts) {
            onFetchProducts(filterInput);
        }
    }, [onFilterChange, onFetchProducts]);

    // Handle filter state changes (for cookies)
    const handleFiltersChange = useCallback((filters: any) => {
        // This can be used to update cookies or other state
    }, []);

    // Initial load with cookie-based filters
    useEffect(() => {
        const cookieFilters = buildFilterInputFromCookies();
        if (cookieFilters.length > 0) {
            setFilterAttributeInput(cookieFilters);
            // Notify parent component about initial filters
            onFetchProducts?.(cookieFilters);
        }
    }, [buildFilterInputFromCookies, onFetchProducts]);

    return (
        <FilterPanel
            title={title}
            store={store}
            category={category}
            sousCategory={sousCategory}
            filterAttributes={filterAttributes}
            onFiltersChange={handleFiltersChange}
            onFilterAttributeInputChange={handleFilterAttributeInputChange}
        />
    );
}
