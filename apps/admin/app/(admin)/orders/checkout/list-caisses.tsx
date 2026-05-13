'use client'

import { Button, Card, CardContent, CardHeader } from "~/components/ui";
import { CheckoutFilterInput, CheckoutPresenter, CheckoutStatus, Shop } from "@repo/core/models";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { TableFilter } from "~/components/TableFilter";
import { deleteCheckoutAction, listCheckoutsAction } from "@repo/actions/orders";
import { Trash2 } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

export interface CheckoutProps {
    defaultPage: number;
    shops: ReturnAll<Shop>;
    filters: GenericFilter[];
}

const LIMIT = 100;

export function ListCheckoutsView({ shops, filters, defaultPage }: CheckoutProps) {
    const [checkouts, fetchCheckout, pending] = useActionState(
        (state: ReturnAll<CheckoutPresenter>, payload: CheckoutFilterInput) => listCheckoutsAction(payload), 
        { total: 0, items: [], count: 0 }
    );

    const [page, setPage] = useState<number>(defaultPage);
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const { toast } = useToast();
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        startTransition(() => {
            fetchCheckout({limit: LIMIT, offset: (page - 1), filters: activeFilters.map(filter => ({
                key: filter.key,
                values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                    ? filter.values 
                    : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
            })), search: search});
        });
    }, [page, activeFilters, search]);

    return (
        <div className="flex flex-col gap-4">
            <Card className="mt-8">
                <CardHeader>
                    <TableFilter search={{ show: true, placeholder: "Rechercher une caisse", onSearch: (search) => {
                            if (searchTimeoutRef.current) {
                                clearTimeout(searchTimeoutRef.current);
                            }
                            searchTimeoutRef.current = setTimeout(() => {
                                setPage(1);
                                setSearch(search);
                            }, 500);
                        } }}

                        items={{total: checkouts.total, count: LIMIT, defaultPage: page}}
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
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Point de vente</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead className="text-center">Statut de point de vente</TableHead>
                                    <TableHead className="text-right pr-4">Montant dépensé</TableHead>
                                    <TableHead className="text-right pr-4"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {checkouts.items.map((checkout) => (
                                    <TableRow key={checkout.id} className="cursor-pointer" onClick={() => {
                                        window.location.href = `/orders/checkout/${checkout.id}`;
                                    }}>
                                        <TableCell>{checkout.id}</TableCell>
                                        <TableCell>{checkout.shop.name}</TableCell>
                                        <TableCell>{checkout.createdAt.toLocaleString()}</TableCell>
                                        <TableCell>{checkout.client.email}</TableCell>
                                        <TableCell className="text-center">{checkout.status === CheckoutStatus.OPEN ? <Badge variant="green">Ouvert</Badge> : checkout.status === CheckoutStatus.CLOSED ? <Badge variant="red">Fermé</Badge> : <Badge variant="gray">Non défini</Badge>}</TableCell>
                                        <TableCell className="text-right pr-4">{Number(checkout.totalTTC).toFixed(2)} €</TableCell>
                                        {
                                            checkout.status === CheckoutStatus.OPEN &&
                                            <TableCell className="text-right pr-4">
                                                <Button variant="outline" size="icon" onClick={async (e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    const result = await deleteCheckoutAction(checkout.id);
                                                    if (result.error) {
                                                        toast({
                                                            title: "Erreur",
                                                            description: "Une erreur est survenue lors de la suppression de la caisse",
                                                            variant: "destructive",
                                                        });
                                                    }   else {
                                                        toast({
                                                            title: "Succès",
                                                            description: "La caisse a été supprimée avec succès",
                                                        });
                                                        startTransition(() => {
                                                            fetchCheckout({limit: LIMIT, offset: (page - 1), filters: activeFilters.map(filter => ({
                                                                key: filter.key,
                                                                values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                                                                    ? filter.values 
                                                                    : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
                                                            })), search: search});
                                                        });
                                                    }
                                                }}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        }
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