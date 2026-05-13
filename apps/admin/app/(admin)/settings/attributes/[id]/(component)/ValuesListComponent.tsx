'use client'

import { Plus } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Heading, Input, Label, Tooltip, TooltipProvider, TooltipTrigger } from "~/components/ui";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { AttributDetail, AttributValueWithFilter, AttributFilter } from "@repo/core/models";
import React from "react";

// Composant pour afficher un filtre
const FilterItem = React.memo(({ filter, isSelected, onClick }: { filter: AttributFilter; isSelected: boolean; onClick: () => void }) => (
    <div onClick={onClick} className="w-fit">
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-gray-100 cursor-pointer`}>
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
));

// Nouveau composant ValueDialog
const ValueDialog = React.memo(({ isOpen, setIsOpen, valueToUpdate, setValueToUpdate, detail, handleValueUpdate, handleDelete }: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    valueToUpdate?: AttributValueWithFilter;
    setValueToUpdate: (value: AttributValueWithFilter | undefined) => void;
    detail: AttributDetail;
    handleValueUpdate: () => void;
    handleDelete: () => void;
}) => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[500px] fixed top-[300px]" aria-describedby="desc-id">
            <DialogTitle>
                {valueToUpdate ? `Modifier ${valueToUpdate.nom}` : 'Ajouter une entrée'}
            </DialogTitle>
            <ValueForm 
                valueToUpdate={valueToUpdate}
                setValueToUpdate={setValueToUpdate}
                detail={detail}
            />
            <DialogFooter className="mt-5">
                <div className="flex justify-between items-center w-full">
                    {valueToUpdate && valueToUpdate.id > 0 ? (
                        <Button 
                            variant={'destructive'} 
                            size={'lg'} 
                            onClick={handleDelete}
                        >
                            Supprimer
                        </Button>
                    ) : (
                        <p></p>
                    )}
                    <div className="flex gap-2">
                        <Button 
                            variant={'outline'} 
                            size={'lg'}
                            onClick={() => {
                                setIsOpen(false);    
                                setValueToUpdate(undefined);                    
                            }}
                        >
                            Annuler
                        </Button>
                        <Button 
                            variant={'default'} 
                            size={'lg'}
                            onClick={handleValueUpdate}
                        >
                            {valueToUpdate && valueToUpdate.id > 0 ? 'Modifier' : 'Ajouter'}
                        </Button>
                    </div>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
));

// Optimisation de ValueForm : mémoïsation de la liste des filtres
const ValueForm = ({ valueToUpdate, setValueToUpdate, detail }: { 
    valueToUpdate?: AttributValueWithFilter; 
    setValueToUpdate: (value: AttributValueWithFilter) => void;
    detail: AttributDetail;
}) => {
    const [attributeValues, setAttributeValues] = useState<AttributValueWithFilter>(valueToUpdate ? valueToUpdate : {
        id: -1,
        nom: '',
        linkedFilters: [],
        id_attribut: detail.id
    });
    const filterItems = React.useMemo(() => (
        detail.filters.map((filter: AttributFilter) => (
            <FilterItem
                key={filter.id}
                filter={filter}
                isSelected={valueToUpdate?.linkedFilters.some(f => f.id === filter.id) || false}
                onClick={() => {
                    if(valueToUpdate) {
                        const newLinkedFilters = valueToUpdate.linkedFilters.some(f => f.id === filter.id)
                            ? valueToUpdate.linkedFilters.filter(f => f.id !== filter.id)
                            : [...valueToUpdate.linkedFilters, filter];
                        setValueToUpdate({ ...valueToUpdate, linkedFilters: newLinkedFilters });
                    }
                }}
            />
        ))
    ), [detail.filters, valueToUpdate, setValueToUpdate]);

    return (
        <div className="flex flex-col gap-8 pt-9">
            <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nom</Label>
                <Input 
                    id="name" 
                    className="bg-neutral-100 p-2 rounded-lg" 
                    value={attributeValues.nom} 
                    onChange={(e) => {
                        setAttributeValues({ ...attributeValues, nom: e.target.value });
                        setValueToUpdate({ ...attributeValues, nom: e.target.value });
                    }}
                />
            </div>
            <div className="flex flex-wrap gap-3 items-center">
                <TooltipProvider>
                    {filterItems}
                </TooltipProvider>
            </div>
        </div>
    );
};

export type ValuesListComponentProps = {
    detail: AttributDetail;
    onValueListChanged: (values: AttributValueWithFilter[]) => void;
}

export const ValuesListComponent: React.FC<ValuesListComponentProps> = ({ detail, onValueListChanged }) => {
    // Safety check to prevent rendering with null detail
    if (!detail) {
        return null;
    }

    const [values, setValues] = useState<AttributValueWithFilter[]>(detail.values ?? []);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);     
    const [valueToUpdate, setValueToUpdate] = useState<AttributValueWithFilter | undefined>(undefined);

    // Mémoisation des valeurs filtrées avec debounce
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setValues(detail.values);
    }, [detail.values]);

    const filteredValues = useMemo(() => {
        return values.filter(value => 
            value.nom.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [values, debouncedSearch]);

    // Gestionnaire de mise à jour des valeurs
    const handleValueUpdate = useCallback(() => {
        if (!valueToUpdate) return;

        let newValues: AttributValueWithFilter[];
        if (valueToUpdate.id < 0) {
            const newId = values.length > 0 && Math.min(...values.map(v => v.id)) < 0 ? Math.min(...values.map(v => v.id)) - 1 : 0;
            newValues = [
                ...values,
                {
                    ...valueToUpdate,
                    id: newId,
                    linkedFilters: [
                        ...valueToUpdate.linkedFilters
                    ]
                }
            ];
        } else {
            newValues = [
                ...values.filter(v => v.id !== valueToUpdate.id),
                valueToUpdate
            ];
        }
        setValues(newValues);
        onValueListChanged(newValues);
        setIsOpen(false);
        setValueToUpdate(undefined);
    }, [valueToUpdate, values, onValueListChanged]);

    // Gestionnaire de suppression
    const handleDelete = useCallback(() => {
        if (!valueToUpdate) return;
        
        const newValues = values.filter(v => v.id !== valueToUpdate.id);
        setValues(newValues);
        onValueListChanged(newValues);
        setValueToUpdate(undefined);
        setIsOpen(false);
    }, [valueToUpdate, values, onValueListChanged]);

    return (
        <div className="my-5">
            <Card>
                <CardHeader>
                    <div className="flex flex-row justify-between w-100">
                        <CardTitle>
                            <Heading key={"titre2"} heading={"3"} className="text-gray-700 font-bolde">Liste des entrées</Heading>
                        </CardTitle>
                        <Button
                            className="flex flex-row gap-1 cursor-pointer"
                            onClick={() => {
                                setValueToUpdate(undefined);
                                setIsOpen(true);
                            }}
                            variant="ghost"
                        >
                            <Plus className="text-blue-500" />
                            <span className="text-blue-500 underline underline-offset-8">Ajouter une entrée</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center p-2">
                        <Input 
                            placeholder="Rechercher..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                    </div>
                    <div className="mt-5 p-2">
                        <div className="border-2 border-gray-200 rounded-lg">
                            <Table>
                                <TableHeader className="bg-neutral-100">
                                    <TableRow>
                                        <TableHead className="text-base w-3/6">Titre</TableHead>
                                        <TableHead className="text-base w-2/6">Filtre</TableHead>
                                        <TableHead className="text-base w-1/6">Ajouté par</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredValues.map((attributeValue) => (
                                        <TableRow 
                                            key={`attribute-value-row-${attributeValue.id}`} 
                                            className="cursor-pointer" 
                                            onClick={() => {
                                                setValueToUpdate(attributeValue);           
                                                setIsOpen(true);
                                            }}
                                        >
                                            <TableCell className="text-base font-normal text-black px-2 py-3 text-sm/7">
                                                {attributeValue.nom}
                                            </TableCell>
                                            <TableCell className="text-base font-normal text-black px-2 py-3 text-sm/7">
                                                <div className="flex flex-row gap-2 items-center">
                                                    {attributeValue.linkedFilters.map((filter) => (
                                                        <FilterItem
                                                            key={filter.id}
                                                            filter={filter}
                                                            isSelected={false}
                                                            onClick={() => {}}
                                                        />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-base font-normal text-black px-2 py-3 text-sm/7">
                                                admin
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {isOpen && (
                <ValueDialog
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    valueToUpdate={valueToUpdate}
                    setValueToUpdate={setValueToUpdate}
                    detail={detail}
                    handleValueUpdate={handleValueUpdate}
                    handleDelete={handleDelete}
                />
            )}
        </div>
    );
}