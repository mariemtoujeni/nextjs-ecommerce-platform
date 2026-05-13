'use client'

import { HeaderComponent } from "../(common)/heading-component"
import { Department, ModelWithProduct, ShopStatus } from "@repo/core/models"
import { ReturnAll } from "@repo/core/types"
import { useState, useEffect } from "react"
import { ShopDetailComponent } from "../(common)/shop-detail-component"
import { ShopPresenterWithModels, createShopAction } from "@repo/actions/orders"
import { useToast } from "~/hooks/use-toast"
import { useRouter } from "next/navigation"

export interface MainPanelComponentProps {    
    products: ReturnAll<ModelWithProduct>
}
export const MainPanelComponent: React.FunctionComponent<MainPanelComponentProps> = ({ products: initialProducts }) => {
    const [models, setModels] = useState<ModelWithProduct[]>(initialProducts?.items ?? []);
    const [shop, setShop] = useState<ShopPresenterWithModels>({
        id: 0,
        name: "",
        status: ShopStatus.DRAFT,
        lines: [],
        expirationDate: new Date(),
        isActive: false,
        createdAt: new Date(),
        department: "00",
    });
    const { toast } = useToast();
    
    const router = useRouter();
    
    // Move toast calls to useEffect to avoid updating during render
    useEffect(() => {
        if(initialProducts && (initialProducts.error || !initialProducts.items)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération des modèles, erreur : " + (initialProducts.error || "Aucun modèle trouvé"),
                variant: "destructive",
            });
        }
    }, [initialProducts, toast]);
    return <div>
        <HeaderComponent
            state="new"
            isEditable={true}
            onSaveClicked={async () => {
                try {
                    const newShop = await createShopAction({
                        name: shop.name,
                        isActive: shop.isActive,
                        status: shop.status,
                        department: shop.department as Department,
                        lines: shop.lines
                    }) 
                    if(newShop.error && newShop.error !== '') {
                        throw Error(newShop.error);
                    }
                    if(newShop.item) {
                        setShop(newShop.item);
                    }
                    toast({
                        title: "Point de vente sauvegardé",
                        description: "Le point de vente a été sauvegardé avec succès",
                        variant: "default",
                    });     
                    router.push(`/orders/sales-points/${newShop.item.id}`);
                } catch(error : any) {
                    toast({
                        title: "Erreur",
                        description: "Une erreur est survenue lors de la sauvegarde du point de vente",
                        variant: "destructive",
                    });
                } 
            }}
            onOpenClicked={async () => {
                
            }}
            onCloseClicked={async () => {
                
            }}
        />
        <ShopDetailComponent
            shop={shop}
            initialProducts={initialProducts} 
            models={models}
            isEditable={true}
            onShopChange={setShop}
        />
    </div>
}