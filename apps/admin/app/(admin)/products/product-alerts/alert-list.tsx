"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import Image from "next/image";
import noPicture from "~/public/no-picture.jpg";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { ProductAlert, ProductAlertFilterInput } from "@repo/core/models";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { Card, CardHeader, CardContent, Popover, PopoverTrigger, Button, PopoverContent} from "~/components/ui";
import { deleteProductAlertAction, getAllProductAlertsAction, sendRetourEnStockEmailAction, updateProductAlertAction } from "@repo/actions/product-alerts";
import { TableFilter } from "~/components/TableFilter";
import { useDebounce } from "~/hooks/use-debounce";
import { useRouter } from "next/navigation";
import { toast } from "~/hooks/use-toast";
import { Trash } from "lucide-react";

const LIMIT = 50;

export const AlertList = ({ filters, defaultPage }: {filters: GenericFilter[], defaultPage: number}) => {
  const [alerts, fetchAlerts, pending] = useActionState(
          (state: ReturnAll<ProductAlert>, payload: ProductAlertFilterInput) => getAllProductAlertsAction(payload), 
          { total: 0, items: [], count: 0 }
      );
  const [page, setPage] = useState(defaultPage);
  const [search, setSearch] = useDebounce('', 300); 
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const router = useRouter();
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  useEffect(() => {
    startTransition(() => {
      fetchAlerts({
        limit: LIMIT,
        offset: page - 1,
        search: search,
        filters: activeFilters.map(filter => ({
                  key: filter.key,
                  values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                      ? filter.values 
                      : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
              }))
      });
    });
  }, [page, activeFilters, search, reloadTrigger]);

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex flex-row justify-end items-center w-full pe-2">
            <TableFilter 
                items={{ total: alerts.total, count: LIMIT, defaultPage: page }}
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
          <Table className="table-fixed">
            <TableHeader className="bg-neutral-100">
              <TableRow>
                <TableHead className="w-[29%]">Produit</TableHead>
                <TableHead className="w-[25%]">Client</TableHead>
                <TableHead className="w-[12%]">Statut</TableHead>
                <TableHead className="w-[15%]">Date de réception</TableHead>
                <TableHead className="w-[5%]">Stock</TableHead>
                <TableHead className="w-[22%] text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.items.map((alert) => {
                const description = alert.model.productDetails.descriptions.find(
                  (d) => d.lang === "fr"
                );
                const image =
                  alert.model.productDetails?.images.find(img =>
                    alert.model.attributValues?.some(av => av.idAttributValue === img.attributeValueId)
                  )?.url ?? noPicture;

                return (
                  <TableRow key={alert.id} className="cursor-pointer" onClick={() => router.push(`/products/edit/${alert.model.productId}`)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Image
                          src={image ?? noPicture}
                          alt={description?.title ?? "no-image"}
                          width={48}
                          height={48}
                        />
                        <div className="flex flex-col gap-1">
                        {description?.title}
                        <div className="flex flex-row gap-1">
                          {alert.model.attributValues?.map((item, index) => (
                            <Badge key={index} variant="blue" size="sm">
                              {item.attributValue?.nom}
                            </Badge>
                          ))}
                        </div>

                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="break-all">{alert.email}</TableCell>
                    <TableCell>
                      {alert.isActif ? (
                        <Badge variant="red" size="md">En attente</Badge>
                      ) : (
                        <Badge variant="green" size="md">Traité</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {alert.createdAt
                        ? new Date(alert.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "Date inconnue"}
                    </TableCell>
                    <TableCell>
                      {alert.model.stock?.disponible}
                    </TableCell>    
                    <TableCell>    
                      {alert.isActif && ( 
                      <div className="flex justify-end gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const success = await sendRetourEnStockEmailAction(alert);
                            if (success) {
                              await updateProductAlertAction({
                                ...alert,
                                isActif: false,
                                isEmailSent: true,
                              });
                            toast({
                              title: "Email envoyé avec succès",
                              description: "L'email de retour en stock a été envoyé avec succès",
                            });
                            setReloadTrigger(prev => prev + 1);                                
                            setDeletePopoverOpen(null);
                            }                           
                          }}
                        >
                          Email retour en stock
                        </Button>                      
                        <Popover open={deletePopoverOpen === alert.id} onOpenChange={(open) => setDeletePopoverOpen(open ? alert.id : null)} >
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletePopoverOpen(alert.id);
                              }}
                            >
                              <Trash size={18} className="text-red-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72" onClick={(e) => e.stopPropagation()}>
                            <p className="text-sm mb-4">
                              Êtes-vous sûr de vouloir supprimer cette alerte produit ?
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
                                  await deleteProductAlertAction(alert.id);
                                  toast({
                                    title: "Alerte produit supprimé avec succès",
                                    description: "L'alerte produit a été supprimé avec succès",
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
                      )}       
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}


