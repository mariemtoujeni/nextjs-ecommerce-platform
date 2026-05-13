'use client'
import { useEffect, useMemo, useState } from "react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent
    , DropdownMenuSubTrigger, DropdownMenuTrigger, Input, Select, SelectContent, SelectItem, SelectTrigger, Badge } from "./ui";
import { useDebounce } from "~/hooks/use-debounce";
import { ActiveFilter, GenericFilter } from "@repo/core/types";
import { FilterIcon, Search, ListFilter, Check } from "lucide-react";

type Items = {
    total?: number;
    count?: number;
    defaultPage?: number;
}

const MAX_PAGES = 10;

type Search = {
    show?: boolean;
    defaultSearch?: string;
    placeholder?: string;
    onSearch?: (search: string) => void;
}
type RequiredItems = Required<Items>;
type RequiredSearch = Required<Search>;

export type TableFilterProps = {
    items?: Items;
    search?: Search;
    onPageChange?: (page: number) => void;
    onFiltersChange?: (filters: ActiveFilter[]) => void;
    filters?: GenericFilter[];
    activeFilters?: ActiveFilter[];
}

type DefaultProps = Required<TableFilterProps> & {
    items: RequiredItems;
    search: RequiredSearch;
}

const defaultProps: DefaultProps = {
    items: {
        total: 0,
        count: 50,
        defaultPage: 1
    },
    search: {
        show: false,
        defaultSearch: '',
        placeholder: 'Rechercher...',
        onSearch: (search: string) => {}
    },
    onPageChange: (page: number) => {},
    onFiltersChange: (filters: ActiveFilter[]) => {},
    filters: [],
    activeFilters: []
}

