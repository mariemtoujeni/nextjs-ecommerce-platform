'use client'

import { Client, CreateCheckoutRequest, DiscountType, ModelWithProduct, Shop } from "@repo/core/models";
import { createCheckoutAction } from "@repo/actions/orders/checkout";
import { CheckoutDetailView } from "../(component)/checkout-detail";
import { HeaderComponent } from "../(component)/heading-component";
import { ReturnAll } from "@repo/core/types";
import { useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui";
import { AlertTriangle } from "lucide-react";

export interface MainPanelComponentProps {
    products: ReturnAll<ModelWithProduct>
    clients: ReturnAll<Client>
    clubs: ReturnAll<Client>
    shops: ReturnAll<Shop>
}

export const CreateCheckoutComponent: React.FunctionComponent<MainPanelComponentProps> = ({products, clients, clubs, shops}) => {
    const [checkoutToCreate, setCheckoutToCreate] = useState<CreateCheckoutRequest | undefined>(undefined);
    const [displayError, setDisplayError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const roundToTwo = (num: number) => Math.round(num * 100) / 100;

    const router = useRouter();
    const { toast } = useToast();
    return <div className="container w-full">
        <HeaderComponent 
            checkoutName={"Ticket de caisse"}
            onSave={async () => {
                try {
                    if (!checkoutToCreate) {
                        throw new Error("Checkout to create is undefined");
                    }
                    if(parseFloat(checkoutToCreate.totalTTC) <= 0) {
                        throw new Error("Le total TTC doit être supérieur à 0");
                    }
                    const totalPayments = parseFloat(checkoutToCreate.cbAmount) + parseFloat(checkoutToCreate.cashAmount) + parseFloat(checkoutToCreate.checkAmount);                
                    const totalToPay = roundToTwo(parseFloat(checkoutToCreate.totalTTC));
                    
                    if(totalToPay < totalPayments) {
                        throw new Error("Montant des paiements supérieur au total TTC");
                    }
                    if(totalToPay > totalPayments) {
                        throw new Error("Montant des paiements inférieur au total TTC");
                    }

                    if(!checkoutToCreate.shop || checkoutToCreate.shop.id === 0) {
                        throw new Error("Le magasin est requis");
                    }

                    const checkout = await createCheckoutAction(checkoutToCreate);
                    if(checkout.error) {
                        throw new Error(checkout.error);
                    }
                    if(!checkout.item) {
                        throw new Error("Caisse non créée");
                    }
                    toast({
                        title: "Ticket de caisse créé avec succès",
                        description: "Le ticket de caisse a été crée avec succès"
                    });
                    router.push(`/orders/checkout`);
                } catch (error) {
                    setDisplayError(true);
                    setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue, veuillez réessayer plus tard");
                }
            }}
            onCancel={() => {
                router.push(`/orders/checkout`);
            }}
            onDelete={() => {}}
            onPrint={() => {}}
        />
        <Dialog open={displayError} onOpenChange={setDisplayError}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Erreur
                    </DialogTitle>
                    <DialogDescription>
                        {errorMessage}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDisplayError(false)}>
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <CheckoutDetailView 
            isEditable={true} 
            isNew={true}
            products={products} 
            clients={clients} 
            clubs={clubs} 
            shops={shops} 
            onCheckoutToCreateChange={setCheckoutToCreate} 
        />
    </div>
}