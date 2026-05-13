'use client';

import { startTransition, useActionState, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { FilterAttributeInput, FilterAttributePresenter } from "@repo/core/models";
import { X, Settings2, Plus, Minus, LoaderCircle  } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import SizeSelector from "./size-selector";
import PriceSelector from "./price-selector";
import ExpandableList from "./expandable-list";
import { listFilterAttributesAction } from "@repo/actions/attributes";
import { ReturnAll } from "@repo/core/types";
import { listFilterAttributesProps } from "@repo/core/repositories";
import { useFilterState } from "../hooks/useFilterState";

export interface FilterPanelProps {
    title: string;
    store?: string;
    category?: string;
    sousCategory?: string;
    filterAttributes: FilterAttributePresenter[];
    onFiltersChange?: (filters: FilterState) => void;
    onFilterAttributeInputChange?: (filterAttributeInput: FilterAttributeInput[]) => void;
}

export interface FilterState {
    selectedSizes: string[];
    selectedBrands: string[];
    selectedPrices: number[];
    selectedColors: string[];
    selectedAttributes: { [key: string]: string[] };
}

export default function FilterPanel({ 
    filterAttributes: initialFilterAttributes, 
    title, 
    store, 
    category, 
    sousCategory, 
    onFiltersChange,
    onFilterAttributeInputChange
}: FilterPanelProps) {
    // Memoize context to prevent unnecessary re-renders
    const context = useMemo(() => ({ store, category, sousCategory }), [store, category, sousCategory]);

    // Use the custom hook for filter state management
    const {
        filterState,
        updateFilterState,
        toggleBrand,
        toggleSize,
        toggleColor,
        toggleAttribute,
        toggleFilterValue, // Generic function for dynamic filters
        updatePrices,
        clearAllFilters,
        activeFiltersCount,
        hasActiveFilters
    } = useFilterState(onFiltersChange, context, () => {
        // Callback when clear all is triggered
        isClearingAllRef.current = true;
        if (filterParams.store) {
            startTransition(() => {
                fetchFilters({
                    store: filterParams.store,
                    category: filterParams.category || undefined,
                    sousCategory: filterParams.sousCategory || undefined,
                    filterAttributeInput: []
                });
            });
        }
    });

    
    // Initialize filterAttributes with initial data
    const [filterAttributes, setFilterAttributes] = useState<FilterAttributePresenter[]>(initialFilterAttributes);
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
    const [filterAttributeInput, setFilterAttributeInput] = useState<FilterAttributeInput[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const isClearingAllRef = useRef(false);
    
    const [filters, fetchFilters, pending] = useActionState(
        (state: ReturnAll<FilterAttributePresenter>, payload: listFilterAttributesProps) => {
            return listFilterAttributesAction(payload)
        }, 
        { total: 0, items: [], count: 0 }
    );

    // Handle hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Initialize filterAttributeInput with cookie values after buildFilterAttributeInput is defined
    useEffect(() => {
        const initialFilterInput = buildFilterAttributeInput();
        setFilterAttributeInput(initialFilterInput);
        
        if (initialFilterInput.length > 0) {
            onFilterAttributeInputChange?.(initialFilterInput);
        }
    }, []); // Run only once on mount


    // Helper function to check if a filter is selected - now handles dynamic filters
    const getIsFilterSelected = useCallback((attribute: FilterAttributePresenter, filter: any) => {
        // Check for colors (has couleur property)
        if (attribute.filters.some(f => f.couleur !== "")) {
            return filterState.selectedColors.includes(filter.nom);
        } 
        // Check for specific known types
        else if (attribute.nom.toLowerCase() === "taille") {
            return filterState.selectedSizes.includes(filter.nom);
        } 
        else if (attribute.type?.toLowerCase() === "brand") {
            return filterState.selectedBrands.includes(filter.nom);
        } 
        // For all other dynamic filters, use the generic selectedAttributes
        else {
            return filterState.selectedAttributes[attribute.nom]?.includes(filter.nom) || false;
        }
    }, [filterState]);

    // Memoized filter parameters to prevent unnecessary API calls
    const filterParams = useMemo(() => ({
        store,
        category,
        sousCategory,
        selectedSizes: filterState.selectedSizes,
        selectedBrands: filterState.selectedBrands,
        selectedPrices: filterState.selectedPrices,
        selectedColors: filterState.selectedColors,
        selectedAttributes: filterState.selectedAttributes
    }), [store, category, sousCategory, filterState]);


    // Memoized filter attributes to prevent unnecessary re-renders
    const memoizedFilterAttributes = useMemo(() => {
        return filterAttributes.map(attribute => ({
            ...attribute,
            filters: attribute.filters.map(filter => ({
                ...filter,
                isSelected: getIsFilterSelected(attribute, filter)
            }))
        }));
    }, [filterAttributes, filterState, getIsFilterSelected]);

    // Separate effect for filter selections - handles both selections and deselections
    useEffect(() => {
        // Skip if we're clearing all filters to avoid double API calls
        if (isClearingAllRef.current) {
            isClearingAllRef.current = false;
            return;
        }
        
        // Always call fetchFilters, even when filterAttributeInput is empty (for deselections)
        // This ensures that when filters are deselected, we fetch all products
        
        if (filterParams.store) {
            const timeoutId = setTimeout(() => {
                startTransition(() => {
                    fetchFilters({
                        store: filterParams.store,
                        category: filterParams.category || undefined,
                        sousCategory: filterParams.sousCategory || undefined,
                        filterAttributeInput: filterAttributeInput || []
                    });
                });
            }, 500); // Longer debounce to prevent infinite loops

            return () => clearTimeout(timeoutId);
        }
    }, [filterAttributeInput]);


    // Trigger callback when filterAttributeInput changes (including price changes)
    useEffect(() => {
        onFilterAttributeInputChange?.(filterAttributeInput);
    }, [filterAttributeInput, onFilterAttributeInputChange]);

    // Update filterAttributes when filters data changes - optimized to prevent unnecessary re-renders
    useEffect(() => {
        if (filters.items && filters.items.length > 0) {
            setFilterAttributes(prev => {
                // Only update if the data has actually changed
                if (JSON.stringify(prev) !== JSON.stringify(filters.items)) {
                    return filters.items;
                }
                return prev;
            });
        }
    }, [filters.items]);

    // Memoized function to build filter attribute input
    const buildFilterAttributeInput = useCallback(() => {
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

        // Process each filter type
        const sizeAttribute = filterAttributes.find(attr => attr.nom.toLowerCase() === "taille");
        processAttribute(filterState.selectedSizes, sizeAttribute, "size");

        const brandAttribute = filterAttributes.find(attr => attr.type?.toLowerCase() === "brand");
        processAttribute(filterState.selectedBrands, brandAttribute, "brand");

        const colorAttribute = filterAttributes.find(attr => attr.filters.some(f => f.couleur !== ""));
        processAttribute(filterState.selectedColors, colorAttribute, "color");

        // Process price filter
        if (filterState.selectedPrices && filterState.selectedPrices.length === 2) {
            const [minPrice, maxPrice] = filterState.selectedPrices;
            if (minPrice !== undefined && maxPrice !== undefined && (minPrice !== 0 || maxPrice !== 1000)) {
                input.push({
                    id_attribute: 0, // Price attribute ID
                    attribute_value_ids: [],
                    attribute_value: [minPrice.toFixed(2).toString(), maxPrice.toFixed(2).toString()],
                    type: "price" as const
                });
            }
        }

        // Process dynamic attributes
        Object.entries(filterState.selectedAttributes).forEach(([attributeName, values]) => {
            if (values.length > 0) {
                const attribute = filterAttributes.find(attr => attr.nom === attributeName);
                processAttribute(values, attribute, "dynamic");
            }
        });

        return input;
    }, [filterState, filterAttributes]);

    // Memoized filter attribute input
    const memoizedFilterAttributeInput = useMemo(() => {
        return buildFilterAttributeInput();
    }, [buildFilterAttributeInput]);

    // Update filterAttributeInput when selections change - optimized to prevent unnecessary updates
    useEffect(() => {
        setFilterAttributeInput(prev => {
            // Only update if the input has actually changed
            if (JSON.stringify(prev) !== JSON.stringify(memoizedFilterAttributeInput)) {
                return memoizedFilterAttributeInput;
            }
            return prev;
        });
        
        // Notify parent component only if there's a real change
        onFilterAttributeInputChange?.(memoizedFilterAttributeInput);
    }, [memoizedFilterAttributeInput, onFilterAttributeInputChange]);

    // Handle error state
    useEffect(() => {
        if (filters.error) {
            console.error('Error fetching filters:', filters.error);
        }
    }, [filters.error]);

    const toggleSection = useCallback((sectionName: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }));
    }, []);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 700);
    }, []);

    // Helper function to determine filter type and render accordingly
    const getFilterType = useCallback((attribute: FilterAttributePresenter) => {
        // Check if it has colors
        if (attribute.filters.some(filter => filter.couleur !== "")) {
            return "color";
        }
        // Check by name
        if (attribute.nom.toLowerCase() === "taille") {
            return "size";
        }
        // Check by type
        if (attribute.type?.toLowerCase() === "brand") {
            return "brand";
        }
        if (attribute.type?.toLowerCase() === "price") {
            return "price";
        }
        // Default to generic dynamic filter
        return "dynamic";
    }, []);

    // Optimized filter toggle handlers with debouncing
    const handleFilterToggle = useCallback((attribute: FilterAttributePresenter, filter: any) => {
        const filterType = getFilterType(attribute);
        
        // Use requestAnimationFrame to batch updates and avoid unnecessary re-renders
        requestAnimationFrame(() => {
            switch (filterType) {
                case "color":
                    toggleColor(filter.nom);
                    break;
                case "size":
                    toggleSize(filter.nom);
                    break;
                case "brand":
                    toggleBrand(filter.nom);
                    break;
                case "price":
                    // Price is handled by PriceSelector component
                    break;
                default:
                    // Dynamic filters
                    toggleFilterValue(attribute.nom, filter.nom);
                    break;
            }
        });
    }, [getFilterType, toggleColor, toggleSize, toggleBrand, toggleFilterValue]);

    // Memoized handlers for better performance with debouncing
    const handleSizeChange = useCallback((sizes: string[]) => {
        // Batch size updates to avoid multiple re-renders
        requestAnimationFrame(() => {
            updateFilterState({ selectedSizes: sizes });
        });
    }, [updateFilterState]);

    const handlePriceChange = useCallback((prices: number[]) => {
        // Batch price updates to avoid multiple re-renders
        requestAnimationFrame(() => {
            updatePrices(prices);
        });
    }, [updatePrices]);

    // Show-more/less behavior is handled by the reusable ExpandableList component

    return (
        <div>
            <Button 
                variant="outline" 
                className="flex items-center gap-2 relative"
                onClick={() => setIsOpen(true)}
            >
                {title}
                <Settings2 className="w-4 h-4" />
                {isHydrated && hasActiveFilters && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {activeFiltersCount}
                    </span>
                )}
            </Button>
            
            {/* Overlay */}
            {isOpen && (
                <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-700 ${
                    isClosing ? 'opacity-0' : 'opacity-100'
                }`} onClick={handleClose}>
                    <div 
                        className={`fixed bottom-0 left-0 right-0 w-full h-full bg-white shadow-xl flex flex-col rounded-t-2xl overflow-hidden transition-transform duration-700 md:right-0 md:top-0 md:left-auto md:bottom-auto md:h-full md:w-80 md:rounded-none ${
                            isClosing 
                                ? 'translate-y-full md:translate-x-full' 
                                : 'translate-y-0 md:translate-x-0'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drag handle for mobile */}
                        <div className="flex justify-center pt-3 pb-2 md:hidden">
                            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b overflow-hidden">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-800">Filtres</h2>
                                    {isHydrated && hasActiveFilters && (
                                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                                            {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                {isHydrated && hasActiveFilters && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Filtres appliqués
                                    </div>
                                )}
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleClose}
                                className="p-1"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-6 overflow-y-auto overflow-x-hidden flex-1 min-h-0 w-full">
                            {/* Clear all filters button */}
                            <div className="flex justify-between items-center mb-4 w-full">
                                <span className="text-sm text-gray-600">Filtres actifs</span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={clearAllFilters}
                                    className="text-xs"
                                >
                                    Effacer tout
                                </Button>
                            </div>

                            {memoizedFilterAttributes.map((filterAttribute, index) => {
                                     const isExpanded = expandedSections[filterAttribute.nom] !== false; // Par défaut étendu
                                     return (
                                         <div key={index} className="w-full">
                                             <div className="flex items-center justify-between mb-3 w-full">
                                                 <h3 className="text-base font-bold text-purple-600">{filterAttribute.nom}</h3>
                                                 <button
                                                     onClick={() => toggleSection(filterAttribute.nom)}
                                                     className="p-1 hover:bg-gray-100 rounded transition-colors hover:text-purple-600 hover:scale-105 hover:bg-purple-100"
                                                 >
                                                     {isExpanded ? (
                                                         <Minus className="w-4 h-4 text-gray-500 hover:text-purple-600 hover:scale-105" />
                                                     ) : (
                                                         <Plus className="w-4 h-4 text-gray-500 hover:text-purple-600 hover:scale-105" />
                                                     )}
                                                 </button>
                                             </div>
                                             {isExpanded && (
                                                 <>
                                                {(() => {
                                                    const filterType = getFilterType(filterAttribute);
                                                    
                                                    switch (filterType) {
                                                        case "color":
                                                            return (
                                                 <ExpandableList 
                                                     items={filterAttribute.filters}
                                                     getKey={(item) => item.nom}
                                                     layout="grid"
                                                     defaultVisible={3}
                                                     gridCols={3}
                                                     step={3}
                                                     renderItem={(filter) => {
                                                         const hasColor = filter.couleur !== "";
                                                         const isSelected = filter.isSelected;
                                                         return (
                                                             <div 
                                                                 className={`flex flex-col items-center px-2 py-1 group cursor-pointer ${
                                                                     isSelected ? 'ring-2 ring-purple-500 rounded-lg' : ''
                                                                 }`}
                                                                 onClick={() => handleFilterToggle(filterAttribute, filter)}
                                                             >
                                                                 {hasColor && (
                                                                     <div 
                                                                         className="w-12 h-12 rounded border border-gray-200 transition-transform duration-150 hover:scale-110 hover:shadow-lg"
                                                                         style={{ backgroundColor: filter.couleur }}
                                                                         title={filter.nom}
                                                                     ></div>
                                                                 )}
                                                                 <span className="text-xs text-gray-600 mt-2 text-center group-hover:text-purple-600 transition-colors duration-150">
                                                                     {filter.nom} ({filter.productCount})
                                                                 </span>
                                                             </div>
                                                         )
                                                     }}
                                                 />
                                                            );
                                                        
                                                        case "size":
                                                            return (
                                                 <SizeSelector 
                                                     sizes={filterAttribute.filters.map(filter => filter.nom)}
                                                                    selectedSizes={filterState.selectedSizes}
                                                                    onSizeChange={handleSizeChange}
                                                     multiple={true}
                                                 />
                                                            );
                                                        
                                                        case "brand":
                                                            return (
                                                <ExpandableList 
                                                    items={filterAttribute.filters}
                                                    layout="vertical"
                                                    defaultVisible={3}
                                                    step={3}
                                                    renderItem={(filter) => {
                                                        const isSelected = filter.isSelected;
                                                        return (
                                                            <div className="flex justify-between items-center hover:bg-gray-50 hover:text-purple-600 group">
                                                                <div className="flex items-center space-x-3 px-2 py-2 rounded cursor-pointer">
                                                                    <Checkbox 
                                                                        checked={isSelected}
                                                                        onCheckedChange={() => handleFilterToggle(filterAttribute, filter)}
                                                                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                                                    />
                                                                    <span className="text-sm text-gray-700 capitalize">
                                                                        {filter.nom}
                                                                    </span>                                                                
                                                                </div>
                                                                <span className="text-xs text-gray-500">({filter.productCount})</span>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                                            );
                                                        
                                                        case "price":
                                                            return (
                                                                <PriceSelector 
                                                                    selectedPrices={filterState.selectedPrices}
                                                                    onPriceChange={handlePriceChange}
                                                                />
                                                            );
                                                        
                                                        default:
                                                            // Dynamic filters - generic handling
                                                            return (
                                                <ExpandableList 
                                                   items={filterAttribute.filters}
                                                   getKey={(item) => item.nom}
                                                   layout="vertical"
                                                   defaultVisible={3}
                                                   step={3}
                                                                    renderItem={(filter) => {
                                                                        const isSelected = filter.isSelected;
                                                                        return (
                                                                            <div 
                                                                                className={`flex items-center justify-between px-2 py-1 hover:bg-gray-50 rounded cursor-pointer group ${
                                                                                    isSelected ? 'bg-purple-50 text-purple-700' : ''
                                                                                }`}
                                                                                onClick={() => handleFilterToggle(filterAttribute, filter)}
                                                                            >
                                                                                <span className="text-sm group-hover:text-purple-600 transition-colors duration-150 capitalize">
                                                                                    {filter.nom}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">({filter.productCount})</span>
                                                                            </div>
                                                                        );
                                                                    }}
                                               />
                                                            );
                                                    }
                                                })()}
                                                 </>
                                             )}
                                         </div>
                                     )
                            })}                                
                        </div>


                        {
                        pending ?                 
                            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-50 flex flex-row gap-2 items-center justify-center">
                                <LoaderCircle className="w-8 h-8 animate-spin" />
                                <span className="text-sm">Recalcul des filtres en cours...</span>
                            </div>
                        :
                            <></>
                        }
                    </div>
                </div>
            )}
        </div>
    );
}