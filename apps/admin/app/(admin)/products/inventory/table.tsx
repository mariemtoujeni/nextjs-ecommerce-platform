'use client';

import { createInventoryAction, getInventoryListAction } from "@repo/actions/inventory"
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { useActionState, useEffect, useState, startTransition } from "react";
import { TableFilter } from "~/components/TableFilter";
import { Card, CardHeader, CardContent, Badge, Heading, Button } from "~/components/ui";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "~/components/ui/table";
import { InventoryFilterInput } from "@repo/core/models";
import { Inventory, InventoryStatus } from "../../../../../../packages/core/src/models/Inventory";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const LIMIT = 100;

export const InventoryTable = ({ filters, defaultPage }: {filters: GenericFilter[], defaultPage: number}) => {
    const [inventories, fetchInventories, pending] = useActionState(
      (state: ReturnAll<Inventory>, payload: InventoryFilterInput) => getInventoryListAction(payload),
      { total: 0, items: [], count: 0 });
    const [page, setPage] = useState(defaultPage);
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const router = useRouter();
    useEffect(() => {
        startTransition(() => {
            fetchInventories({search: search ,limit: LIMIT, offset: (page - 1), filters: activeFilters.map(filter => ({
                key: filter.key,
                values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string')
                    ? filter.values
                    : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
            }))})}) }, [page, search, activeFilters]);


    return (
      <>
        <div className="flex flex-row justify-between w-100">
            <Heading heading="2" className="text-gray-700">Inventaire</Heading>
            <Button
                onClick={async () => {
                    const today = new Date();
                    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

                    try {
                    const createdInventory = await createInventoryAction({
                        name: `Inventaire du ${formattedDate}`, 
                        valorisation: "0",
                        createdAt: `${new Date().toISOString().split('T')[0]}`, 
                        status: InventoryStatus.EN_ATTENTE
                    });
                    router.push(`inventory/${createdInventory.id.toString()}`);
                    } catch (error) {
                    console.error("Error creating inventory:", error);
                    }
                }}
                >
                <Plus /> Créer un inventaire
            </Button>
        </div>
        <Card className="mt-8">
            <CardHeader className="flex justify-end flex-row">
                <TableFilter search={{ show: true, placeholder: "Rechercher un inventaire", onSearch: (search) => {
                        setPage(1);
                        setSearch(search);
                    } }}

                    items={{total: inventories.total, count: LIMIT, defaultPage}}
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
                                <TableHead className="w-1/12">#</TableHead>
                                <TableHead className="w-4/12">Nom</TableHead>
                                <TableHead className="w-2/12">Valorisation</TableHead>
                                <TableHead className="w-2/12">Statut</TableHead>
                                <TableHead className="w-3/12 text-end">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                inventories.items.map((inv) => {
                                    return <TableRow key={inv.id} className="cursor-pointer" onClick={() => router.push(`/products/inventory/${inv.id}`)}>
                                        <TableCell>
                                            {inv.id}
                                        </TableCell>
                                        <TableCell>
                                            {inv.name}
                                        </TableCell>
                                        <TableCell>
                                            {inv.valorisation} €
                                        </TableCell>
                                        <TableCell>
                                            {inv.status === InventoryStatus.ARCHIVE ? <Badge variant="red" size="md">Archivé</Badge>
                                            : inv.status === InventoryStatus.EN_ATTENTE ? <Badge variant="gray" size="md">En attente</Badge>
                                            : inv.status === InventoryStatus.VALIDE ? <Badge variant="green" size="md">Validé</Badge>
                                            : <Badge variant="orange" size="md">Inconnu</Badge>}
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-end">
                                            {inv.createdAt}
                                        </TableCell>
                                    </TableRow>
                                })
                            }
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </>
    )
}