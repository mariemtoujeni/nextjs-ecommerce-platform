'use client'

import { AttributDetail, AttributFilter, FilterRequest } from "@repo/core/models";
import { Plus } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { Heading } from "~/components/ui/heading"
import { Tooltip, TooltipTrigger, TooltipProvider } from "~/components/ui/tooltip";
import { CreateFilterModal } from "../(modals)/CreateFilterModal";

// Types
interface FilterComponentProps {
    detail: AttributDetail;
    onFilterAdded: (filter: (FilterRequest & { id: number })[]) => void;
    onFilterUpdated: (filter: AttributFilter[]) => void;
    onFilterDeleted: (filter: AttributFilter[]) => void;
}

// Composant pour afficher un filtre individuel
const FilterItem = ({ filter, onClick }: { filter: AttributFilter; onClick: () => void }) => (
    <div onClick={onClick}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    {filter.couleur && (
                        <span
                            className="inline-block w-5 h-5 rounded"
                            style={{ backgroundColor: filter.couleur }}
                        />
                    )}
                    <span className="text-gray-700 text-sm font-medium">{filter.nom}</span>
                </div>
            </TooltipTrigger>
        </Tooltip>
    </div>
);

export const FilterComponent: React.FC<FilterComponentProps> = ({ 
    detail, 
    onFilterAdded, 
    onFilterUpdated, 
    onFilterDeleted 
}) => {
    // Safety check to prevent rendering with null detail
    if (!detail) {
        return null;
    }

    const [filterToUpdate, setFilterToUpdate] = useState<AttributFilter | null>(null);
    const [filters, setFilters] = useState<AttributFilter[]>(detail?.filters ?? []);
    const [isOpen, setIsOpen] = useState(false);

    const handleDialogChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setFilterToUpdate(null);
        }
    }, []);

    const handleFilterAdd = useCallback((filter: FilterRequest) => {
        setIsOpen(false);
        const minId = filters.length > 0 && Math.min(...filters.map(f => f.id)) < 0 ? Math.min(...filters.map(f => f.id)) : 0;
        const newFilters: AttributFilter[] = [...filters, {
            id: minId - 1,
            id_attribut: filter.id_attribut,
            nom: filter.nom,
            couleur: filter.couleur
        }];
        setFilters(newFilters);
        onFilterAdded(newFilters);
    }, [filters, onFilterAdded]);

    const handleFilterUpdate = useCallback((filter: AttributFilter) => {
        setIsOpen(false);
        const newFilters: AttributFilter[] = [...filters.filter(f => f.id !== filter.id), filter];
        setFilters(newFilters);
        onFilterUpdated(newFilters);
    }, [filters, onFilterUpdated]);

    const handleFilterDelete = useCallback((filter_id: number) => {
        setIsOpen(false);
        const newFilters: AttributFilter[] = filters.filter(f => f.id !== filter_id);
        setFilters(newFilters);
        onFilterDeleted(newFilters);
    }, [filters, onFilterDeleted]);

    const handleFilterClick = useCallback((filter: AttributFilter) => {
        setFilterToUpdate(filter);
        setIsOpen(true);
    }, []);    

    return (
        <div className="mt-5">
            <Card>
                <CardHeader>
                    <div className="flex flex-row justify-between w-100">
                        <CardTitle>
                            <Heading heading="3" className="text-gray-700 font-bolde">Filtres</Heading>
                        </CardTitle>
                        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
                            <DialogTrigger 
                                className="flex flex-row gap-1 cursor-pointer" 
                                onClick={() => setFilterToUpdate(null)}
                            >
                                <Plus className="text-blue-500" />
                                <span className="text-blue-500 underline underline-offset-8">Nouveau filtre</span>
                            </DialogTrigger>
                            <CreateFilterModal 
                                id_attribut={detail.id} 
                                filter={filterToUpdate ?? undefined}
                                onClose={() => setIsOpen(false)}
                                onFilterAdd={handleFilterAdd}
                                onFilterUpdated={handleFilterUpdate}
                                onFilterDeleted={handleFilterDelete}
                            />
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3 items-center">
                        <TooltipProvider>
                            {filters.map((filter: AttributFilter) => (
                                <FilterItem 
                                    key={filter.id} 
                                    filter={filter} 
                                    onClick={() => handleFilterClick(filter)} 
                                />
                            ))}
                        </TooltipProvider>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};