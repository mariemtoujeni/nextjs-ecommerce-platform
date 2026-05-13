'use client'

import { ArrowLeft, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Button, Card, Heading, Popover, PopoverContent, PopoverTrigger } from "~/components/ui";

export interface HeaderComponentProps {
    collectionName: string
    onDelete: () => void
}

export const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = ({collectionName, onDelete}) => {
    const [openConfirmation, setOpenConfirmation] = useState(false);
    
    return <div className="flex flex-row justify-between w-100">
        <div className="flex flex-row gap-3 items-center h-[26px]">              
            <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                window.location.href = `/settings/collections`;
            }}>                        
                <ArrowLeft style={{ width: '16px', height: '16px' }}/>
            </Card>                    
            <Heading key='page-title' heading={"2"} className="text-gray-700 mt-3">{collectionName}</Heading>
        </div>
        <div className="flex flex-row gap-3 items-center h-[26px]">
            <Popover open={openConfirmation} onOpenChange={setOpenConfirmation}>
                <PopoverTrigger asChild>
                    <Button variant="default" size="lg" className="bg-red-500 hover:bg-red-600">
                        <Trash2 /> Supprimer
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 text-sm text-neutral-700 space-y-4">
                    <p>Êtes-vous sûr de vouloir supprimer cette collection ?</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setOpenConfirmation(false)}>Annuler</Button>
                        <Button variant="destructive" size="sm" onClick={onDelete}>Confirmer</Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>                
    </div>
}