export const TableFilter = (props: TableFilterProps = {}) => {

    const items: RequiredItems = props.items ? { ...defaultProps.items, ...props.items } : defaultProps.items;
    const search: RequiredSearch = props.search ? { ...defaultProps.search, ...props.search } : defaultProps.search;
    const onPageChange: typeof defaultProps.onPageChange = props.onPageChange || defaultProps.onPageChange;
    const onFilterChange: typeof defaultProps.onFiltersChange = props.onFiltersChange || defaultProps.onFiltersChange;
    const filters: GenericFilter[] = props.filters ? props.filters : defaultProps.filters;


    const [page, setPage] = useState(items.defaultPage);
    const [searchText, setSearchText] = useDebounce();
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(props.activeFilters || defaultProps.activeFilters);

    
    const pageList = useMemo(() => {
        if(items.total === 0) {
            return [];
        }
        const nbPages = Math.ceil((items.total) / (items.count));

        if(nbPages <= MAX_PAGES) {
            return Array.from({ length: nbPages }, (_, index) => index + 1);
        }

        const pages = [];
        
        if (page < 10) {
            // Show first 10 pages
            for (let i = 1; i <= Math.min(10, nbPages); i++) {
                pages.push(i.toString());
            }
            
            // Add navigation to end if there are more pages
            if (nbPages > 10) {
                pages.push('>');
                pages.push(nbPages.toString());
            }
        } else {
            // Normal pagination logic
            const start = Math.max(1, page - 5);
            const end = Math.min(nbPages, page + 5);
            
            if (start > 1) {
                pages.push("1");
                if (start > 2) pages.push('<');
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i.toString());
            }
            
            if (end < nbPages) {
                if (end < nbPages - 1) {
                    pages.push('>');
                }
                pages.push(nbPages.toString());
            }
        }
        
        return pages;
    }, [items.total, items.count, page]);


    useEffect(() => {
        search.onSearch(searchText);
    }, [searchText]);

    useEffect(() => {
        onPageChange(page);
    }, [page]);

    useEffect(() => {
        onFilterChange(activeFilters);
    }, [activeFilters]);

    const renderFilter = (filter: GenericFilter, parentKey?: string): React.ReactNode => {
        if(filter.values) {
            let key = filter.key;
            let hasActiveFilter:ActiveFilter | undefined = undefined
            let parentActiveFilter:ActiveFilter | undefined = undefined
            
            if(parentKey) {
                key = parentKey;
                parentActiveFilter = activeFilters.find((f) => f.key === parentKey);
                if(parentActiveFilter) {
                    hasActiveFilter = (parentActiveFilter.values as ActiveFilter[]).find((f) => f.key === filter.key);
                }
            } else {
                hasActiveFilter = activeFilters.find((f) => f.key === filter.key);
            }


            const nbActiveFilters = hasActiveFilter ? (hasActiveFilter.values as string[]).length : 0;

            return <DropdownMenuSub key={filter.key} >
                <DropdownMenuSubTrigger>
                    {filter.text}
                    {
                        nbActiveFilters > 0 && <Badge size="sm" variant="blue" >
                            {nbActiveFilters}
                        </Badge>
                    }
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                    {filter.values.map((value) => {
                       
                        const isActive = hasActiveFilter && (hasActiveFilter.values as string[]).includes(`${value.id}`);

                        return <DropdownMenuItem key={`${key}-${value.id}`} 
                            className="cursor-pointer flex justify-between"
                            data-value-id={value.id}
                            onSelect={(e: any) => {
                                e.preventDefault();
                                const valueId: string = e.currentTarget?.getAttribute('data-value-id');
                                let values: string[] = [];                                
                                
                                if(parentKey) {

                                    if(!parentActiveFilter) {
                                        setActiveFilters([...activeFilters.filter((f) => f.key !== parentKey)
                                            , {key: parentKey, values: [{key: filter.key, values: [valueId]}]}
                                        ]);
                                    } else {
                                        
                                        if(hasActiveFilter) {
                                            values = hasActiveFilter.values as string[];
                                            if(!values.includes(valueId)) {
                                                values.push(valueId);
                                            } else {
                                                values = values.filter((v) => v !== valueId);
                                            }

                                            if(values.length) {
                                                    setActiveFilters([...activeFilters.filter((f) => f.key !== parentKey)
                                                        , {key: parentKey, values: (parentActiveFilter!.values as ActiveFilter[]).map((f) => f.key === filter.key ? {key: filter.key, values: values} : f)}
                                                ]);
                                            }
                                            else {
                                                setActiveFilters([...activeFilters.filter((f) => f.key !== parentKey)
                                                    , {key: parentKey, values: (parentActiveFilter!.values as ActiveFilter[]).filter((f) => f.key !== filter.key)}
                                                ]);
                                            }
                                        } else {
                                            const parentValues = parentActiveFilter.values as ActiveFilter[];
                                            setActiveFilters([...activeFilters.filter((f) => f.key !== parentKey)
                                                , {key: parentKey, values: [...parentValues, {key: filter.key, values: [valueId]}]}
                                            ]);
                                        }
                                    }

                                } else {
                                    values = hasActiveFilter ? (hasActiveFilter.values as string[]) : [];
                                    if(!values.includes(valueId)) {
                                        values.push(valueId);
                                    } else {
                                        values = values.filter((v) => v !== valueId);
                                    }

                                    if(values.length) {
                                        setActiveFilters([...activeFilters.filter((f) => f.key !== key), {key, values}]);
                                    } else {
                                        setActiveFilters(activeFilters.filter((f) => f.key !== key));
                                    }
                                }
                            }}
                        >
                            {value.name}
                            {isActive && <Check />}
                        </DropdownMenuItem>
                    })}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        } else if(filter.children) {
            const hasActiveFilter = activeFilters.find((f) => f.key === filter.key);
            const nbActiveFilters = hasActiveFilter ? (hasActiveFilter.values as string[]).length : 0;

            return <DropdownMenuSub key={filter.key}>
                <DropdownMenuSubTrigger>
                    {filter.text}
                    {
                        nbActiveFilters > 0 && <Badge size="sm" variant="blue" >
                            {nbActiveFilters}
                        </Badge>
                    }
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto"
                >
                    {filter.children.map((child) => renderFilter(child, filter.key))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        }

        return <></>

    }

    const filterIconColors = activeFilters.length > 0 ? "text-blue-500" : "text-gray-500";

    return (
        <div className="flex gap-2">
            {search.show && (
                <Input type="text" placeholder={search.placeholder} onChange={(e) => setSearchText(e.target.value)} className="flex-grow"/>
            )}
            {
                items?.total !== 0 && (
                    <Select onValueChange={(value) => {
                        if(value === '<') {
                            setPage(page - MAX_PAGES + MAX_PAGES/2);
                        } else if(value === '>') {
                            setPage(page + MAX_PAGES - MAX_PAGES/2);
                        } else {
                            setPage(parseInt(value));
                        }
                    }} value={page.toString()}>
                        <SelectTrigger className="w-20">
                            {page}
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                            {pageList.map((page) => (
                                <SelectItem key={page} value={page.toString()}>
                                    {page}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )
            }
            {
                filters && filters.length 
                ? <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="relative">
                            <Search className={filterIconColors} /><ListFilter className={filterIconColors} />
                            {
                                activeFilters.length > 0 && <div className="w-[8px] h-[8px] bg-orange-300 rounded-full absolute top-2 right-3"></div>
                            }
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {filters.map((filter) => renderFilter(filter))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 cursor-pointer" 
                            onClick={() => setActiveFilters([])}>
                                Réinitialiser les filtres
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                : <></>
            }
        </div>
    )
}