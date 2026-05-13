'use client'
import { Badge, Button, Card, Heading, Popover, PopoverContent, PopoverTrigger } from "~/components/ui";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { PurchaseOrderPresenter, PurchaseOrderStatus } from "@repo/core/models";
import { useEffect, useState } from "react";
import { ActiveFilter, GenericFilter } from "@repo/core/types";

export interface HeaderComponentProps {
    state : 'list' | 'detail' | 'new' | 'receive',
    purchaseOrder?: PurchaseOrderPresenter,
    onSaveClickedAsDraft?: () => void,
    onUpdateClicked?: (status: PurchaseOrderStatus) => void
}

export const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = ({state, purchaseOrder: initialPurchaseOrder, onSaveClickedAsDraft, onUpdateClicked}) => {
    const router = useRouter();
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderPresenter | null>(initialPurchaseOrder ?? null);  
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    
    useEffect(() => {
        setPurchaseOrder(initialPurchaseOrder ?? null);
    }, [initialPurchaseOrder]);
    
    return (
        state === 'list' ? (
            <div className="flex flex-row justify-between w-100">
                <Heading heading="2">Commandes fournisseur</Heading>
                <Button
                    className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2"
                    onClick={() => {
                        router.push("/products/supplier-orders/new");
                    }}
                >
                    <Plus /> Créer un bon de commande
                </Button>
            </div>
        ) : state === 'detail' ? (
            <div className="flex flex-row justify-between w-100">
                <div className="flex flex-row gap-3 items-center h-[26px]">
                    <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                        router.push(`/products/supplier-orders`);
                    }}>                        
                        <ArrowLeft style={{ width: '16px', height: '16px' }}/>
                    </Card>
                    <Heading heading="2" className="text-gray-700 mt-3">{`${purchaseOrder?.supplier?.name} - #${purchaseOrder?.id}`}</Heading>
                    {
                        purchaseOrder?.status === PurchaseOrderStatus.BROUILLON ?
                            <Badge variant="gray" className="ml-2 mt-1">Brouillon</Badge>
                        : purchaseOrder?.status === PurchaseOrderStatus.PARTIELLE ?
                            <Badge variant="orange" className="ml-2 mt-1">Partielle</Badge>
                        : purchaseOrder?.status === PurchaseOrderStatus.ENVOYEE ?
                            <Badge variant="blue" className="ml-2 mt-1">Commandée</Badge>
                        : purchaseOrder?.status === PurchaseOrderStatus.RECU ?
                            <Badge variant="green" className="ml-2 mt-1">Récupérée</Badge>
                        : purchaseOrder?.status === PurchaseOrderStatus.ANNULEE ?
                            <Badge variant="gray" className="ml-2 mt-1">Annulée</Badge>
                        :
                            <></>
                    }
                </div>
                <div className="flex flex-row gap-3 items-center h-[26px]">
                    {
                        purchaseOrder?.status === PurchaseOrderStatus.BROUILLON ?
                            <div className="flex flex-row gap-3 items-center h-[26px]">
                                <Button variant="default" onClick={() => {
                                    onUpdateClicked?.(PurchaseOrderStatus.ENVOYEE);
                                }}>
                                    Marquer comme commandée
                                </Button>
                                <Button variant="default" onClick={() => {
                                    onUpdateClicked?.(PurchaseOrderStatus.BROUILLON);
                                }}>
                                    Enregistrer
                                </Button>
                                <Popover open={openConfirmation} onOpenChange={setOpenConfirmation}>
                                    <PopoverTrigger asChild>
                                        <Button variant="destructive" onClick={() => {
                                            setOpenConfirmation(true);
                                        }}>
                                            Annuler la commande
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 text-sm text-neutral-700 space-y-4">
                                        <p>Êtes-vous sûr de vouloir annuler cette commande ?</p>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setOpenConfirmation(false)}>Annuler</Button>
                                            <Button variant="destructive" size="sm" onClick={() => {
                                                onUpdateClicked?.(PurchaseOrderStatus.ANNULEE);
                                                setOpenConfirmation(false);
                                            }}>Confirmer</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        :
                        purchaseOrder?.status === PurchaseOrderStatus.ENVOYEE ?
                            <div className="flex flex-row gap-3 items-center h-[26px]">
                            <Button variant="default" onClick={() => {
                                onUpdateClicked?.(PurchaseOrderStatus.PARTIELLE);
                                router.push(`/products/supplier-orders/${purchaseOrder?.id}/receive`);
                                }}>
                                    Recevoir le stock
                                </Button>
                                <Popover open={openConfirmation} onOpenChange={setOpenConfirmation}>
                                    <PopoverTrigger asChild>
                                        <Button variant="destructive" onClick={() => {
                                            setOpenConfirmation(true);
                                        }}>
                                            Annuler la commande
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 text-sm text-neutral-700 space-y-4">
                                        <p>Êtes-vous sûr de vouloir annuler cette commande ?</p>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setOpenConfirmation(false)}>Annuler</Button>
                                            <Button variant="destructive" size="sm" onClick={() => {
                                                onUpdateClicked?.(PurchaseOrderStatus.ANNULEE);
                                                setOpenConfirmation(false);
                                            }}>Confirmer</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        :
                        purchaseOrder?.status === PurchaseOrderStatus.PARTIELLE ?
                            <div className="flex flex-row gap-3 items-center h-[26px]">
                                <Button variant="default" onClick={() => {
                                    onUpdateClicked?.(PurchaseOrderStatus.PARTIELLE);
                                }}>
                                    Enregistrer
                                </Button>
                                <Button variant="default" onClick={() => {
                                    onUpdateClicked?.(PurchaseOrderStatus.RECU);
                                }}>
                                    Marquer comme récupérée
                                </Button>
                                <Popover open={openConfirmation} onOpenChange={setOpenConfirmation}>
                                    <PopoverTrigger asChild>
                                        <Button variant="destructive" onClick={() => {
                                            setOpenConfirmation(true);
                                        }}>
                                            Annuler la commande
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 text-sm text-neutral-700 space-y-4">
                                        <p>Êtes-vous sûr de vouloir annuler cette commande ?</p>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setOpenConfirmation(false)}>Annuler</Button>
                                            <Button variant="destructive" size="sm" onClick={() => {
                                                onUpdateClicked?.(PurchaseOrderStatus.ANNULEE);
                                                setOpenConfirmation(false);
                                            }}>Confirmer</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        :
                            <></>

                    }
                </div>
            </div>
        ) : state === 'new' ? (
            <div className="flex flex-row justify-between w-100">
                <div className="flex flex-row gap-3 items-center h-[26px]">
                    <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                        router.push(`/products/supplier-orders`);
                    }}>                        
                        <ArrowLeft style={{ width: '16px', height: '16px' }}/>
                    </Card> 
                    <Heading heading="2" className="text-gray-700 mt-3">Créer un bon de commande</Heading>
                    <Badge variant="gray" className="ml-2 mt-1">Brouillon</Badge>
                </div>
                <div className="flex flex-row gap-3 items-center h-[26px]">
                    <Button variant="outline" onClick={() => {
                        setPurchaseOrder(null);
                        router.push(`/products/supplier-orders`);
                    }}>
                        Annuler
                    </Button>
                    <Button
                        className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2"
                        onClick={() => {
                            onSaveClickedAsDraft?.();
                        }}
                    >
                        Enregistrer en brouillon
                    </Button>
                </div>
            </div>
        ) : state === 'receive' ? (
            <div className="flex flex-row justify-between w-100">
                <div className="flex flex-row gap-3 items-center h-[26px]">
                    <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                        router.push(`/products/supplier-orders`);
                    }}>                        
                        <ArrowLeft style={{ width: '16px', height: '16px' }}/>
                    </Card> 
                    <div className="flex flex-col mt-4">
                        <Heading heading="2" className="text-gray-700">Recevoir des articles</Heading>
                        <span className="text-gray-500 text-xs">
                            {`${purchaseOrder?.supplier?.name} - #${purchaseOrder?.id}`}
                        </span>
                    </div>
                </div>
                {
                    purchaseOrder?.status === PurchaseOrderStatus.PARTIELLE ?
                        <div className="flex flex-row gap-3 items-center h-[26px]">
                            <Button variant="default" onClick={() => {
                                onUpdateClicked?.(PurchaseOrderStatus.RECU);
                            }}>
                                Marquer comme récupérée
                            </Button>
                            <Button variant="default" onClick={() => {
                                onUpdateClicked?.(PurchaseOrderStatus.PARTIELLE);
                            }}>
                                Enregistrer
                            </Button>
                        </div>
                    :
                        <></>
                }
                
            </div>
        ) : null
    );
}