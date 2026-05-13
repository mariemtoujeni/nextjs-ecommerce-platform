'use client'

import { useEffect, useState } from "react";
import { Button, Input, Label } from "~/components/ui";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { ColorPicker } from "~/components/color-picker";
import { AttributFilter, FilterRequest } from "@repo/core/models";

export interface CreateFilterModalProps {
    id_attribut: number;
    filter?: AttributFilter;
    onClose: () => void;
    onFilterAdd: (filter: FilterRequest) => void;
    onFilterUpdated: (filter: AttributFilter) => void;
    onFilterDeleted: (filter_id: number) => void;
}

export const CreateFilterModal: React.FunctionComponent<CreateFilterModalProps> = ({ id_attribut, filter, onClose, onFilterAdd, onFilterUpdated, onFilterDeleted }) => {
    const [filterState, setFilterState] = useState<AttributFilter>({
        id: -1,
        id_attribut: id_attribut,
        nom: '',
        couleur: '',
    });
    const [errorFilterName, setErrorFilterName] = useState<boolean>(false);

    useEffect(() => {
        if (filter) {
            setFilterState({
                id: filter.id,
                id_attribut: filter.id_attribut,
                nom: filter.nom,
                couleur: filter.couleur
            });
        }   else {
            setFilterState({
                id: -1,
                id_attribut: id_attribut,
                nom: '',
                couleur: '',
            });
        }
    }, [filter]);

    return <DialogContent aria-describedby="desc-id" className="w-[500px] fixed top-[300px]">
        <DialogHeader>
            <DialogTitle>Ajouter un filtre</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-8 pt-9">
            <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nom</Label>
                <div className="flex flex-col gap-1">
                    <Input 
                        id="name" 
                        className={`bg-neutral-100 p-2 rounded-lg ${errorFilterName ? 'border-red-500 border-2 hover:border-red-500' : 'hover:border-gray-400'}`} 
                        value={filterState.nom} 
                        onChange={(e) => {
                            if (e.target.value.length < 12) {                            
                                setErrorFilterName(false);
                            } else {
                                setErrorFilterName(true);
                            }
                            setFilterState({ ...filterState, nom: e.target.value });
                        }
                    }/>
                    {errorFilterName && <p className="text-red-500 text-sm text-left text-nowrap font-bold">Le nom du filtre ne doit pas dépasser 12 caractères</p>}
                </div>
            </div>
            <div className="flex flex-row gap-2">
                <Label htmlFor="name" className="self-center">Couleur</Label>
                <ColorPicker value={filterState.couleur} onChange={(value) => {
                    setFilterState({ ...filterState, couleur: value });
                }} />
            </div>
        </div>
        <DialogFooter className="mt-5">
            <div className="flex justify-between items-center w-full">
                {filter ? (
                    <Button 
                        variant={'destructive'} 
                        size={'lg'} 
                        onClick={() => {
                            onFilterDeleted(filter.id);
                        }}
                    >
                        Supprimer
                    </Button>
                ) : (
                    <p></p>
                )}
                <div className="flex gap-2">
                <Button 
                    variant={'outline'} 
                    size={'lg'}
                    onClick={() => {
                        onClose();
                        setFilterState({
                            id: -1,
                            id_attribut: id_attribut,
                            nom: '',
                            couleur: '',
                        });
                    }}
                >Annuler</Button>
                <Button 
                    variant={'default'} 
                    size={'lg'}
                    disabled={errorFilterName}
                    onClick={async () => {                           
                        if (filterState.id === -1) {
                            onFilterAdd(filterState); 
                        } else {
                            onFilterUpdated(filterState);
                        }                                                
                        setFilterState({
                            id: -1,
                            id_attribut: id_attribut,
                            nom: '',
                            couleur: '#FFFFFF',
                        });
                    }}>Ajouter</Button>
                    </div>
                </div>
        </DialogFooter>
    </DialogContent>
}