'use client'

import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Collection } from "@repo/core/models";
import { useState } from "react";
import { Button, Input, Label } from "~/components/ui";
import { createCollectionAction } from "@repo/actions/collections";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";

export interface ModalCreateCollectionContentProps {    
    open: boolean;
    collectionNames: string[];
    onClose: () => void;
    onAdd: (collection: Collection) => void;
}

export const ModalCreateCollectionContent: React.FunctionComponent<ModalCreateCollectionContentProps> = ({ open, collectionNames, onClose, onAdd }) => { 
    const [collection, setCollection] = useState({} as Collection);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    
    return (
        <DialogContent className="w-[500px] fixed top-[300px]">
            <DialogHeader>
                <DialogTitle>Nouvelle collection</DialogTitle>        
            </DialogHeader>
            <div className="flex flex-col gap-8 py-9">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="name">Nom</Label>                
                    <Input
                        id="name"
                        className="col-span-3 bg-neutral-100 p-2 rounded-lg"
                        value={collection.name || ""}
                        onChange={(e) => {
                            setCollection({ ...collection, name: (e.target as HTMLInputElement).value });
                            setError(null);
                        }}
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
            </div>
            <DialogFooter className="mt-5">
                <Button 
                    variant={'outline'} 
                    size={'lg'}
                    onClick={() => {
                        setError(null);
                        onClose();
                        setCollection({} as Collection);
                    }}
                >Annuler</Button>
                <Button
                    variant="default"
                    size="lg"
                    onClick={async () => {
                        if(collection.name && collection.name.length > 0) {
                            try {
                                if(collectionNames.includes(collection.name)) {                            
                                    throw new Error("Le nom de la collection existe déjà");
                                }
                                const newCollection = await createCollectionAction(collection);
                                if(newCollection.item) {
                                    setError(null);
                                    onAdd(newCollection.item);
                                    onClose();
                                    setCollection({} as Collection);
                                    router.refresh();
                                    toast({
                                        title: 'Succès',
                                        description: "La collection a été ajoutée avec succès"
                                    });
                                } else if(newCollection.error) {
                                    throw new Error("Erreur lors de la création de la collection " + newCollection.error);
                                }                                                                
                            } catch (error) {
                                setError((error as Error).message);                        
                            }
                        } else {
                            setError("Le nom de la collection est requis");
                        }
                    }}
                >
                    Ajouter
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}