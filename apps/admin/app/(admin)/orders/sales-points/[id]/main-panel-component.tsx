'use client'

import { Department, ModelWithProduct, ShopStatus } from "@repo/core/models"
import { HeaderComponent } from "../(common)/heading-component"
import { ReturnAll, ReturnOne } from "@repo/core/types"
import { useState, useEffect } from "react"
import { closeShopAction, duplicateShopAction, openShopAction, ShopPresenterWithModels, updateShopAction } from "@repo/actions/orders"
import { ShopDetailComponent } from "../(common)/shop-detail-component"
import { useToast } from "~/hooks/use-toast"
import { useRouter } from "next/navigation"


export interface MainPanelComponentProps {
    shop: ReturnOne<ShopPresenterWithModels>
    products?: ReturnAll<ModelWithProduct>
}

export const MainPanelComponent: React.FunctionComponent<MainPanelComponentProps> = ({ shop: initialShop, products: initialProducts }) => {
    const { toast } = useToast();
    const [models, setModels] = useState<ModelWithProduct[]>(initialProducts?.items ?? []);
    const [shop, setShop] = useState<ShopPresenterWithModels>(initialShop.item);
    
    const router = useRouter();
    
    // Move toast calls to useEffect to avoid updating during render
    useEffect(() => {
        if(initialShop && (initialShop.error || !initialShop.item)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération du point de vente, erreur : " + (initialShop.error || "Aucun point de vente trouvé"),
                variant: "destructive",
            });
        }

        if(initialProducts && (initialProducts.error || !initialProducts.items)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération des modèles, erreur : " + (initialProducts.error || "Aucun modèle trouvé"),
                variant: "destructive",
            });
        }
    }, [initialShop, initialProducts, toast]);
    
    return <div>
        <HeaderComponent
            state="detail"
            shop={shop}
            isEditable={
                shop?.status !== ShopStatus.CLOSED &&
                shop?.status !== ShopStatus.FINALISED &&
                shop?.status !== ShopStatus.OPEN
            }
            onSaveClicked={async () => {
                try {                    
                    const updatedShop = await updateShopAction(shop);
                    if(updatedShop.error && updatedShop.error !== '') {
                        throw Error(updatedShop.error);
                    }
                    if(updatedShop.item) {
                        setShop(updatedShop.item);
                    }
                    toast({
                        title: "Point de vente sauvegardé",
                        description: "Le point de vente a été sauvegardé avec succès",
                        variant: "default",
                    });
                } catch (error : any) {
                    toast({
                        title: "Erreur",
                        description: "Une erreur est survenue lors de la sauvegarde du point de vente",
                        variant: "destructive",
                    });
                }
            }}
            onOpenClicked={async () => {
                try {
                    let isShopLinesValid = true;
                    if(shop.lines && shop.lines.length > 0) {
                        shop.lines.forEach(line => {
                            if(line.initialQuantity <= 0) {
                                isShopLinesValid = false;
                            }
                        });
                    }
                    if(!isShopLinesValid) {
                        throw new Error("Certaines lignes du point de vente n'ont pas de quantité initiale");
                    }
                    const updatedShop = await openShopAction(shop);
                    if(updatedShop.error && updatedShop.error !== '') {
                        throw Error(updatedShop.error);
                    }        
                    toast({
                        title: "Point de vente ouvert",
                        description: "Le point de vente a été ouvert avec succès",
                        variant: "default",
                    });                    
                    router.push(`/orders/sales-points`);
                } catch (error : any) {
                    toast({
                        title: "Erreur",
                        description: "Une erreur est survenue lors de l'ouverture du point de vente: " + error.message,
                        variant: "destructive",
                    });
                }
            }}
            onCloseClicked={async () => {
                try {
                    const updatedShop = await updateShopAction({...shop, status: ShopStatus.CLOSED});
                    if(updatedShop.error) {
                        throw new Error(updatedShop.error);
                    }
                    if(updatedShop.item) {
                        setShop(updatedShop.item);
                    }
                    toast({
                        title: "Point de vente fermé",
                        description: "Le point de vente a été fermé avec succès",
                        variant: "default",
                    });
                    router.push(`/orders/sales-points`);
                } catch (error : any) {
                    toast({ 
                        title: "Erreur",
                        description: "Une erreur est survenue lors de la fermeture du point de vente: " + error.message,
                        variant: "destructive",
                    });
                }
            }}
            onFinalizeClicked={async () => {
                try {
                    const updatedShop = await closeShopAction(shop);
                    if(updatedShop.error) {
                        throw new Error(updatedShop.error);
                    }
                    toast({
                        title: "Point de vente clôturé",
                        description: "Le point de vente a été clôturé avec succès",
                        variant: "default",
                    });
                    router.push(`/orders/sales-points`);
                } catch (error : any) {
                    toast({
                        title: "Erreur",
                        description: "Une erreur est survenue lors de la clôture du point de vente: " + error.message,
                        variant: "destructive",
                    });
                }
            }}
            onDuplicateClicked={async () => {
                try {
                    const duplicatedShop = await duplicateShopAction({
                        name: "Copie de " + shop.name,
                        status: shop.status,
                        expirationDate: shop.expirationDate ? new Date(shop.expirationDate).toISOString() : undefined,
                        isActive: shop.isActive,
                        department: shop.department as Department,
                        lines: shop.lines.map((line) => ({
                            idModel: line.idModel,
                            idShop: line.idShop,
                            initialQuantity: line.finalQuantity,
                            soldQuantity: 0,
                            finalQuantity: 0,
                            totalPriceTTC: 0
                        }))
                    });
                    if(duplicatedShop.error) {
                        throw new Error(duplicatedShop.error);
                    }
                    if(duplicatedShop.item) {
                        setShop(duplicatedShop.item);
                    }
                    toast({
                        title: "Point de vente dupliqué",
                        description: "Le point de vente a été dupliqué avec succès",
                        variant: "default",
                    });
                    router.push(`/orders/sales-points/${duplicatedShop.item.id}`);
                } catch (error : any) {
                    toast({
                        title: "Erreur",
                        description: "Une erreur est survenue lors de la duplication du point de vente: " + error.message,
                        variant: "destructive",
                    });
                }
            }}
            onPrintRestockingClicked={() => {
                router.push(`/orders/sales-points/${shop.id}/preview`);
            }}            
        />
        <ShopDetailComponent 
            shop={shop} 
            initialProducts={initialProducts} 
            models={models} 
            isEditable={shop?.status !== ShopStatus.CLOSED && shop?.status !== ShopStatus.FINALISED && shop?.status !== ShopStatus.OPEN} 
            onShopChange={(newShop) => {
                setShop(newShop);
            }}
        />
    </div>
}