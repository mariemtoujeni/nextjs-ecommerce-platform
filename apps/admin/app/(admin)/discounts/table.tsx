"use client";
import { Card, CardContent, CardHeader } from "~/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Discount, DiscountFilterInput, ReductionType } from "@repo/core/models";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllDiscountAction } from "@repo/actions/discounts";
import { Badge } from "~/components/ui/badge";
import { useDebounce } from "~/hooks/use-debounce";
import { TableFilter } from "~/components/TableFilter";
import { Spinner } from "~/components/Spinner";

export interface DiscountProps {
  initialDiscounts: ReturnAll<Discount>;
}

const LIMIT = 50;


export function DiscountStatus({ discount }: { discount: Discount}) {
  const now = new Date();
  const start = new Date(discount.date_debut);
  const end = discount.date_fin ? new Date(discount.date_fin) : null;

  const isActive = now >= start && (!end || now <= end);

  return isActive ? (
    <Badge variant="green" size="md">Actif</Badge>
  ) : (
    <Badge variant="red" size="md">Inactif</Badge>
  );
}

export const ListDiscounts = ({ filters, defaultPage }: {filters: GenericFilter[], defaultPage: number}) => {

  const [discounts, fetchDiscounts, pending] = useActionState(
        (state: ReturnAll<Discount>, payload: DiscountFilterInput) => getAllDiscountAction(payload), 
        { total: 0, items: [], count: 0 }
    );
    const router = useRouter();
    const [page, setPage] = useState(defaultPage);
    const [search, setSearch] = useDebounce('', 300); 
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);


    const formatFilters = (filters: ActiveFilter[]) =>
    filters.map(filter => ({
        key: filter.key,
        values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string')
        ? filter.values
        : (filter.values as ActiveFilter[]).map(f => ({ key: f.key, values: f.values as string[] }))
    }));

    useEffect(() => {
        startTransition(() => {
        fetchDiscounts({
            limit: LIMIT,
            offset: page - 1,
            search: search,
            filters: formatFilters(activeFilters),
        });
        });

    }, [page, activeFilters, search]);

    const getDiscountRoute = (type: ReductionType, id: number) => {
    const orderTypes = [
        ReductionType.COMMANDE
    ];

    const productTypes = [
        ReductionType.CAMPAGNE
    ];

    const xforyTypes = [ReductionType.X_POUR_Y];

    if (orderTypes.includes(type)) return `/discounts/orders/${id}`;
    if (productTypes.includes(type)) return `/discounts/products/${id}`;
    if (xforyTypes.includes(type)) return `/discounts/xfory/${id}`;

    return `/discounts`;
    };

    return (
            <div className="mt-8">
                <Card>
                    <CardHeader className="flex justify-start flex-row">
                      <div className="flex flex-row justify-end items-center w-full pe-2">
                        <TableFilter 
                            search={{ show: true, placeholder: "Rechercher une réduction...", onSearch: (search) => {
                                setPage(1);
                                setSearch(search);
                            } }}
                            items={{ total: discounts.total, count: LIMIT, defaultPage: page }}
                            filters={filters}
                            activeFilters={activeFilters}
                            onFiltersChange={(filters) => {
                                setActiveFilters(filters);
                                }}
                            onPageChange={(page) => setPage(page)}
                            />
                      </div>  
                    </CardHeader>
                    <CardContent>
                    {
                        pending ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="flex flex-col items-center gap-2">
                                    <Spinner variant="circle" size={32} />
                                    <p className="text-sm text-gray-500">Chargement des réductions...</p>
                                </div>
                            </div>
                        ) : discounts.count === 0 || (discounts.error && discounts.error.length > 0) ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-sm text-gray-500">Aucun réduction trouvé</p>
                                </div>
                            </div>
                        ) : (
                      <div className="border rounded-lg">
                        <Table>
                            <TableHeader className="bg-neutral-100">
                                <TableRow>
                                    <TableHead className="w-1/6">Référence</TableHead>
                                    <TableHead className="w-1/6">Type</TableHead>
                                    <TableHead className="w-1/6">Code</TableHead>
                                    <TableHead className="w-1/6">Méthode</TableHead>
                                    <TableHead className="w-1/6">Statut</TableHead>
                                    <TableHead className="w-1/6 text-right pr-4">Performance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discounts.items
                                .map((discount) => (
                                        <TableRow key={discount.id} className="cursor-pointer" onClick={() => router.push(getDiscountRoute(discount.type, discount.id))}>
                                            <TableCell>#{discount.id}</TableCell>
                                            <TableCell>{discount.type}</TableCell>
                                            <TableCell>{discount.code}</TableCell>
                                            <TableCell>
                                                {discount.code && discount.code.trim() !== "" ? "Code" : "Automatique"}
                                            </TableCell>
                                            <TableCell>
                                                <DiscountStatus discount={discount} />
                                            </TableCell>
                                            <TableCell  className="text-right pr-4">-</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                      </div> )
                    }
                    </CardContent>
                </Card>
            </div>
    )
}