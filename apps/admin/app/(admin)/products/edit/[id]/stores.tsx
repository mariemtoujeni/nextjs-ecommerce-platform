"use client"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, Button } from "~/components/ui";
import { Store } from "@repo/core/models";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { updateStoresAction } from "@repo/actions/products";
import { toast } from "~/hooks/use-toast";

interface StoresProps {
    stores: Store[];
    productStores: Store[];
    productId?: number;
    onChange?: (selectedStoreIds: number[]) => void; 
}

export default function Stores({ stores, productStores, productId, onChange }: StoresProps) {
    const [selectedStores, setSelectedStores] = useState<Store[]>(productStores);

    const handleUpdate = (updatedStores: Store[]) => {
        setSelectedStores(updatedStores);

        if (productId) {
            updateStoresAction(productId, updatedStores).then(success => {
                toast({
                    title: success ? "Magasins mis à jour" : "Erreur",
                    description: success ? "Les magasins ont été mis à jour avec succès" : "Les magasins n'ont pas été mis à jour",
                    variant: success ? "default" : "destructive"
                });
            });
        } else if (onChange) {
            onChange(updatedStores.map(s => s.id));
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full font-normal flex items-center justify-between px-3">
                    {selectedStores.length === 1
                        ? selectedStores[0]?.name
                        : selectedStores.length > 1
                        ? `${selectedStores.length} magasins sélectionnés`
                        : "Choisir un magasin"
                    }
                    <ChevronDown className="opacity-50" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-full" align="start">
                {stores.map((store) => {
                    const isSelected = selectedStores.some((p) => p.id === store.id);
                    return (
                        <DropdownMenuCheckboxItem
                            key={store.id}
                            checked={isSelected}
                            onCheckedChange={(checked: boolean) => {
                                const updated = checked
                                    ? [...selectedStores, store]
                                    : selectedStores.filter((p) => p.id !== store.id);
                                handleUpdate(updated);
                            }}
                        >
                            {store.name}
                        </DropdownMenuCheckboxItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
