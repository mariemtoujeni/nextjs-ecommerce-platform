"use client"
import { Customization } from "@repo/core/models";
import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui";
import { TableRow, TableCell } from "~/components/ui/table";
import { useEffect, useState } from "react";
import { deleteCustomizationAction, updateCustomizationAction } from "@repo/actions/products";
import { useToast } from "~/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useDeferredEffect } from "~/hooks/use-deffered-effect";

export default function CustomizationLine({customization, onDelete}: {customization: Customization, onDelete: (id: number) => void}) {
    const [updateCustomization, setUpdateCustomization] = useState<Customization>(customization);
    const { toast } = useToast();

    const [deleteCustomization, setDeleteCustomization] = useState(false);

    
    useDeferredEffect(() => {
        updateCustomizationAction(updateCustomization)
        .then(success => {
            if(success) {
                toast({
                    title: "Personnalisation mise à jour",
                    description: "La personnalisation a été mise à jour avec succès",
                });
            } else {
                toast({
                    title: "Erreur",
                    description: "La personnalisation n'a pas été mise à jour",
                    variant: "destructive",
                });
            }
        })
    }, [updateCustomization]);

    return (<>
        <Dialog open={deleteCustomization} onOpenChange={setDeleteCustomization}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supprimer la personnalisation</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Êtes-vous sûr de vouloir supprimer la personnalisation ?
                </DialogDescription>
                <DialogFooter>
                    <Button variant="destructive" onClick={() => {
                        setDeleteCustomization(false);
                        deleteCustomizationAction(customization.id)
                        .then(success => {
                            if(success) {
                                toast({
                                    title: "Personnalisation supprimée",
                                    description: "La personnalisation a été supprimée avec succès",
                                });
                                
                                onDelete(customization.id);
                                
                            } else {
                                toast({
                                    title: "Erreur",
                                    description: "La personnalisation n'a pas été supprimée",
                                    variant: "destructive",
                                });
                            }
                        })
                    }}>Supprimer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    <TableRow  className="border-0">
        <TableCell width={"auto"}>
            <Input type="text" defaultValue={updateCustomization.description} onBlur={(e) => setUpdateCustomization({...updateCustomization, description: e.target.value})}/>
        </TableCell>
        <TableCell width={"100"}>
            <Input type="number" defaultValue={updateCustomization.price} onBlur={(e) => setUpdateCustomization({...updateCustomization, price: parseFloat(e.target.value)})} /></TableCell>
        <TableCell className="text-right" width={"50"}><Button variant="destructive" size="icon" onClick={() => setDeleteCustomization(true)}>
            <Trash2 />
        </Button></TableCell>
    </TableRow>
    </>
    )
}