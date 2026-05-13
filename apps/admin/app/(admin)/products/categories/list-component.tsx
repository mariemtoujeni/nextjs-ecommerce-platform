"use client";

import React, { startTransition, useActionState, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardContent } from "~/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { Category, SubCategory, Store, CategoryFilterInput } from "@repo/core/models";
import { Switch } from "~/components/ui/switch";
import { Trash2 } from "lucide-react";
import { HeadingComp } from "./heading-component";
import { Input } from "~/components/ui/input";
import { CategoryDetail } from "./modal-modifier";
import { Badge } from "~/components/ui/badge";
import { useLocalTabs } from "~/hooks/use-tabs";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { Tab } from "./tabConfig";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { addCategoryAction, deleteCategoryAction, getCategoriesAction, updateCategoryAction } from "@repo/actions/categories";
import { TableFilter } from "~/components/TableFilter";
import { addSubCategoryAction, deleteSubCategoryAction, getSubCategoriesAction, updateSubCategoryAction } from "@repo/actions/subcategories";
import { addStoreAction, deleteStoreAction, getStoresAction, updateStoreAction } from "@repo/actions/stores";

interface ListingProps {
  filters: GenericFilter[];
  defaultPage: number;
}
const LIMIT = 50;
const TABS: Tab[] = ["Magasins", "Catégories", "Sous-Catégories"];
export type ItemType = Category | SubCategory | Store

export const ListingComponent: React.FC<ListingProps> = ({ filters, defaultPage }) => {
  const { currentTab: activeTab, items: tabItems } = useLocalTabs<Tab>(TABS, "Magasins");
  const [openId, setOpenId] = useState<number | null>(null);
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);
  const [switchPopoverOpen, setSwitchPopoverOpen] = useState<number | null>(null);
  const [categoryItems, fetchCategories] = useActionState(
      (state: ReturnAll<Category>, payload: CategoryFilterInput) => getCategoriesAction(payload), 
      { total: 0, items: [], count: 0 }
    );
  const [subCategoryItems, fetchSubCategories] = useActionState(
      (state: ReturnAll<SubCategory>, payload: CategoryFilterInput) => getSubCategoriesAction(payload), 
      { total: 0, items: [], count: 0 }
    );
  const [storeItems, fetchStores] = useActionState(
      (state: ReturnAll<Store>, payload: CategoryFilterInput) => getStoresAction(payload), 
      { total: 0, items: [], count: 0 }
    );

  const [page, setPage] = useState(defaultPage);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const { items, fetchItems } = activeTab === "Magasins" ? { items: storeItems, fetchItems: fetchStores }
      : activeTab === "Catégories" ? { items: categoryItems, fetchItems: fetchCategories }
      : { items: subCategoryItems, fetchItems: fetchSubCategories };
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
      startTransition(() => {
          fetchItems({limit: LIMIT, offset: (page - 1), search
              , filters: activeFilters.map(filter => ({
                  key: filter.key,
                  values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                      ? filter.values 
                      : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
              }))
          });
       });
    }, [page, activeFilters, search, activeTab, reloadTrigger]); 


  const handleAdd = async (item: Omit<ItemType, 'id'> & { clubId?: number }) => {
    try {
      if (activeTab === "Magasins") {
        await addStoreAction(item as Omit<Store, 'id'> & { clubId?: number });
      } else if (activeTab === "Catégories") {
        await addCategoryAction(item as Omit<Category, 'id'>);
      } else {
        await addSubCategoryAction(item as Omit<SubCategory, 'id'>);
      }
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to add:", err);
    }
  };


  const handleUpdate = async (item: ItemType) => {
    const transformedItem = {
      ...item,
      ...(typeof item.active === "boolean" && { active: item.active ? 1 : 0 }),
    };

    try {
      if (activeTab === "Magasins") {
        await updateStoreAction(transformedItem as Store);
      } else if (activeTab === "Catégories") {
        await updateCategoryAction(transformedItem as Category);
      } else {
        await updateSubCategoryAction(transformedItem as SubCategory);
      }
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (activeTab === "Magasins") {
        await deleteStoreAction(id);
      } else if (activeTab === "Catégories") {
        await deleteCategoryAction(id);
      } else {
        await deleteSubCategoryAction(id);
      }

    setDeletePopoverOpen(null);
    setReloadTrigger(prev => prev + 1);

    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleSwitchConfirm = async (item: ItemType) => {
    const inverse = item.active === 1 ? 0 : 1;
    await handleUpdate({ ...item, active: inverse });
    setSwitchPopoverOpen(null);
    setReloadTrigger(prev => prev + 1);
  };


  return (
    <>
      <HeadingComp activeTab={activeTab} onAdd={handleAdd} />

      <Card className="mt-8">
        <CardHeader>
          <div className="flex flex-row justify-between gap-2 flex-1 pe-2">
            <div className="flex flex-wrap gap-2">
              {tabItems.map(({ key, isActive, switchTo }) => (
                <Button key={key} variant={isActive ? "default" : "secondary"} onClick={switchTo} >
                  {key}
                </Button>
              ))}
            </div>  
            <TableFilter search={{ show: true, placeholder: "Rechercher...", onSearch: (search) => {
                    setPage(1);
                    setSearch(search);
                } }}
                items={{total: items.total, count: LIMIT, defaultPage}}
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
            <Table className="table-fixed w-full">
              <TableHeader className="bg-neutral-100">
                <TableRow>
                  <TableHead className="w-[5%] min-w-[40px]">#</TableHead>
                  <TableHead className="w-[40%] min-w-[180px]">{activeTab}</TableHead>
                  <TableHead className="w-[20%] min-w-[100px]">Statut</TableHead>
                  <TableHead className="w-[15%] min-w-[80px]">Order</TableHead>
                  <TableHead className="text-end px-4 sm:px-10 w-[20%] min-w-[140px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.items.map(item => (
                  <TableRow key={item.id} onClick={() => setOpenId(item.id ?? null)}>
                    <TableCell className="w-[5%] min-w-[40px]">{item.id}</TableCell>
                    <TableCell className="w-[40%] min-w-[180px] px-3">
                      <span title={item.name} className="break-all block">
                        {item.name}
                      </span>
                    </TableCell>
                    <TableCell className="w-[20%] min-w-[100px]">
                      {( item.active === 1 
                          ? <Badge variant="green">Actif</Badge>
                          : <Badge variant="red">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="w-[15%] min-w-[80px]">
                      <Input
                        type="text"
                        value={String(item.order ?? "")}
                        readOnly
                        className={`w-[50%] text-center border rounded-md py-1 bg-white text-black border-gray-300`}
                      />
                    </TableCell>
                    <TableCell className="align-end w-[20%] min-w-[140px] px-4 sm:px-10">
                      <div className="flex items-center justify-end gap-4">
                        <Popover open={deletePopoverOpen === item.id} onOpenChange={(open) => setDeletePopoverOpen(open ? item.id : null)} >
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletePopoverOpen(item.id);
                              }}
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72" onClick={(e) => e.stopPropagation()}>
                            <p className="text-sm mb-4">
                              Êtes-vous sûr de vouloir supprimer cet élément ?
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
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

      {openId !== null && (
        <CategoryDetail
          id={openId}
          activeTab={activeTab}
          onClose={() => setOpenId(null)}
          onUpdate={handleUpdate}
          onDelete={(item) => handleDelete(item.id)}
        />
      )}
    </>
  );
};