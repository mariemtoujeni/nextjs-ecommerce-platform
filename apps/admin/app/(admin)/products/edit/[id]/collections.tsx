"use client"
import { Collection } from "@repo/core/models";
import { ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "~/hooks/use-toast";
import { updateProductCollectionsAction } from "@repo/actions/products";

interface CollectionsProps {
    collections: Collection[];
    productCollections: Collection[];
    productId?: number; 
    onChange?: (selectedCollectionIds: number[]) => void; 
}

export default function Collections({ collections, productCollections, productId, onChange }: CollectionsProps) {
    const [selectedCollections, setSelectedCollections] = useState<Collection[]>(productCollections);

    const handleUpdate = (updatedCollections: Collection[]) => {
        setSelectedCollections(updatedCollections);

        if (productId) {
            updateProductCollectionsAction(productId, updatedCollections.map(c => c.id))
                .then(success => {
                    toast({
                        title: success ? "Collections mises à jour" : "Erreur",
                        description: success ? "Les collections ont été mises à jour avec succès" : "Les collections n'ont pas été mises à jour",
                        variant: success ? "default" : "destructive"
                    });
                });
        } else if (onChange) {
            onChange(updatedCollections.map(c => c.id));
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full font-normal flex items-center justify-between px-3">
                    {selectedCollections.length === 1
                        ? selectedCollections[0]?.name
                        : selectedCollections.length > 1
                        ? `${selectedCollections.length} collections sélectionnées`
                        : "Choisir une collection"
                    }
                    <ChevronDown className="opacity-50" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-full" align="start">
                {collections.map(collection => {
                    const isSelected = selectedCollections.some(c => c.id === collection.id);
                    return (
                        <DropdownMenuCheckboxItem
                            key={collection.id}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                                const updated = checked
                                    ? [...selectedCollections, collection]
                                    : selectedCollections.filter(c => c.id !== collection.id);
                                handleUpdate(updated);
                            }}
                        >
                            {collection.name}
                        </DropdownMenuCheckboxItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
