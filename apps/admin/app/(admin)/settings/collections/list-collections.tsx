'use client'

import { Collection } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { Trash } from "lucide-react";
import { useState } from "react";
import { Button, Card, CardContent, CardHeader, Input, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { deleteCollectionAction } from "@repo/actions/collections";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";

export interface CollectionProps {
    collections: ReturnAll<Collection>;
}

type Tab = "Tout" | "Actif" | "Inactif";
const TABS: Tab[] = ["Tout", "Actif", "Inactif"];

export const ListCollectionsView : React.FunctionComponent<CollectionProps> = ({collections}) => {
    const [activeTab, setActiveTab] = useState<Tab>("Tout");
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(50);
    const [openConfirmation, setOpenConfirmation] = useState<number | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    if(collections.items.length === 0 || collections.error) {
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la récupération des collections, erreur : " + collections.error,
            variant: "destructive",
        });
    }

    // Filtrer les collections en fonction de la recherche et du tab actif
    const filteredCollections = collections.items.filter(collection => {
        const matchesSearch = collection.name.toLowerCase().includes(search.toLowerCase());
        const matchesTab = activeTab === "Tout" || collection.active === (activeTab === "Actif" ? 1 : 0);
        return matchesSearch && matchesTab;
    });

    // Calculer le nombre total de pages basé sur les collections filtrées
    const totalPages = Math.ceil(filteredCollections.length / pageSize);
    
    // Obtenir les collections pour la page courante
    const paginatedCollections = filteredCollections.slice((page - 1) * pageSize, page * pageSize);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setPage(1); // Réinitialiser à la première page lors du changement de tab
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Réinitialiser à la première page lors de la recherche
    }

    const handlePageChange = (value: string) => {
        setPage(parseInt(value));
    }

    return (
        <>
            <Card className="mt-8">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-row gap-2 flex-1 pe-2">
                            <div className="flex gap-2">
                                {TABS.map((tab) => (
                                    <Button
                                    key={tab}
                                    variant={activeTab === tab ? "default" : "secondary"}
                                    onClick={() => {
                                        handleTabChange(tab)
                                    }}
                                    >
                                    {tab}
                                    </Button>
                                ))}                            
                            </div>
                            <div className="flex-1">
                                <Input placeholder="Rechercher..." value={search} onChange={handleSearchChange} />
                            </div>
                        </div>
                        <Select value={page.toString()} onValueChange={handlePageChange}>
                            <SelectTrigger className="w-[60px]">
                                <SelectValue placeholder="1" />
                            </SelectTrigger>
                            <SelectContent className="!min-w-0 w-[40px]">
                                {Array.from({ length: totalPages }, (_, i) => (
                                <SelectItem
                                    key={i + 1}
                                    value={String(i + 1)}
                                    className="text-center"
                                >
                                    {i + 1}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>                    
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader  className="bg-neutral-100">
                                <TableRow>
                                    <TableHead className="w-3/5">Nom</TableHead>
                                    <TableHead className="w-1/5">Statut</TableHead>
                                    <TableHead className="w-1/5 text-right pr-4">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    paginatedCollections.map((collection) => (
                                        <TableRow key={collection.id} className="cursor-pointer" onClick={() => {
                                            window.location.href = `/settings/collections/${collection.id}`;
                                        }}>
                                            <TableCell className="w-3/5">{collection.name}</TableCell>
                                            <TableCell className="w-1/5">{collection.active === 1 ? <Badge variant="green">Actif</Badge> : <Badge variant="red">Inactif</Badge>}</TableCell>
                                            <TableCell className="w-1/5 text-right pr-4">                                                
                                                <div className="flex justify-end">
                                                    <Popover open={openConfirmation === collection.id} onOpenChange={(open) => setOpenConfirmation(open ? collection.id : null)}>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                setOpenConfirmation(collection.id);
                                                            }}>
                                                                <Trash />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-64 text-sm text-neutral-700 space-y-4">
                                                            <p>Êtes-vous sûr de vouloir supprimer cette collection ?</p>
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="outline" size="sm" onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    setOpenConfirmation(null);
                                                                }}>Annuler</Button>
                                                                <Button variant="destructive" size="sm" onClick={async (e) => {                                                                
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    try {
                                                                        await deleteCollectionAction(collection.id);  
                                                                        router.refresh();                                                      
                                                                        toast({
                                                                            title: "Collection supprimée avec succès",
                                                                            description: "La collection a été supprimée avec succès"
                                                                        });                                     
                                                                    } catch (error) {
                                                                        toast({
                                                                            title: "Erreur",
                                                                            description: "Une erreur est survenue lors de la suppression de la collection, erreur : " + (error as Error).message,
                                                                            variant: "destructive",
                                                                        });
                                                                    }
                                                                    setOpenConfirmation(null);
                                                                }}>Confirmer</Button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}