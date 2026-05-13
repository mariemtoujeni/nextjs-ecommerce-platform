'use client';

import { useState, useCallback, useActionState, startTransition, useEffect } from "react";
import { Category, FilterAttributeInput, FilterAttributePresenter, Product, ProductFilterInput, Store, SubCategory } from "@repo/core/models";
import FilterWrapper from "./filter-wrapper";
import { SelectPage } from "./SelectPage";
import { Langs } from "~/app/utils";
import { dictionary } from "~/app/dictionaries";
import { ProductCard } from "./product-card";
import { ReturnAll } from "@repo/core/types";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { getAllProductAction } from "@repo/actions/products";
import { listFilterAttributesAction } from "@repo/actions/attributes";
import { listFilterAttributesProps } from "@repo/core/repositories";

export interface StorePageClientProps {
    filters: any[];
    storeSlug: string;
    store: Store;
    categorySlug: string;
    category?: Category;
    subCategoryslug: string;
    sousCategory?: SubCategory;
    title: string;
    lang: Langs;
    translations: dictionary;
    p: string;
}

const LIMIT = 48;

export default function StorePageClient({
    storeSlug,
    filters,
    store,
    categorySlug,
    category,
    subCategoryslug,
    sousCategory,
    title,
    lang,
    translations,
    p
}: StorePageClientProps) {
    // const [products, setProducts] = useState({ total: 0, items: [], count: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [nbPages, setNbPages] = useState(0);

    const [products, fetchProducts, pending] = useActionState(
        (state: ReturnAll<Product>, payload: { productFilter: ProductFilterInput, filterAttributeInput: FilterAttributeInput[] }) => {
            return getAllProductAction(payload.productFilter, payload.filterAttributeInput)
        }, 
        { total: 0, items: [], count: 0 }
    );

    const [filterAttributes, fetchFilterAttributes, pendingFilterAttributes] = useActionState(
        (state: ReturnAll<FilterAttributePresenter>, payload: listFilterAttributesProps) => {
            return listFilterAttributesAction(payload)
        }, 
        { total: 0, items: [], count: 0 }
    );

    // Function to handle filter changes from FilterWrapper
    const handleFilterChange = useCallback((filterInput: FilterAttributeInput[]) => {
        startTransition(() => {
            const offset = !isNaN(Number(p)) && Number(p) > 0 ? Number(p) - 1 : 0;
            fetchProducts({ 
                productFilter: { filters: filters, limit: LIMIT, offset: offset }, 
                filterAttributeInput: filterInput
            });
        });
    }, [filters, p, fetchProducts]);

    useEffect(() => {
        // Only fetch products after filterAttributes have been loaded
        if (filterAttributes.items.length === 0 && !pendingFilterAttributes) {
            return;
        }
        
        startTransition(() => {
            const offset = !isNaN(Number(p)) && Number(p) > 0 ? Number(p) - 1 : 0;
            // Only pass empty filterAttributeInput for initial load
            // Selected filters will be passed via handleFilterChange from FilterWrapper
            fetchProducts({ 
                productFilter: { filters: filters, limit: LIMIT, offset: offset }, 
                filterAttributeInput: []
            });
        });
    }, [filters, p, store?.name, category?.name, sousCategory?.name, filterAttributes.items, pendingFilterAttributes]);

    useEffect(() => {
        startTransition(() => {
            fetchFilterAttributes({ store: store.name, category: category?.name, sousCategory: sousCategory?.name });
        });
    }, [store?.name, category?.name, sousCategory?.name]);

    // Update nbPages when products change
    useEffect(() => {
        setNbPages(Math.ceil(products.total / LIMIT));
    }, [products.total]);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center">
                <div className="hidden md:flex  gap-3 py-8 text-sm text-neutral-500">                    
                    <a href={`/${lang}/${storeSlug}`} className="hover:text-black">{store?.name}</a>
                    {category && <>
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                        <a href={`/${lang}/${storeSlug}/${categorySlug}`} className="hover:text-black">{category.name}</a>
                    </>
                    }
                    {sousCategory && <>
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                        <a href={`/${lang}/${storeSlug}/${categorySlug}/${subCategoryslug}`} className="hover:text-black">{sousCategory.name}</a></>
                    }
                    <span className="text-neutral-400">({products.total})</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <SelectPage p={p} nbPages={nbPages} />
                    <FilterWrapper 
                        filterAttributes={filterAttributes.items} 
                        title={title} 
                        store={store.name} 
                        category={category?.name} 
                        sousCategory={sousCategory?.name}
                        baseFilters={filters}
                        onFetchProducts={handleFilterChange}
                    />
                </div>
            </div>
            
            {pending ? (
                <div className="flex flex-col justify-center items-center gap-2 py-8">
                    <LoaderCircle className="w-8 h-8 animate-spin" />
                    <div className="text-sm text-gray-500">Chargement des produits...</div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-4">
                    {products.items.map((product) => (
                        <ProductCard key={product.id} product={product} lang={lang} translations={translations} />
                    ))}
                </div>
            )}
        </div>
    );
}

