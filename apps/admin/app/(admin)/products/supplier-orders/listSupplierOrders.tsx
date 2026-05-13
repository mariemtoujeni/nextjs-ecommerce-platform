'use client'

import { startTransition, useActionState, useEffect, useState } from "react";
import { listPurchaseOrdersAction } from "@repo/actions/orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Progress } from "~/components/ui/progress"
import { Badge, Card, CardContent, CardHeader, Heading, CardTitle } from "~/components/ui";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { PurchaseOrderFilterInput, PurchaseOrderPresenter, PurchaseOrderPresenterInput, PurchaseOrderStatus } from "@repo/core/models";
import { TableFilter } from "~/components/TableFilter";
import { Spinner } from "~/components/Spinner";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";

export interface ListSupplierOrdersProps {
    purchaseOrders: ReturnAll<PurchaseOrderPresenter>;
    filters: GenericFilter[];
    page: number;
}

const LIMIT = 100;

export const ListSupplierOrdersView = ({ purchaseOrders: purchaseOrdersProps, filters, page: defaultPage }: ListSupplierOrdersProps) => {
    const [page, setPage] = useState<number>(defaultPage);
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const router = useRouter();
    const { toast } = useToast();
    const [purchaseOrders, fetchPurchaseOrders, pending] = useActionState(
        (state: ReturnAll<PurchaseOrderPresenter>, payload: PurchaseOrderFilterInput) => listPurchaseOrdersAction(payload), 
        { total: 0, items: [], count: 0 }
    );

    useEffect(() => {
        startTransition(() => {
            fetchPurchaseOrders({limit: LIMIT, offset: (page - 1), filters: activeFilters.map(filter => ({
                key: filter.key,
                values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                    ? filter.values 
                    : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
            })), search: search});
        });
    }, [page, activeFilters, search]);


    if((purchaseOrdersProps && (purchaseOrdersProps.error || !purchaseOrdersProps.items)) || (purchaseOrders && (purchaseOrders.error || !purchaseOrders.items))) {
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la récupération des commandes, erreur : " + (purchaseOrders.error || "Aucune commande trouvée"),
            variant: "destructive",
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <Card className="mt-8">
                <CardHeader>
                    <TableFilter search={{ show: true, placeholder: "Rechercher un bon de commande", onSearch: (search) => {
                            setPage(1);
                            setSearch(search);
                        } }}

                        items={{total: purchaseOrders.total, count: LIMIT, defaultPage: page}}
                        filters={filters}
                        activeFilters={activeFilters}
                        onFiltersChange={(filters) => {
                            setActiveFilters(filters);
                        }}
                        onPageChange={(page) => setPage(page)}
                    />
                </CardHeader>
                <CardContent>
                    {pending ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex flex-col items-center gap-2">
                                <Spinner variant="circle" size={32} />
                                <p className="text-sm text-gray-500">Chargement des commandes...</p>
                            </div>
                        </div>
                    ) : purchaseOrders.items.length === 0 || (purchaseOrders.error && purchaseOrders.error.length > 0) ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-sm text-gray-500">Aucune commande trouvée</p>
                            </div>
                        </div>
                    ) : (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader className="bg-neutral-100">
                                    <TableRow>
                                        <TableHead className="text-left w-1/6">Référence</TableHead>
                                        <TableHead className="text-left w-1/6">Fournisseur</TableHead>
                                        <TableHead className="text-left w-1/6">Statut</TableHead>
                                        <TableHead className="text-left w-1/6">Reçu</TableHead>
                                        <TableHead className="text-left w-1/6">Total HT</TableHead>
                                        <TableHead className="text-left w-1/6">Arrivée prévue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        purchaseOrders.items.map((purchaseOrder: PurchaseOrderPresenter) => (
                                            <TableRow key={purchaseOrder.id} className="hover:bg-neutral-100 cursor-pointer" onClick={() => {
                                                if(purchaseOrder.status === PurchaseOrderStatus.PARTIELLE || purchaseOrder.status === PurchaseOrderStatus.RECU) {
                                                    router.push(`/products/supplier-orders/${purchaseOrder.id}/receive`);
                                                } else {
                                                    router.push(`/products/supplier-orders/${purchaseOrder.id}`);
                                                }
                                            }}>
                                                <TableCell>#{purchaseOrder.id}</TableCell>
                                                <TableCell>{purchaseOrder.supplier?.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        purchaseOrder.status === "BROUILLON" ? "gray" :
                                                        purchaseOrder.status === "PARTIELLE" ? "orange" :
                                                        purchaseOrder.status === "ENVOYEE" ? "blue" :
                                                        purchaseOrder.status === "RECU" ? "green" :
                                                        purchaseOrder.status === "ANNULEE" ? "red" :
                                                        "gray"
                                                    }>
                                                        {purchaseOrder.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const receivedQuantity = purchaseOrder.lines.reduce((acc, line) => acc + (line.receivedQuantity === line.quantity ? 1 : 0), 0);
                                                        const totalQuantity = purchaseOrder.lines.reduce((acc, line) => acc + 1, 0);
                                                        return <div className="flex flex-col gap-1">
                                                            <Progress value={totalQuantity > 0 ? (receivedQuantity / totalQuantity) * 100 : 0} />
                                                            <span className="text-sm text-gray-500 text-right">{receivedQuantity} sur {totalQuantity}</span>
                                                        </div>;
                                                    })()}
                                                </TableCell>
                                                <TableCell>{(purchaseOrder.totalHT).toFixed(2)} €</TableCell>
                                                <TableCell>{new Date(purchaseOrder.deliveryDate).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}