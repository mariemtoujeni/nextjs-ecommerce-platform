'use client'

import { CollectionDetail, UpdateCollectionDetail } from "@repo/core/usecases";
import { updateCollectionAction, deleteCollectionAction } from "@repo/actions/collections";
import { CollectionDetailView } from "./collection-detail";
import { HeaderComponent } from "./heading-component";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { ReturnAll, ReturnOne } from "@repo/core/types";
import { ProductWithAdmin } from "@repo/core/models";
import { AlertTriangle } from "lucide-react";

export interface MainPanelComponentProps {
    collection: ReturnOne<CollectionDetail>,
    products: ReturnAll<ProductWithAdmin>
}

export const MainPanelComponent: React.FunctionComponent<MainPanelComponentProps> = ({collection, products}) => {
    const router = useRouter();
    const { toast } = useToast();
    
    // Move toast calls to useEffect to avoid updating during render
    useEffect(() => {
        if(collection.error || !collection.item) {
            toast({
                title: "Erreur lors de la récupération de la collection",
                description: "Veuillez réessayer plus tard",
                variant: "destructive"
            });        
        }
    }, [collection.error, collection.item, toast]);
    
    // Vérifier si la collection existe avant de continuer
    if (!collection.item || !collection.item.general) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row items-center gap-2 bg-red-100 p-4 rounded-md w-full">
                        <AlertTriangle className="w-20 h-20 text-red-500" />
                        <p className="text-sm text-red-500">Une erreur est survenue lors de la récupération de la collection, erreur : {collection.error}</p>
                    </div>
                </div>
            </div>
        );
    }
    
    const [collectionDetailToUpdate, setCollectionDetailToUpdate] = useState<UpdateCollectionDetail>({
        general: collection.item.general,
        products: collection.item.products?.items?.map(product => ({
            collectionId: collection.item.general.id,
            productId: product.productId,
            product: product.product
        })) || []
    });   

    return <div className="container">
        <HeaderComponent 
            collectionName={collection.item.general.name}
            onDelete={async () => {
                try {
                    await deleteCollectionAction(collection.item.general.id);
                    toast({
                        title: "Collection supprimée avec succès",
                        description: "La collection a été supprimée avec succès"
                    });
                    router.push(`/settings/collections`);
                } catch (error) {
                    toast({
                        title: "Erreur lors de la suppression de la collection",
                        description: "Veuillez réessayer plus tard",
                        variant: "destructive"
                    });
                }                
            }}
        />
        <CollectionDetailView 
            collection={collection.item} 
            products={products.items}
            onCollectionGeneralInfoChange={async (general) => {                
                try {
                    const newCollectionDetailToUpdate = {
                        ...collectionDetailToUpdate,
                        general: general
                    }                    
                    const result = await updateCollectionAction(collection.item.general.id, newCollectionDetailToUpdate);
                    if(result.error) {
                        throw result.error;
                    }
                    setCollectionDetailToUpdate(newCollectionDetailToUpdate);
                    toast({
                        title: "Collection mise à jour avec succès",
                        description: "La collection a été mise à jour avec succès",
                        variant: "default"
                    });
                } catch (error) {
                    toast({
                        title: "Erreur lors de la mise à jour de la collection",
                        description: error instanceof Error ? `Erreur : ${error.message}` : "Une erreur est survenue, veuillez réessayer plus tard",
                        variant: "destructive"
                    });
                }
                router.refresh();
            }}
            onCollectionProductListChange={async (products) => {
                try {
                    const newCollectionDetailToUpdate = {
                        ...collectionDetailToUpdate,
                        products: products
                    }
                    const result = await updateCollectionAction(collection.item.general.id, newCollectionDetailToUpdate);
                    if(result.error) {
                        throw result.error;
                    }
                    setCollectionDetailToUpdate(newCollectionDetailToUpdate);
                    toast({
                        title: "Collection mise à jour avec succès",
                        description: "La collection a été mise à jour avec succès",
                        variant: "default"
                    });
                } catch (error) {
                    toast({
                        title: "Erreur lors de la mise à jour de la collection",
                        description: error instanceof Error ? `Erreur : ${error.message}` : "Une erreur est survenue, veuillez réessayer plus tard",
                        variant: "destructive"
                    });
                }
                router.refresh();
            }}
        />
    </div>
}