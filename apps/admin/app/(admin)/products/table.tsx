'use client';

import { getAllProductAction } from "@repo/actions/products";
import { Product, ProductFilterInput } from "@repo/core/models";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { useActionState, useEffect, useState, startTransition } from "react";
import { TableFilter } from "~/components/TableFilter";
import { Card, CardHeader, CardContent } from "~/components/ui";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "~/components/ui/table";
import noPicture from '~/public/no-picture.jpg'; 
import Image from "next/image";
import { ProductStateBadges } from "./state";
import Link from "next/link";

const LIMIT = 100;

export const ProductsTable = ({ filters, defaultPage }: {filters: GenericFilter[], defaultPage: number}) => {
    const [products, fetchProducts, pending] = useActionState(
        (state: ReturnAll<Product>, payload: ProductFilterInput) => getAllProductAction(payload), 
        { total: 0, items: [], count: 0 }
    );

    const [page, setPage] = useState(defaultPage);
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    
    useEffect(() => {
        startTransition(() => {
            fetchProducts({limit: LIMIT, offset: (page - 1), search
                , filters: activeFilters.map(filter => ({
                    key: filter.key,
                    values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                        ? filter.values 
                        : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
                }))
            });
        });
    }, [page, activeFilters, search]);

    return (
        <Card>
            <CardHeader className="flex justify-end flex-row">
                <TableFilter search={{ show: true, placeholder: "Rechercher un produit", onSearch: (search) => {
                        setPage(1);
                        setSearch(search);
                    } }}

                    items={{total: products.total, count: LIMIT, defaultPage}}
                    filters={filters}
                    activeFilters={activeFilters}
                    onFiltersChange={(filters) => {
                        setActiveFilters(filters);
                    }}
                    onPageChange={(page) => setPage(page)}
                />
            </CardHeader>
            <CardContent className="px-0">
                <Table>
                    <TableHeader className="bg-neutral-100">
                        <TableRow>
                            <TableHead className="w-1/12">#</TableHead>
                            <TableHead className="w-5/12">Produit</TableHead>
                            <TableHead className="w-2/12">Statut</TableHead>
                            <TableHead className="w-4/12 text-end">[Magasins] &gt; Catégorie &gt; Sous-catégorie</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            products.items.map((product) => {
                                const description = product.descriptions.find(d => d.lang === 'fr');
                                const image = product.images.length > 0 
                                    ? <Image src={product.images[0]?.url ?? noPicture} alt={description?.title ?? 'no-image'} width={48} height={48} />
                                    : <Image src={noPicture} alt="no-image" width={48} height={48} />;
                                return <TableRow key={product.id}>
                                    <TableCell>
                                        <Link href={`/products/edit/${product.id}`} className="h-full w-full block">
                                            {product.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/products/edit/${product.id}`}>
                                            <div className="flex items-center gap-2">
                                                {image}
                                                {description?.title}
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/products/edit/${product.id}`}>{ProductStateBadges[product.status]}</Link>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-end">
                                        <Link href={`/products/edit/${product.id}`}>[{product.stores?.map(store => store.name).join(' - ')}] &gt; {product.category?.name} &gt; {product.subCategory?.name}</Link>
                                    </TableCell>
                                </TableRow>
                            })
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}