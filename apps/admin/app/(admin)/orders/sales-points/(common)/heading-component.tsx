'use client'

import { Badge, Button, Card, Heading } from "~/components/ui"
import React from "react";
import { ArrowLeft, RefreshCw, RefreshCwOff, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { ShopPresenter, ShopStatus } from "@repo/core/models";

export interface HeaderComponentProps {
    state : 'list' | 'detail' | 'new',
    shop?: ShopPresenter
    isEditable?: boolean
    onSaveClicked?: () => void
    onOpenClicked?: () => void
    onCloseClicked?: () => void
    onFinalizeClicked?: () => void
    onDuplicateClicked?: () => void
    onPrintRestockingClicked?: () => void
}

export const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = ({state, shop, isEditable, onSaveClicked, onOpenClicked, onCloseClicked, onFinalizeClicked, onDuplicateClicked, onPrintRestockingClicked}) => {
    const router = useRouter();

    return (
        state === 'list' ?
            <div className="flex flex-row justify-between w-100">
                <Heading key='page-title' heading={"2"} className="text-gray-700">Points de vente</Heading>     
                <Button className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2" onClick={() => {
                    router.push("/orders/sales-points/new");
                }}>
                    <Plus /> Ajouter un point de vente
                </Button>
            </div>
        : state === 'detail' ?
            isEditable ?
                <div className="flex flex-row justify-between w-100">
                    <div className="flex flex-row gap-3 items-center h-[26px]">              
                        <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                            router.push(`/orders/sales-points`);
                        }}>                        
                            <ArrowLeft style={{ width: '16px', height: '16px' }}/>
                        </Card>
                        <Heading key='page-title' heading={"2"} className="text-gray-700 mt-3">{shop?.name}</Heading>          
                    </div>
                    <div className="flex flex-row gap-3 items-center h-[26px]">
                        <Button className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2" onClick={() => {
                            onSaveClicked?.();
                        }}>
                            <Save /> Enregistrer
                        </Button>
                        <Button className="flex flex-row items-center px-4 py-1 bg-green-600 text-white rounded-md gap-2" onClick={() => {                            
                            onOpenClicked?.();
                        }}>
                            <RefreshCw /> Ouvrir le point de vente
                        </Button>
                        <Button className="flex flex-row items-center px-4 py-1 bg-red-600 text-white rounded-md gap-2" onClick={() => {
                            onCloseClicked?.();
                        }}>
                            <RefreshCwOff /> Clôturer le point de vente
                        </Button>
                    </div>
                </div>
            :
                <div className="flex flex-row justify-between w-100">
                    <div className="flex flex-row gap-3 items-center h-[26px]">              
                        <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                            router.push(`/orders/sales-points`);
                        }}>                        
                            <ArrowLeft style={{ width: '16px', height: '16px' }}/>
                        </Card>                    
                        <Heading key='page-title' heading={"2"} className="text-gray-700 mt-3">{shop?.name}</Heading>          
                        {
                            shop?.status === ShopStatus.OPEN ? <Badge variant="green" className="ml-2">Ouvert</Badge> : 
                            shop?.status === ShopStatus.CLOSED ? <Badge variant="red" className="ml-2">Fermé</Badge> : 
                                shop?.status === ShopStatus.DRAFT ? <Badge variant="orange" className="ml-2">Brouillon</Badge> : 
                                    shop?.status === ShopStatus.FINALISED ? <Badge variant="gray" className="ml-2">Finalisé</Badge> : 
                                        <></>
                        }          
                    </div>
                    {
                        shop?.status === ShopStatus.OPEN ?
                            <div className="flex flex-row gap-3 items-center h-[26px]">
                                <Button variant="default" size="lg" onClick={(e) => {
                                    e.preventDefault();                       
                                    onFinalizeClicked?.();
                                }}>
                                    Finaliser le point de vente
                                </Button>
                            </div>
                        :
                        <div className="flex flex-row gap-3 items-center h-[26px]">
                            <Button variant="default" size="lg" onClick={(e) => {
                                e.preventDefault();   
                                onDuplicateClicked?.();
                            }}>
                                Dupliquer
                            </Button>
                            <Button variant="default" size="lg" onClick={(e) => {
                                e.preventDefault();   
                                onPrintRestockingClicked?.();
                            }}>
                                Imprimer le re-stock
                            </Button>
                        </div>
                    }
                    
                </div>
        : state === 'new' ?
            <div className="flex flex-row justify-between w-100">
                <div className="flex flex-row gap-3 items-center h-[26px]">
                    <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                        router.push(`/orders/sales-points`);
                    }}>                        
                        <ArrowLeft style={{ width: '16px', height: '16px' }}/>
                    </Card>  
                    <Heading key='page-title' heading={"2"} className="text-gray-700 mt-3">Nouveau point de vente</Heading>
                </div>
                <Button className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2" onClick={() => {
                    onSaveClicked?.();
                }}>
                    <Save /> Enregistrer
                </Button>
            </div>
        :
         <></>
    )
}