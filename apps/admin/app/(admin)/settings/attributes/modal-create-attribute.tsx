'use client'

import { useState } from "react";
import { Button, Input, Label } from "~/components/ui";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { WYSIWYG } from '~/components/wysiwyg';
import React from 'react';
import { addAttributeAction } from "@repo/actions/attributes";
import { CreateAttributDetailRequest } from "@repo/core/models";
import { useToast } from "~/hooks/use-toast";

export interface ModalCreateAttributeContentProps {
    onClose: () => void;
}

export const ModalCreateAttributeContent: React.FunctionComponent<ModalCreateAttributeContentProps> = ({ onClose }) => {
    const { toast } = useToast();
    const [attribute, setAttribute] = useState<CreateAttributDetailRequest>({
        name: '',
        legend: '',
        filters: [],
        values: []
    });

    const handleAddAttribute = async () => {
        try {
            await addAttributeAction(attribute);
            onClose();
            toast({
                title: "Succès",
                description: "L'attribut a été créé avec succès",
                variant: "default"
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la création de l'attribut",
                variant: "destructive"
            });
        }
    }

    return <DialogContent className="w-[66.666667vw] max-w-[1200px] fixed top-[350px]">
        <DialogHeader>
            <DialogTitle>Créer un attribut</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-8 pt-9">
            <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nom</Label>
                <Input 
                    id="name" 
                    className="bg-neutral-100 p-2 rounded-lg" 
                    value={attribute.name}
                    onChange={(e) => setAttribute({ ...attribute, name: e.target.value })}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="legende">Légende</Label>
                <WYSIWYG content={attribute.legend} onChange={(content) => {
                    setAttribute({ ...attribute, legend: content });
                }} />
            </div>
        </div>
        <DialogFooter className="mt-5">
            <Button 
                variant={'outline'} 
                size={'lg'}
                onClick={() => {
                    onClose();
                }}
            >Annuler</Button>
            <Button 
                variant={'default'} 
                size={'lg'}
                onClick={async () => {            
                    await handleAddAttribute();
                }}            
            >Ajouter</Button>
        </DialogFooter>
    </DialogContent>
}