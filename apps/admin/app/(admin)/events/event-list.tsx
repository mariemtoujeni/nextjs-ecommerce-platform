"use client";

import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell} from "~/components/ui/table";
import { useState, useEffect, useActionState, startTransition } from "react";
import { Button, Card, CardContent, CardHeader, Heading, Popover, PopoverContent, PopoverTrigger } from "~/components/ui";
import { Event, EventFilterInput } from "@repo/core/models";
import { Plus, Trash } from "lucide-react";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";
import { deleteEventAction, getEventsAction } from "@repo/actions/events";
import { format } from "date-fns";
import { EventStatus } from "./utils";
import { TableFilter } from "~/components/TableFilter";
import { toast } from "~/hooks/use-toast";

interface EventProps {
  filters: GenericFilter[];
  defaultPage: number;
}

const LIMIT = 50;

export const ListEvents: React.FC<EventProps> =  ({ filters, defaultPage }: EventProps) => {
  const router = useRouter();
  const [events, fetchEvents] = useActionState(
        (state: ReturnAll<Event>, payload: EventFilterInput) => getEventsAction(payload), 
        { total: 0, items: [], count: 0 }
    );
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);
  const [page, setPage] = useState(defaultPage);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
      startTransition(() => {
          fetchEvents({limit: LIMIT, offset: (page - 1), search
              , filters: activeFilters.map(filter => ({
                  key: filter.key,
                  values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                      ? filter.values 
                      : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
              }))
          });
      });
  }, [page, activeFilters, search, reloadTrigger]);

  return (
    <>
      <div className="flex flex-row justify-between w-100">
        <Heading key='page-title' heading={"2"}>Gestion des évènements</Heading>
        <Button className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2" onClick={() => router.push("/events/create")}>
          <Plus /> Créer un évènement
        </Button>
      </div>
      <Card className="mt-8">
        <CardHeader className="flex justify-end flex-row">
          <TableFilter search={{ show: true, placeholder: "Rechercher un évènement", onSearch: (search) => {
                        setPage(1);
                        setSearch(search);
                    } }}

                items={{total: events.total, count: LIMIT, defaultPage}}
                filters={filters}
                activeFilters={activeFilters}
                onFiltersChange={(filters) => {
                    setActiveFilters(filters);                    }}
                  onPageChange={(page) => setPage(page)}
                />
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader className="bg-neutral-100">
                <TableRow>
                  <TableHead className="w-2/6">Nom</TableHead>
                  <TableHead className="w-1/6">Date de début</TableHead>
                  <TableHead className="w-1/6">Date de fin</TableHead>
                  <TableHead className="w-1/6">Statut</TableHead>
                  <TableHead className="w-1/6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.items.map((event) => (
                  <TableRow key={event.id} className="cursor-pointer" onClick={() => router.push(`/events/${event.id}`)}>
                    <TableCell className="w-2/6">{event.name}</TableCell>
                    <TableCell className="w-1/6">{format(new Date(event.startDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="w-1/6">{format(new Date(event.endDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="w-1/6">
                      {event.status === EventStatus.Draft ? <Badge variant="gray">Brouillon</Badge>
                      : event.status === EventStatus.Published ? <Badge variant="green">Publié</Badge>
                      : event.status === EventStatus.Unpublished ? <Badge variant="blue">Dépublié</Badge>
                      : event.status === EventStatus.Coming ? <Badge variant="purple">A venir</Badge>
                      : <Badge variant="orange" size="md">Inconnu</Badge>
                      }
                    </TableCell>
                    <TableCell className="w-1/6">                                                    
                      <div className="flex justify-end">
                        <Popover open={deletePopoverOpen === event.id} onOpenChange={(open) => setDeletePopoverOpen(open ? event.id : null)} >
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletePopoverOpen(event.id);
                              }}
                            >
                              <Trash size={18} className="text-red-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72" onClick={(e) => e.stopPropagation()}>
                            <p className="text-sm mb-4">
                              Êtes-vous sûr de vouloir supprimer cet évènement ?
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletePopoverOpen(null);
                                }}
                              >
                                Annuler
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  await deleteEventAction(event.id);
                                  toast({
                                    title: "Évènement supprimé avec succès",
                                    description: "L'évènement a été supprimé avec succès",
                                  });
                                  setReloadTrigger(prev => prev + 1);
                                
                                  setDeletePopoverOpen(null);
                                }}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
