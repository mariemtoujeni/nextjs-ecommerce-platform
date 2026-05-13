'use client'

import { startTransition, useActionState, useEffect, useState } from "react";
import { getListAllStocksAction } from "@repo/actions/stocks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge, Card, CardContent, CardHeader, Heading, CardTitle, Button } from "~/components/ui";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { StockFilterInput, StockPresenter } from "@repo/core/models";
import { TableFilter } from "~/components/TableFilter";
import { Spinner } from "~/components/Spinner";
import { ModelCell } from "~/components/ModelCell";
import { useToast } from "~/hooks/use-toast";

export interface ListStocksProps {
    stocks: ReturnAll<StockPresenter>;
    filters: GenericFilter[];
    page: number;
}

const LIMIT = 100;

export const ListStocksView = ({ stocks: stocksProps, filters, page: defaultPage }: ListStocksProps) => { 
    const [page, setPage] = useState<number>(defaultPage);
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const { toast } = useToast();
    const [stocks, fetchStocks, pending] = useActionState(
        (state: ReturnAll<StockPresenter>, payload: StockFilterInput) => getListAllStocksAction(payload), 
        { total: 0, items: [], count: 0 }
    );

    useEffect(() => {
        startTransition(() => {
            fetchStocks({limit: LIMIT, offset: (page - 1), search: search, filters: activeFilters.map(filter => ({
                key: filter.key,
                values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') ? filter.values : []
            }))});
        });
    }, [page, activeFilters, search]);

    if(stocks && (stocks.error || !stocks.items)) {
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la récupération des stocks, erreur : " + (stocks.error || "Aucun stock trouvé"),
            variant: "destructive",
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <Card className="mt-8">
                <CardHeader>
                    <TableFilter search={{ show: true, placeholder: "Rechercher un stock", onSearch: (search) => {
                        setPage(1);
                        setSearch(search);
                    } }}

                    items={{total: stocks.total, count: LIMIT, defaultPage: page}}
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
                                    <p className="text-sm text-gray-500">Chargement des stocks...</p>
                                </div>
                            </div>
                        ) : stocks.items.length === 0 || (stocks.error && stocks.error.length > 0) ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-sm text-gray-500">Aucun stock trouvé</p>
                                </div>
                            </div>
                        ) : (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader className="bg-neutral-100">
                                        <TableRow>
                                            <TableHead className="text-left w-[40%]">Produit</TableHead>
                                            <TableHead className="text-left w-[20%]">Code barre</TableHead>
                                            <TableHead className="text-left w-[10%]">Bloqué</TableHead>
                                            <TableHead className="text-left w-[10%]">Indisponible</TableHead>
                                            <TableHead className="text-left w-[10%]">Disponible</TableHead>
                                            <TableHead className="text-center w-[10%]">Statut</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stocks.items.map((stock) => (
                                            <TableRow key={stock.idModel}>
                                                <TableCell>
                                                <ModelCell
                                                        model={
                                                            stock.model
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>{stock.model.codeBar}</TableCell>
                                                <TableCell>{stock.locked}</TableCell>
                                                <TableCell>{stock.indisponible}</TableCell>
                                                <TableCell>{stock.disponible}</TableCell>
                                                <TableCell className="text-center"><Badge variant={stock.published ? "green" : "red"}>{stock.published ? "Publié" : "Non publié"}</Badge></TableCell>
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
    )
}