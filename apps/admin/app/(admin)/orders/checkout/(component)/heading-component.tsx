'use client'

import { CheckoutStatus } from "@repo/core/models"
import { ArrowLeft } from "lucide-react"
import { Badge, Button, Card, Heading } from "~/components/ui"

export interface HeaderComponentProps {
    checkoutName: string
    checkoutStatus?: CheckoutStatus
    onDelete: () => void
    onCancel: () => void 
    onSave: () => void
    onPrint: () => void
}

export const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = ({checkoutName, checkoutStatus, onDelete, onCancel, onSave, onPrint}) => {
    return <div className="flex flex-row justify-between w-full">
        <div className="flex flex-row gap-3 items-center h-[26px]">              
            <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                window.location.href = `/orders/checkout`;
            }}>                        
                <ArrowLeft style={{ width: '16px', height: '16px' }}/>
            </Card>                    
            <Heading key='page-title' heading={"2"} className="text-gray-700 mt-3">{checkoutName}</Heading>
            {
                checkoutStatus && checkoutStatus === CheckoutStatus.OPEN ?
                    <Badge variant="green">Ouvert</Badge>
                : checkoutStatus && checkoutStatus === CheckoutStatus.CLOSED ?
                    <Badge variant="red">Fermé</Badge>
                :
                    <></>
            }
        </div>
        {
            !checkoutStatus ?
            <div className="flex flex-row gap-3 items-center h-[26px]">
                <Button variant="outline" size="lg" onClick={(e) => {
                    e.preventDefault();
                    onCancel();
                }}>
                    Annuler
                </Button>
                <Button variant="default" size="lg" onClick={(e) => {
                    e.preventDefault();
                    onSave();
                }}>
                    Valider
                </Button>
            </div>
            : checkoutStatus && checkoutStatus === CheckoutStatus.OPEN ?
                <div className="flex flex-row gap-3 items-center h-[26px]">                    
                    <Button variant="default" className="bg-green-500 hover:bg-green-400" size="lg" onClick={(e) => {
                        e.preventDefault();
                        onSave();
                    }}>
                        Valider
                    </Button>
                    <Button variant="default" size="lg" onClick={(e) => {
                        e.preventDefault();
                        onPrint();
                    }}>
                        Imprimer ticket de caisse
                    </Button>
                </div>
            :
            checkoutStatus && checkoutStatus === CheckoutStatus.CLOSED ?
                <div className="flex flex-row gap-3 items-center h-[26px]">
                    <Button variant="default" size="lg" onClick={(e) => {
                        e.preventDefault();
                        onPrint();
                    }}>
                        Imprimer ticket de caisse
                    </Button>
                </div>
            : <></>
        }
    </div>
}