'use client'

import React, { startTransition, useActionState, useEffect, useState } from "react";
import { Country } from "@repo/core/models";
import { ChevronsUpDown, Plus, Trash } from "lucide-react";
import { Button, Card, Heading, Label } from "~/components/ui";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandGroup } from "~/components/ui/command";
import { addCodeCountryToListWithoutTVAAction, deleteCodeCountryToListWithoutTVAAction, getCountriesWithoutTVAAction, getCountriesWithTVAAction } from "@repo/actions/shipping-manager";
import { useToast } from "~/hooks/use-toast";
import { ReturnAll } from "@repo/core/types";
import { Spinner } from "~/components/Spinner";

export interface CountryListProps {
    id: string;
}

export const CountriesWithoutTVAComponent : React.FunctionComponent<CountryListProps> = ({id}) => {  
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [value, setValue] = React.useState<Country | null>(null);

    const [countriesWithoutTVA, fetchCountriesWithoutTVA, pendingCountriesWithoutTVA] = useActionState(
        (state: ReturnAll<Country>) => getCountriesWithoutTVAAction(), 
        { total: 0, items: [], count: 0 }
    );

    const [countriesWithTVA, fetchCountriesWithTVA, pendingCountriesWithTVA] = useActionState(
        (state: ReturnAll<Country>) => getCountriesWithTVAAction(), 
        { total: 0, items: [], count: 0 }
    );

    // Surveiller les erreurs des actions de chargement
    useEffect(() => {
        if (countriesWithoutTVA.error) {
            toast({
                title: 'Erreur',
                description: `Erreur lors du chargement des pays sans TVA: ${countriesWithoutTVA.error}`,
                variant: 'destructive'
            });
        }
    }, [countriesWithoutTVA.error, toast]);

    useEffect(() => {
        if (countriesWithTVA.error) {
            toast({
                title: 'Erreur',
                description: `Erreur lors du chargement des pays avec TVA: ${countriesWithTVA.error}`,
                variant: 'destructive'
            });
        }
    }, [countriesWithTVA.error, toast]);

    useEffect(() => {
        startTransition(() => {
            fetchCountriesWithoutTVA();
            fetchCountriesWithTVA();
        });
    }, [id]);

    return (
        <div>
            <div className="flex flex-row justify-between w-100">
                <Heading key='page-title' heading={"2"} className="text-gray-700">Pays sans TVA</Heading>
                <Dialog onOpenChange={() => setValue(null)}>
                    <DialogTrigger className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2">                        
                        <Plus /> Ajouter un pays                        
                    </DialogTrigger>
                    <DialogContent className="w-[500px] fixed top-[300px]">
                        <DialogHeader>
                            <DialogTitle>Ajouter un pays</DialogTitle>                            
                        </DialogHeader>
                        <div className="flex flex-col gap-8 pt-9">
                            <div className="flex fex-row gap-5 items-center">
                                <Label htmlFor="country" className="text-right">
                                    Pays
                                </Label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500"
                                        >
                                            {value ? value.name : "Sélectionner un pays..."}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0 max-h-[200px] overflow-y-auto">
                                        <Command>
                                            <CommandInput placeholder="Rechercher un pays..." className="h-9" />
                                            <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                                            <CommandGroup>
                                                {
                                                    countriesWithTVA.items.map((country) => (
                                                        <CommandItem
                                                            key={country.code}
                                                            onSelect={(currentValue) => {
                                                                setValue(country);
                                                                setOpen(false);
                                                            }}
                                                            className="text-sm"
                                                        >
                                                            {country.name}
                                                        </CommandItem>
                                                    ))
                                                }
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>                                
                            </div>
                            <DialogFooter className="mt-5">
                                <Button variant="default" size="lg" onClick={async () => {
                                    if(value) {
                                        try {
                                            const res = await addCodeCountryToListWithoutTVAAction(value.code);
                                            
                                            if (res.error) {
                                                // Afficher l'erreur retournée par l'action
                                                toast({
                                                    title: 'Erreur',
                                                    description: res.error,
                                                    variant: 'destructive'
                                                });
                                            } else {
                                                // Succès
                                                startTransition(() => {
                                                    fetchCountriesWithoutTVA(); // Recharger les données
                                                    fetchCountriesWithTVA(); // Recharger les données
                                                });
                                                setValue(null);
                                                setOpen(false);
                                                
                                                toast({
                                                    title: 'Succès',
                                                    description: "Le code pays a été ajouté à la liste des pays sans TVA"
                                                });
                                            }
                                        } catch (error: any) {
                                            // Erreur inattendue
                                            toast({
                                                title: 'Erreur',
                                                description: error.message || "Une erreur s'est produite lors de l'ajout du code pays à la liste des pays sans TVA",
                                                variant: 'destructive'
                                            });
                                        }
                                    }
                                }}>
                                    Ajouter
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <Card className="border mt-8">
                <Table>
                    <TableHeader  className="bg-neutral-100">
                        <TableRow>
                            <TableHead className="w-1/5">Code</TableHead>
                            <TableHead className="w-4/5">Nom</TableHead>
                            <TableHead className="w-1/5"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            pendingCountriesWithoutTVA ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        <div className="flex justify-center items-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <Spinner variant="circle" size={32} />
                                                <p className="text-sm text-gray-500">Chargement des pays sans TVA...</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                countriesWithoutTVA.items.map((country, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-1/5 text-black">{country.code}</TableCell>
                                        <TableCell className="w-4/5 text-black">{country.name}</TableCell>
                                        <TableCell className="w-1/5 text-black">
                                            <Button variant="outline" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={async () => {
                                                const res = await deleteCodeCountryToListWithoutTVAAction(country.code);
                                                if(res.error) {
                                                    toast({
                                                        title: 'Erreur',
                                                        description: res.error,
                                                        variant: 'destructive'
                                                    });
                                                } else {
                                                    startTransition(() => {
                                                        fetchCountriesWithoutTVA();
                                                        fetchCountriesWithTVA();
                                                    });
                                                    toast({
                                                        title: 'Succès',
                                                        description: "Le code pays a été supprimé de la liste des pays sans TVA"
                                                    });
                                                }
                                            }}>
                                                <Trash />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        }
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}