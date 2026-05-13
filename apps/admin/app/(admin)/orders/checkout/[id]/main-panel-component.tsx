'use client'

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { CheckoutPresenter, CheckoutStatus, Client, CreateCheckoutRequest, ModelWithProduct, Shop } from "@repo/core/models";
import { CheckoutDetailView } from "../(component)/checkout-detail";
import { HeaderComponent } from "../(component)/heading-component";
import { ReturnAll, ReturnOne } from "@repo/core/types";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CheckoutPreviewComponent } from "./checkout-receipe-component";
import { getCheckoutAction, updateCheckoutAction } from "@repo/actions/orders";

export interface MainPanelComponentProps {
    checkout?: ReturnOne<CheckoutPresenter>
    products?: ReturnAll<ModelWithProduct>
    clients?: ReturnAll<Client>
    clubs?: ReturnAll<Client>
    shops?: ReturnAll<Shop>
}

export const MainPanelComponent: React.FunctionComponent<MainPanelComponentProps> = ({checkout : initialCheckout , products, clients, clubs, shops}) => {    
    const router = useRouter();
    const [checkoutToCreate, setCheckoutToCreate] = useState<CreateCheckoutRequest | undefined>(undefined);
    const { toast } = useToast();
    const ref = useRef<HTMLDivElement>(null);
    const initialStateRef = useRef<ReturnOne<CheckoutPresenter>>(initialCheckout ?? { item: null as unknown as CheckoutPresenter, error: undefined });

    const roundToTwo = (num: number) => Math.round(num * 100) / 100;

    const [checkout, fetchCheckout, pending] = useActionState(
        (state: ReturnOne<CheckoutPresenter>, payload: number) => getCheckoutAction(payload), 
        initialStateRef.current
    );

    // Move toast calls to useEffect to avoid updating during render
    useEffect(() => {
        if(checkout && (checkout.error || !checkout.item)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération de ticket de caisse, erreur : " + (checkout.error || "Aucune caisse trouvée"),
                variant: "destructive",
            });
        }
    }, [checkout, toast]);

    const handleDownload = async () => {
        const el = ref.current;
        if (!el) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération la création du PDF",
                variant: "destructive",
            });
            return;
        }
        
        try {
            // Wait for all images to load before capturing
            const images = el.querySelectorAll('img');
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve; // Continue even if image fails to load
                    });
                })
            );
            
            const canvas = await html2canvas(el, { 
                scale: 1,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            // Use toDataURL directly with error handling (JPEG to avoid PNG parse issues)
            let imgData: string;
            try {
                imgData = canvas.toDataURL("image/jpeg", 0.9);
            } catch (error) {
                console.error("Error converting canvas to data URL:", error);
                throw new Error("Failed to convert canvas to image data");
            }
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Facture-${checkout?.item?.client?.clientNumber}-${checkout?.item?.id}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la génération du PDF",
                variant: "destructive",
            });
        }
    };

    return <div className="container flex flex-col gap-4">
        <HeaderComponent 
            checkoutName={checkout && checkout.item && checkout.item.shop.name ? `Ticket de caisse ${checkout.item.shop.name}` : "Caisse"}
            checkoutStatus={checkout ? checkout.item?.status : undefined}
            onSave={async () => {
                if(checkoutToCreate && checkout && checkout?.item) {
                    // checkout 
                    const totalPayments = parseFloat(checkoutToCreate.cbAmount) + parseFloat(checkoutToCreate.cashAmount) + parseFloat(checkoutToCreate.checkAmount);
                    const totalToPay = roundToTwo(parseFloat(checkoutToCreate.totalTTC));

                    if(totalToPay < totalPayments) {
                        toast({
                            title: "Erreur",
                            description: "Montant des paiements supérieur au total TTC",
                            variant: "destructive",
                        });
                        return;
                    }

                    if(totalToPay > totalPayments) {
                        toast({
                            title: "Erreur",
                            description: "Montant des paiements inférieur au total TTC",
                            variant: "destructive",
                        });
                        return;
                    }

                    if(!checkoutToCreate.shop || checkoutToCreate.shop.id === 0) {
                        toast({
                            title: "Erreur",
                            description: "Le magasin est requis",
                            variant: "destructive",
                        });
                        return;
                    }

                    const updatedCheckout = await updateCheckoutAction(checkout?.item.id, checkoutToCreate);
                    if(updatedCheckout.error) {
                        toast({
                            title: "Erreur",
                            description: "Une erreur est survenue lors de la mise à jour du ticket de caisse",
                            variant: "destructive",
                        });
                        return;
                    }
                    if(updatedCheckout.item) {
                        toast({
                            title: "Succès",
                            description: "Le ticket de caisse a été mis à jour avec succès",
                        });
                        startTransition(() => {
                            fetchCheckout(checkout?.item.id);
                        });
                        router.push(`/orders/checkout`);
                    }
                } else {
                    toast({
                        title: "Erreur",
                        description: "Aucune modification à enregistrer",
                        variant: "destructive",
                    });
                }
            }}
            onCancel={() => {
                router.push(`/orders/checkout`);
            }}
            onDelete={() => {}}
            onPrint={() => {
                handleDownload();
            }}
        />
        <CheckoutDetailView
            checkout={checkout && checkout.item ? checkout.item : undefined}
            isNew={false}
            isEditable={checkout === undefined || (checkout && checkout.item?.status === CheckoutStatus.OPEN)}
            products={products}
            onCheckoutToCreateChange={setCheckoutToCreate}
        />
        <CheckoutPreviewComponent ref={ref as React.RefObject<HTMLDivElement>} checkout={checkout && checkout.item ? checkout.item : undefined} />
    </div>
}