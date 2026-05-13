'use client'

import { Heading } from "~/components/ui"
import React, { useState } from "react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { Plus } from "lucide-react";
import { ModalCreateCollectionContent } from "./modal-content-component";
import { ReturnAll } from "@repo/core/types";
import { Collection } from "@repo/core/models";

export interface HeaderComponentProps {
    collections: ReturnAll<Collection>;
}

export const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = ({ collections }) => {
    const [open, setOpen] = useState(false);    
    const [collectionNames, setCollectionNames] = useState<string[]>(collections.items.map((collection) => collection.name));
    return (
        <div className="flex flex-row justify-between w-100">
            <Heading key='page-title' heading={"2"} className="text-gray-700">Gestion des collections</Heading>     
            <Dialog open={open} onOpenChange={(e) => {setOpen(e)}}>
                <DialogTrigger className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2">                    
                    <Plus /> Créer une collection
                </DialogTrigger>
                <ModalCreateCollectionContent open={open} collectionNames={collectionNames} onClose={() => {setOpen(false)}} onAdd={(collection) => {
                    setCollectionNames([...collectionNames, collection.name]);
                    setOpen(false);
                }}/>
            </Dialog>                
        </div>
    )
}