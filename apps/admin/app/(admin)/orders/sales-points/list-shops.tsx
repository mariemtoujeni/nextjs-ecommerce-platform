'use client'

import { listShopsAction } from "@repo/actions/orders";
import { Shop, ShopFilterInput, ShopStatus } from "@repo/core/models";
import { ActiveFilter, GenericFilter, getFrenchDepartmentName, ReturnAll } from "@repo/core/types";
import { startTransition, useActionState, useEffect, useState } from "react";
import { TableFilter } from "~/components/TableFilter";
import { Badge, Card, CardContent, CardHeader } from "~/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useToast } from "~/hooks/use-toast";

export interface ListShopsProps {
    shops: ReturnAll<Shop>;
    filters: GenericFilter[];
    defaultPage: number;
}

const LIMIT = 100;

export function ListShopsView({ shops: shopsProps, filters, defaultPage }: ListShopsProps) {
    const [page, setPage] = useState<number>(defaultPage);
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const { toast } = useToast();

    const [shops, fetchShops, pending] = useActionState(
        (state: ReturnAll<Shop>, payload: ShopFilterInput) => listShopsAction(false, payload), 
        { total: 0, items: [], count: 0 }
    );

    useEffect(() => {
        startTransition(() => {
            fetchShops({limit: LIMIT, offset: (page - 1), filters: activeFilters.map(filter => ({
                key: filter.key,
                values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                    ? filter.values 
                    : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
            })), search: search});
        });
    }, [page, activeFilters, search]);

    if((shopsProps && (shopsProps.error || !shopsProps.items)) || (shops && (shops.error || !shops.items))) {
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la récupération des points de vente, erreur : " + shops.error,
            variant: "destructive",
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <Card className="mt-8">
                <CardHeader>
                <TableFilter search={{ show: true, placeholder: "Rechercher un point de vente", onSearch: (search) => {
                            setPage(1);
                            setSearch(search);
                        } }}

                        items={{total: shops.total, count: LIMIT, defaultPage: page}}
                        filters={filters}
                        activeFilters={activeFilters}
                        onFiltersChange={(filters) => {
                            setActiveFilters(filters);
                        }}
                        onPageChange={(page) => setPage(page)}
                    />
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader className="bg-neutral-100">
                                <TableRow>
                                    <TableHead className="text-left w-5/10">Nom</TableHead>
                                    <TableHead className="text-left w-4/10">Lieu</TableHead>
                                    <TableHead className="text-left w-1/10">Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shops.items.map((shop) => (
                                    <TableRow key={shop.id} className="cursor-pointer" onClick={() => {
                                        window.location.href = `/orders/sales-points/${shop.id}`;
                                    }}>
                                        <TableCell>{shop.name}</TableCell>
                                        <TableCell className="text-left">{getFrenchDepartmentName(parseInt(shop.department))}</TableCell>
                                        <TableCell className="text-left">{
                                            shop.status === ShopStatus.OPEN ? <Badge variant="green">Ouvert</Badge> : 
                                                shop.status === ShopStatus.CLOSED ? <Badge variant="red">Fermé</Badge> : 
                                                    shop.status === ShopStatus.DRAFT ? <Badge variant="orange">Brouillon</Badge> : 
                                                        shop.status === ShopStatus.FINALISED ? <Badge variant="gray">Finalisé</Badge> : 
                                                            <Badge variant="gray">Inconnu</Badge>
                                        }</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}