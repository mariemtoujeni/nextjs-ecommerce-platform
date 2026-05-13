'use client'

import { ReturnAll, ReturnOne } from "@repo/core/types";
import { HeaderComponent } from "../(common)/heading-component";
import { PurchaseOrderDetailView } from "../(common)/purchaseOrderDetailView";
import { ModelWithProduct, PaymentMode, PurchaseOrderPresenter, PurchaseOrderPresenterInput, PurchaseOrderStatus, Supplier } from "@repo/core/models";
import { useRouter } from "next/navigation";
import { updatePurchaseOrderAction } from "@repo/actions/orders";
import { useToast } from "~/hooks/use-toast";
import { useRef, useState, useEffect } from "react";

export interface MainPanelComponentProps {
    purchaseOrder?: ReturnOne<PurchaseOrderPresenter>
    suppliers?: ReturnAll<Supplier>
    products?: ReturnAll<ModelWithProduct>
}

export const MainPanelComponent: React.FunctionComponent<MainPanelComponentProps> = ({purchaseOrder, suppliers, products}) => {    
    const router = useRouter();    
    const { toast } = useToast();

    // Move toast calls to useEffect to avoid updating during render
    useEffect(() => {
        if(purchaseOrder && (purchaseOrder.error || !purchaseOrder.item)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération de la commande, erreur : " + (purchaseOrder.error || "Aucune commande trouvée"),
                variant: "destructive",
            });
        }

        if(suppliers && (suppliers.error || !suppliers.items)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération des fournisseurs, erreur : " + (suppliers.error || "Aucun fournisseur trouvé"),
                variant: "destructive",
            });
        }

        if(products && (products.error || !products.items)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération des produits, erreur : " + (products.error || "Aucun produit trouvé"),
                variant: "destructive",
            });
        }
    }, [purchaseOrder, suppliers, products, toast]);

    const edittedPurchaseOrder = useRef<PurchaseOrderPresenterInput>({
        supplierId: purchaseOrder?.item?.supplierId ?? 0,
        paymentMode: purchaseOrder?.item?.paymentMode ?? PaymentMode.CHEQUE,
        createdAt: purchaseOrder?.item?.createdAt ?? new Date(),
        status: purchaseOrder?.item?.status ?? PurchaseOrderStatus.BROUILLON,
        lines: purchaseOrder?.item?.lines ?? [],
    });
    

    return <div className="container">
        <HeaderComponent 
            state="detail"
            purchaseOrder={purchaseOrder?.item}
            onSaveClickedAsDraft={async () => {  
                if (edittedPurchaseOrder.current && purchaseOrder) {
                    try {
                        edittedPurchaseOrder.current = {
                            ...edittedPurchaseOrder.current,
                            status: PurchaseOrderStatus.BROUILLON,
                        }
                        const updatedPurchaseOrder = await updatePurchaseOrderAction(purchaseOrder.item.id, edittedPurchaseOrder.current);
                        if(updatedPurchaseOrder.error && updatedPurchaseOrder.error !== '') {
                            throw Error(updatedPurchaseOrder.error);
                        }
                        toast({
                            title: "Commande mise à jour",
                            description: "La commande a été mise à jour avec succès",
                            variant: "default",
                        });
                        router.refresh();
                    } catch (error) {
                        toast({
                            title: "Erreur lors de la mise à jour de la commande",
                            description: "Une erreur est survenue lors de la mise à jour de la commande: " + error,
                            variant: "destructive",
                        });
                    }
                }
            }}
            onUpdateClicked={async (status: PurchaseOrderStatus) => {
                if (edittedPurchaseOrder.current && purchaseOrder && purchaseOrder.item) {
                    try {
                        edittedPurchaseOrder.current = {
                            ...edittedPurchaseOrder.current,
                            status: status,
                            orderDate: (status === PurchaseOrderStatus.ENVOYEE) ? new Date() : edittedPurchaseOrder.current.orderDate,                            
                        }
                        const updatedPurchaseOrder = await updatePurchaseOrderAction(purchaseOrder.item.id, edittedPurchaseOrder.current);
                        if(updatedPurchaseOrder.error && updatedPurchaseOrder.error !== '') {
                            throw Error(updatedPurchaseOrder.error);
                        }
                        toast({
                            title: "Commande mise à jour",
                            description: "La commande a été mise à jour avec succès",
                            variant: "default",
                        });
                        router.refresh();
                    } catch (error) {
                        toast({
                            title: "Erreur lors de la mise à jour de la commande",
                            description: "Une erreur est survenue lors de la mise à jour de la commande: " + error,
                            variant: "destructive",
                        });
                    }
                }
            }}
        />
        <PurchaseOrderDetailView 
            stateMainComponent="detail"
            purchaseOrder={purchaseOrder?.item} 
            suppliers={suppliers} 
            products={products} 
            onPurchaseOrderChange={async (purchaseOrderToUpdate: PurchaseOrderPresenterInput) => {                
                    edittedPurchaseOrder.current = purchaseOrderToUpdate;                
                }
            }
        />
    </div>
}