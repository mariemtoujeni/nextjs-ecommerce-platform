'use client'

import { ReturnAll } from "@repo/core/types";
import { HeaderComponent } from "../(common)/heading-component";
import { PurchaseOrderDetailView } from "../(common)/purchaseOrderDetailView";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import { useRef, useState } from "react";
import { ModelWithProduct, PaymentMode, PurchaseOrderPresenter, PurchaseOrderPresenterInput, PurchaseOrderStatus, Supplier } from "@repo/core/models";
import { createPurchaseOrderWithLinesAction } from "@repo/actions/orders/purchase-order";

export interface MainPanelComponentProps {
    suppliers?: ReturnAll<Supplier>
    products?: ReturnAll<ModelWithProduct>
}

export const MainPanelComponent: React.FunctionComponent<MainPanelComponentProps> = ({suppliers, products}) => {    
    const router = useRouter();    
    const { toast } = useToast();
    const [purchaseOrderToCreate, setPurchaseOrderToCreate] = useState<PurchaseOrderPresenterInput>({
        supplierId: 0,
        status: PurchaseOrderStatus.BROUILLON,
        createdAt: new Date(),
        paymentMode: PaymentMode.CHEQUE,
        totalHT: 0,
        lines: []
    });

    return <div className="container">
        <HeaderComponent 
            state="new"
            onSaveClickedAsDraft={async () => {
                try {                    
                    const purchaseOrder = await createPurchaseOrderWithLinesAction(purchaseOrderToCreate);
                    if(purchaseOrder.error) {
                        throw new Error(purchaseOrder.error);
                    }
                    if(!purchaseOrder.item) {
                        throw new Error("Commande non créée");
                    }
                    toast({
                        title: "Commande sauvegardée",
                        description: "La commande a été sauvegardée avec succès",
                        variant: "default",
                    });
                    router.push(`/products/supplier-orders/${purchaseOrder.item.id}`);         
                } catch (error) {
                    toast({
                        title: "Erreur lors de la création de la commande",
                        description: "Une erreur est survenue lors de la création de la commande: " + error,
                        variant: "destructive",
                    });
                }
                
            }}
        />
        <PurchaseOrderDetailView 
            stateMainComponent="new"
            purchaseOrder={purchaseOrderToCreate as PurchaseOrderPresenter} 
            suppliers={suppliers} 
            products={products} 
            onPurchaseOrderChange={async (purchaseOrder: PurchaseOrderPresenterInput) => {
                setPurchaseOrderToCreate(purchaseOrder);
            }}
        />
    </div>
}