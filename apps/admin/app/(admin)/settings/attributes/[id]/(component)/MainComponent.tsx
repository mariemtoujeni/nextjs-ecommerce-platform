'use client'

import { deleteAttributeAction, getAttributeAction, updateAttributeAction } from "@repo/actions/attributes";
import { HeaderComponent } from "../(component)/HeaderComponent";
import { GeneralComponent } from "../(component)/GeneralComponent";
import { FilterComponent } from "../(component)/FilterComponent";
import { ValuesListComponent } from "../(component)/ValuesListComponent";
import { startTransition, useActionState, useEffect, useState, useCallback } from "react";
import { AttributDetail } from "@repo/core/models";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ReturnOne } from "@repo/core/types";
import { Spinner } from "~/components/Spinner";

export interface MainComponentProps {
    id: number
}
export const MainComponent: React.FunctionComponent<MainComponentProps> = ({id}) => {
    const { toast } = useToast();
    const router = useRouter();

    const [attributeDetail, fetchAttributeDetail, pending] = useActionState(
        async (_: ReturnOne<AttributDetail>, payload: number) => await getAttributeAction(payload),
        {
            item: null as unknown as AttributDetail,
            error: undefined
        }
    );

    useEffect(() => {
        startTransition(() => {
            fetchAttributeDetail(id);
        });
    }, [id]);

    useEffect(() => {
        if(attributeDetail && (attributeDetail.error || !attributeDetail.item)) {
            toast({
                title: "Erreur lors de la récupération de l'attribut",
                description: "Veuillez réessayer plus tard",
                variant: "destructive"
            });
        }
    }, [attributeDetail, toast]);

    const handleSave = async (attributeDetail : AttributDetail) => {
        try {
            const updateRequest = {
                id: attributeDetail.id,
                name: attributeDetail.name,
                legend: attributeDetail.legend,
                filters: attributeDetail.filters,
                values: attributeDetail.values
            }

            const updatedAttribute = await updateAttributeAction(attributeDetail.id, updateRequest);
            if(updatedAttribute.error) {
                throw updatedAttribute.error;
            } else {
                toast({
                    title: "Attribut mis à jour avec succès",
                    description: `L'attribut ${attributeDetail.name} a été mis à jour avec succès`
                });
            }
            
            startTransition(() => {
                fetchAttributeDetail(id);
            });
        } catch (error) {
            toast({
                title: "Erreur lors de la mise à jour de l'attribut",
                description: "Veuillez réessayer plus tard",
                variant: "destructive"
            });
        }
    }

    // Memoize the callback to prevent infinite loops
    const handleGeneralInfoChanged = useCallback((attribute: AttributDetail) => {
        handleSave(attribute);
    }, []);

    return <div className="flex flex-col gap-5">
        {attributeDetail.item ? (
            <>
                <HeaderComponent 
                    attribute={attributeDetail.item.name ?? ''}
                    onDelete={async () => {
                        try{
                            await deleteAttributeAction(attributeDetail.item);
                            toast({
                                title: "Attribut supprimé avec succès",
                                description: `L'attribut ${attributeDetail.item?.name} a été supprimé avec succès`
                            });
                            router.push('/settings/attributes');
                            router.refresh();
                        } catch (error) {
                            toast({
                                title: "Erreur lors de la suppression de l'attribut",
                                description: "Veuillez réessayer plus tard",
                                variant: "destructive"
                            });
                        }
                    }} 
                />
                <GeneralComponent detail={attributeDetail.item} 
                    onGeneralInfoChanged={handleGeneralInfoChanged}
                />
                <FilterComponent 
                    detail={attributeDetail.item} 
                    onFilterAdded={(filter) => {
                        const attributeDetailToUpdate : AttributDetail = {
                            id: attributeDetail.item.id,
                            name: attributeDetail.item.name,
                            legend: attributeDetail.item.legend,
                            filters: filter.map(f => ({
                                id: f.id,
                                id_attribut: f.id_attribut,
                                nom: f.nom,
                                couleur: f.couleur
                            })),
                            values: attributeDetail.item.values
                        }
                        handleSave(attributeDetailToUpdate);
                    }}
                    onFilterUpdated={(filtersList) => {
                        handleSave({
                            ...attributeDetail.item,
                            filters: filtersList
                        });
                    }}
                    onFilterDeleted={(filtersList) => {
                        handleSave({
                            ...attributeDetail.item,
                            filters: filtersList,
                            values: attributeDetail.item.values.map(v => ({
                                ...v,
                                linkedFilters: v.linkedFilters.filter(f => {
                                    const isPresent = filtersList.some(f2 => f2.id === f.id);
                                    return isPresent;
                                })
                            }))
                        });
                    }}
                />
                <ValuesListComponent 
                    detail={attributeDetail.item}
                    onValueListChanged={(values) => {
                        handleSave({
                            ...attributeDetail.item,
                            values: values
                        });
                        startTransition(() => {
                            fetchAttributeDetail(id);
                        });
                    }}
                />
            </>
        ) : (
            <div className="flex items-center justify-center p-8">
                {pending ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="flex flex-col items-center gap-2">
                            <Spinner variant="circle" size={32} />
                            <p className="text-sm text-gray-500">Chargement de l'attribut...</p>
                        </div>
                    </div>
                ) : attributeDetail.error ? (
                    <div className="text-center text-red-600">
                        <p>Erreur lors du chargement de l'attribut</p>
                        <button 
                            onClick={() => fetchAttributeDetail(id)}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : null}
            </div>
        )}
    </div>
}

