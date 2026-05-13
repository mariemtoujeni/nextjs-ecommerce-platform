"use client";
import { Card, CardContent, CardHeader } from "~/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Quotation, QuotationFilterInput, QuotationStatus } from "@repo/core/models";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllQuotationAction } from "@repo/actions/quotation";
import { Badge } from "~/components/ui/badge";
import { useDebounce } from "~/hooks/use-debounce";
import { TableFilter } from "~/components/TableFilter";

export interface QuotationProps {
  initialQuotations: ReturnAll<Quotation>;
}

const LIMIT = 50;

export const ListQuotations = ({ filters, defaultPage }: {filters: GenericFilter[], defaultPage: number}) => {

  const [quotations, fetchQuotations, pending] = useActionState(
        (state: ReturnAll<Quotation>, payload: QuotationFilterInput) => getAllQuotationAction(payload), 
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
        fetchQuotations({
            limit: LIMIT,
            offset: page - 1,
            search: search,
            filters: formatFilters(activeFilters),
        });
        });

    }, [page, activeFilters, search]);

    return (
            <div className="mt-8">
                <Card>
                    <CardHeader className="flex justify-start flex-row">
                      <div className="flex flex-row justify-end items-center w-full pe-2">
                        <TableFilter 
                            search={{ show: true, placeholder: "Rechercher un devis...", onSearch: (search) => {
                                setPage(1);
                                setSearch(search);
                            } }}
                            items={{ total: quotations.total, count: LIMIT, defaultPage: page }}
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
                      <div className="border rounded-lg">
                        <Table>
                            <TableHeader className="bg-neutral-100">
                                <TableRow>
                                    <TableHead className="w-[25%]">Référence</TableHead>
                                    <TableHead className="w-[25%]">Statut</TableHead>
                                    <TableHead className="w-[25%]">Club</TableHead>
                                    <TableHead className="w-[25%] text-right pr-4">Montant</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotations.items
                                .map((quotation) => (
                                        <TableRow key={quotation.id} className="cursor-pointer" onClick={() => router.push(`/quotation/${quotation.id}`)}>
                                            <TableCell>#{quotation.id}</TableCell>
                                            <TableCell>{quotation.status === QuotationStatus.VALIDE ? <Badge variant="green" size="md">Validé</Badge>
                                                : quotation.status === QuotationStatus.ARCHIVE ? <Badge variant="red" size="md">Archivé</Badge>
                                                : quotation.status === QuotationStatus.EN_ATTENTE ? <Badge variant="gray" size="md">En attente</Badge>
                                                : <Badge variant="orange" size="md">Inconnu</Badge>}
                                            </TableCell>
                                            <TableCell>{quotation.club?.name ?? '—'}</TableCell>
                                            <TableCell className="text-right pr-4">{quotation.totalAmount} €</TableCell>
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