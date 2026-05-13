'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { Client, ClientFilterInput, ClientType } from "@repo/core/models";
import { getAllClientAction } from "@repo/actions/clients";
import { Card, CardContent, CardHeader } from "~/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from '~/components/ui/badge';
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { TableFilter } from '~/components/TableFilter';
import { useDebounce } from '~/hooks/use-debounce';

const LIMIT = 100;

export const ListClients = ({ filters, defaultPage }: {filters: GenericFilter[], defaultPage: number}) => {
  const [clients, fetchClients, pending] = useActionState(
        (state: ReturnAll<Client>, payload: ClientFilterInput) => getAllClientAction(payload), 
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
    fetchClients({ limit: LIMIT, offset: page - 1, search: search, filters: formatFilters(activeFilters) });
        });
    }, [page, activeFilters, search]);

  return (
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex flex-row justify-end items-center w-full pe-2">
                <TableFilter 
                    search={{ show: true, placeholder: "Rechercher un client...", onSearch: (search) => { setPage(1); setSearch(search) } }}
                    items={{ total: clients.total, count: LIMIT, defaultPage: page }}
                    filters={filters}
                    activeFilters={activeFilters}
                    onFiltersChange={(filters) => { setActiveFilters(filters) }}
                    onPageChange={(page) => setPage(page)}
                    />
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader className="bg-neutral-100">
                  <TableRow>
                    <TableHead className="w-[7%]">#</TableHead>
                    <TableHead className="w-[25%]">Nom Prénom</TableHead>
                    <TableHead className="w-[18%]">Type</TableHead>
                    <TableHead className="w-[22%]">Ville Département</TableHead>
                    <TableHead className="w-[13%]">Commandes</TableHead>
                    <TableHead className="w-[15%] text-right pr-4">Montant dépensé</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.items.map((client) => (
                        <TableRow key={client.clientNumber} className="cursor-pointer" onClick={() => router.push(`/customers/${client.clientNumber}`)}>
                          <TableCell>{client.clientNumber}</TableCell>
                          <TableCell>{client.lastName} {client.firstName}</TableCell>
                          <TableCell>
                            {client.type === ClientType.CLIENT ? <Badge variant="blue" size="md">Client</Badge>
                              : client.type === ClientType.CLUB ? <Badge variant="green" size="md">Club</Badge>
                              : client.type === ClientType.CLUB_PARTENAIRE ? <Badge variant="green" size="md">Club partenaire</Badge>
                              : <Badge variant="orange" size="md">Inconnu</Badge>}
                          </TableCell>
                          <TableCell>{client.clientAddress?.[0]?.code_postal} {client.clientAddress?.[0]?.ville}</TableCell>
                          <TableCell>{client.order?.length ?? 0}</TableCell>
                          <TableCell  className="text-right pr-4">
                            {client.order?.length && (() => {
                              const total = client.order.reduce((sum, order) => sum + (order.amount || 0), 0);
                              return total > 0 ? <>{total.toFixed(2)} €</> : null;
                            })()}
                          </TableCell>
                        </TableRow> 
                          ))}
                </TableBody>
              </Table>
            </div>
          </CardContent> 
        </Card>
      </div>
  );
};



