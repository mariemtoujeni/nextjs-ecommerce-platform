'use client'

import { updatePurchaseOrderAction } from "@repo/actions/orders";
import { HeaderComponent } from "~/app/(admin)/products/supplier-orders/(common)/heading-component";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import { useRef, useState, useEffect } from "react";
import { PurchaseOrderLine, PurchaseOrderPresenter, PurchaseOrderStatus } from "@repo/core/models";
import { Card, CardContent, CardHeader, CardTitle, Heading, Input, Progress } from "~/components/ui";
import { BarcodeReader } from "~/components/BarcodeReader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ModelCell } from "~/components/ModelCell";
import noPicture from '~/public/no-picture.jpg';
import { ReturnOne } from "@repo/core/types";

export interface MainPanelComponentProps {
    purchaseOrder?: ReturnOne<PurchaseOrderPresenter>
}

export const MainPanelComponent: React.FunctionComponent<MainPanelComponentProps> = ({purchaseOrder}) => {
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
    }, [purchaseOrder, toast]);

    const [codeBar, setCodeBar] = useState<string>('');
    const [ purchaseOrderLinesToReceive, setPurchaseOrderLinesToReceive ] = useState<PurchaseOrderLine[]>(purchaseOrder?.item.lines ?? []);
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Fonction pour trouver la ligne correspondante au code-barre
    const findLineByBarcode = (barcode: string): PurchaseOrderLine | null => {
        return purchaseOrderLinesToReceive.find(line => 
            line.modelProduct?.codeBar === barcode
        ) || null;
    };

    // Effet pour mettre le focus sur l'input correspondant quand un code-barre est scanné
    useEffect(() => {
        if (codeBar) {
            const correspondingLine = findLineByBarcode(codeBar);
            if (correspondingLine) {
                const inputRef = inputRefs.current[correspondingLine.modelId];
                if (inputRef) {
                    inputRef.focus();
                    inputRef.select(); // Sélectionne le contenu pour faciliter la saisie
                }
            }
        }
    }, [codeBar, purchaseOrderLinesToReceive]);

    return <div className="container">
        <HeaderComponent 
            state="receive"
            purchaseOrder={purchaseOrder?.item}
            onSaveClickedAsDraft={async () => {}}
            onUpdateClicked={async (status: PurchaseOrderStatus) => {
                try {
                    if(purchaseOrder) {                        
                        const statusToUpdate = purchaseOrderLinesToReceive.reduce((acc, line) => acc + (line.receivedQuantity === line.quantity ? 1 : 0), 0) / purchaseOrderLinesToReceive.reduce((acc, line) => acc + 1, 0) === 1 ? PurchaseOrderStatus.RECU : PurchaseOrderStatus.PARTIELLE;                        
                        const updatedPurchaseOrder = await updatePurchaseOrderAction(purchaseOrder?.item.id, {
                            ...purchaseOrder?.item,
                            lines: purchaseOrderLinesToReceive,
                            status: statusToUpdate,
                            deliveryDate: (statusToUpdate === PurchaseOrderStatus.RECU) ? new Date() : purchaseOrder?.item.deliveryDate,
                        }, purchaseOrder?.item);
                        if(updatedPurchaseOrder.error) {
                            throw new Error(updatedPurchaseOrder.error);
                        }
                        // }
                        toast({
                            title: "Commande mise à jour",
                            description: "La commande a été mise à jour avec succès",
                            variant: "default",
                        });
                    }   else {
                        throw new Error("Commande non trouvée");
                    }                    
                } catch (error) {
                    toast({
                        title: "Erreur",
                        description: "Une erreur est survenue lors de la mise à jour de la commande. " + error,
                        variant: "destructive",
                    });
                }
                router.push(`/products/supplier-orders/${purchaseOrder?.item?.id}/receive`);
            }}
        />
        <div className="flex flex-col gap-7 w-full mt-8">
            <Card className="mt-8 w-full">
                <CardHeader>
                    <CardTitle>
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-row justify-between w-full">
                                <Heading heading="3" className="text-gray-700 font-bold">Produits</Heading>
                                <div className="w-1/5 relative">
                                    <Input type="text" value={codeBar || ''} onChange={(e) => setCodeBar(e.target.value)} placeholder="Code barre" className="w-full" />
                                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                        <BarcodeReader 
                                            tooltip 
                                            icon 
                                            onBarcode={(barcode) => {
                                                setCodeBar(barcode);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 w-full mt-2">
                                <Progress value={purchaseOrderLinesToReceive.reduce((acc, line) => acc + (line.receivedQuantity === line.quantity ? 1 : 0), 0) / purchaseOrderLinesToReceive.reduce((acc, line) => acc + 1, 0) * 100} className="w-full" />
                                <span className="text-sm text-gray-500 text-right">{purchaseOrderLinesToReceive.reduce((acc, line) => acc + (line.receivedQuantity === line.quantity ? 1 : 0), 0)} sur {purchaseOrderLinesToReceive.reduce((acc, line) => acc + 1, 0)}</span>
                            </div>
                        </div>
                    </CardTitle>
                    <CardContent>
                        <div className="border rounded-lg w-full mt-4">
                            <Table>
                                <TableHeader className="bg-neutral-100">
                                    <TableRow>
                                        <TableHead>Produit</TableHead>
                                        <TableHead>Code barre</TableHead>
                                        <TableHead>Reçu(s)</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        purchaseOrderLinesToReceive.map((line) => (
                                            <TableRow key={line.modelId}>
                                                <TableCell>
                                                    <ModelCell
                                                        model={
                                                            line.modelProduct
                                                                ? line.modelProduct
                                                                : {
                                                                    name: '',
                                                                    attributs: [],
                                                                    price: 0,
                                                                    image: noPicture.src,
                                                                }
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>{line.modelProduct?.codeBar || ''}</TableCell>
                                                <TableCell>
                                                    <Input 
                                                        ref={(el) => {
                                                            inputRefs.current[line.modelId] = el;
                                                        }}
                                                        type="number" 
                                                        value={line.receivedQuantity} 
                                                        min={0}
                                                        max={line.quantity}
                                                        onChange={(e) => {
                                                            const newPurchaseOrderLinesToReceive = [...purchaseOrderLinesToReceive];
                                                            newPurchaseOrderLinesToReceive[newPurchaseOrderLinesToReceive.indexOf(line)] = {
                                                                ...line,
                                                                receivedQuantity: parseInt(e.target.value)
                                                            };
                                                            setPurchaseOrderLinesToReceive(newPurchaseOrderLinesToReceive);                                                            
                                                        }} 
                                                    />
                                                </TableCell>
                                                <TableCell>{line.quantity}</TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </CardHeader>  
            </Card>
        </div>
    </div>;
}