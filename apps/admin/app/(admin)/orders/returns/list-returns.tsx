'use client'

import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { ReturnFilterInput, ReturnPresenter, ReturnStatus } from "@repo/core/models";
import { Badge, Button, Card, CardContent, CardHeader } from "~/components/ui";
import { TableFilter } from "~/components/TableFilter";
import { startTransition, useActionState, useEffect, useState } from "react";
import { listReturnsAction } from "@repo/actions/orders";
import { useToast } from "~/hooks/use-toast";
import { Spinner } from "~/components/Spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useRouter } from "next/navigation";

export interface ListReturnsProps {
    returns: ReturnAll<ReturnPresenter>;
    filters: GenericFilter[];
}

const LIMIT = 100;

export const ListReturnsView: React.FunctionComponent<ListReturnsProps> = ({ filters }: ListReturnsProps) => {
    const { toast } = useToast();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

    const [returns, fetchReturns, pending] = useActionState(
        (state: ReturnAll<ReturnPresenter>, payload: ReturnFilterInput) => listReturnsAction(payload), 
        { total: 0, items: [], count: 0 }
    );

    useEffect(() => {
        startTransition(() => {
            fetchReturns({limit: LIMIT, offset: (page - 1), search: search, filters: activeFilters.map(filter => ({
                key: filter.key,
                values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                ? filter.values 
                : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
            }))});
        });
    }, [page, activeFilters, search]);

    useEffect(() => {
        if(returns && (returns.error || !returns.items)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération des retours, erreur : " + (returns.error || "Aucun retour trouvé"),
                variant: "destructive",
            });
        }
    }, [returns]);

    const router = useRouter();

    function handleRouterPush(path: string) {
        if(path && path.length > 0 && router) {
            router.push(path);
        }
    }

    return <div className="flex flex-col gap-4 mt-8 w-full">                                
        <Card className="w-full">
            <CardHeader>
                <TableFilter 
                    search={
                        { 
                            show: true, 
                            placeholder: "Rechercher un retour", 
                            onSearch: (search) => {
                                setPage(1);
                                setSearch(search);
                            } 
                        }
                    }
                    items={{total: returns.total, count: LIMIT, defaultPage: page}}
                    filters={filters}
                    activeFilters={activeFilters}
                    onFiltersChange={(filters) => {
                        setActiveFilters(filters);
                    }}
                    onPageChange={(page) => setPage(page)}
                />
            </CardHeader>
            <CardContent>
                {
                    pending ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex flex-col items-center gap-2">
                                <Spinner variant="circle" size={32} />
                                <p className="text-sm text-gray-500">Chargement des retours...</p>
                            </div>
                        </div>
                    ) : returns.items.length === 0 || (returns.error && returns.error.length > 0) ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-sm text-gray-500">Aucun retour trouvé</p>
                            </div>
                        </div>
                    ) : (
                        <div className="border rounded-lg w-full">
                            <Table className="w-full">
                                <TableHeader className="bg-neutral-100 w-full">
                                    <TableRow>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Commande</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="w-full">
                                    {returns.items.map((r) => (
                                        <TableRow key={r.id} className="w-full hover:bg-neutral-50 cursor-pointer" onClick={() => {
                                            handleRouterPush(`/orders/returns/${r.id}`);
                                        }}>
                                            <TableCell className="w-[20%]">{r.id}</TableCell>
                                            <TableCell className="w-[20%]">
                                                <span 
                                                    className="text-blue-500 underline underline-offset-8 flex flex-row gap-2 items-center cursor-pointer" 
                                                    onClick={() => {
                                                        handleRouterPush(`/orders/${r.orderId}`);
                                                    }}
                                                >{r.orderId}</span>
                                            </TableCell>
                                            <TableCell className="w-[20%]">
                                                <span 
                                                    className="text-blue-500 underline underline-offset-8 flex flex-row gap-2 items-center cursor-pointer" 
                                                    onClick={() => {
                                                        handleRouterPush(`/clients/${r.client.clientNumber}`);
                                                    }}
                                                >{r.client.firstName} {r.client.lastName}</span>
                                            </TableCell>
                                            <TableCell className="w-[20%]">{
                                                r.status === ReturnStatus.PENDING ? 
                                                    <Badge variant="blue">En attente</Badge> : 
                                                        r.status === ReturnStatus.APPROVED ? <Badge variant="orange">Approuvé</Badge> : 
                                                            r.status === ReturnStatus.VALIDATED ? <Badge variant="green">Validé</Badge> : 
                                                                r.status === ReturnStatus.REJECTED ? <Badge variant="red">Refusé</Badge> :
                                                                    <Badge variant="gray">{r.status}</Badge>
                                            }</TableCell>
                                            <TableCell className="w-[20%]">{r.requestDate.toLocaleString("fr-FR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit"
                                            })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )
                }
            </CardContent>
        </Card>
    </div>

}