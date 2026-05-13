'use client'

import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { Product, ProductWithAdmin } from "@repo/core/models";
import { Button, Label } from "~/components/ui";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "~/components/ui/command";
import { Spinner } from "~/components/Spinner";

export interface ModalAddProductToCollectionProps {    
    products: ProductWithAdmin[];
    onClose: () => void;
    open: boolean;
    onAdd: (product: ProductWithAdmin) => void;
    onSearchRequested: (search: string) => void;
}

export const ModalAddProductToCollection: React.FunctionComponent<ModalAddProductToCollectionProps> = ({ products : initialProducts, onClose, open : openModal, onAdd, onSearchRequested }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<ProductWithAdmin | null>(null);
    const [products, setProducts] = useState<ProductWithAdmin[]>(initialProducts);
    const [isLoading, setIsLoading] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setProducts(initialProducts);
        setIsLoading(false);
    }, [initialProducts]);

    const handleSearch = (searchValue: string) => {
        setIsLoading(true);
        onSearchRequested(searchValue.trim());
    };

    return (
        <DialogContent className="w-[500px] fixed top-[300px]">
            <DialogHeader>
                <DialogTitle>Ajouter un produit à la collection</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-8 pb-5">                
                <div className="flex flex-row gap-5 items-center">
                    <Label htmlFor="product" className="text-right">
                        Produit
                    </Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500"
                            >
                                {value ? value.descriptions[0] && value.descriptions[0].title ? value.descriptions[0].title : value.descriptions[1] && value.descriptions[1].title ? value.descriptions[1].title : '' : 'Sélectionner un produit...'}
                                <ChevronsUpDown className="opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0 max-h-[200px] overflow-y-auto">
                            <Command>
                                <CommandInput placeholder="Rechercher un produit..." className="h-9" onValueChange={(value) => {
                                    if (searchTimeoutRef.current) {
                                        clearTimeout(searchTimeoutRef.current);
                                    }
                                    searchTimeoutRef.current = setTimeout(() => handleSearch(value), 500);
                                }} />
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <Spinner variant="circle" size={24} />
                                            <p className="text-sm text-gray-500">Recherche en cours...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                                        <CommandGroup>
                                            {
                                                products.map((product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        onSelect={(currentValue) => {
                                                            setValue(product);
                                                            onSearchRequested('');
                                                            setOpen(false);
                                                        }}
                                                        className="text-sm"
                                                    >
                                                        {product.descriptions[0] && product.descriptions[0].title ? product.descriptions[0].title : product.descriptions[1] && product.descriptions[1].title ? product.descriptions[1].title : ''}
                                                    </CommandItem>
                                                ))
                                            }
                                        </CommandGroup>
                                    </>
                                )}
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>                 
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Annuler</Button>
                <Button onClick={() => {
                    if(value) {
                        onAdd(value);
                        setValue(null);
                        onClose();
                    }
                }}>Ajouter</Button>
            </DialogFooter>
        </DialogContent>
    )
}