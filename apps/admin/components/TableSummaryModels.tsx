"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CheckoutPresenter, CheckoutStatus, CreateCheckoutRequest, DiscountType } from "@repo/core/models";
import noPicture from '~/public/no-picture.jpg';
import { useState, useCallback, useEffect } from "react";
import { Button } from "./ui";
import { Trash2Icon } from "lucide-react";
import { formatNumber } from "@repo/core/types";
import { ModelCell } from "./ModelCell";

export interface TableModelsProps {
    isEditable: boolean;
    checkout?: CheckoutPresenter;
    checkoutToCreate?: CreateCheckoutRequest;
    onCreateCheckoutChange: (checkout: CreateCheckoutRequest) => void;
    onDeleteCheckoutLine: (idModel: number) => void;
}

export const TableSummaryModels = ({isEditable, checkout, checkoutToCreate: defaultCheckout, onCreateCheckoutChange, onDeleteCheckoutLine}: TableModelsProps) => {
    const [checkoutToCreate, setCheckoutToCreate] = useState<CreateCheckoutRequest | undefined>(defaultCheckout);
    
    // Synchroniser l'état local avec les props
    useEffect(() => {
        setCheckoutToCreate(defaultCheckout);
    }, [defaultCheckout]);

    // Fonction optimisée pour calculer les totaux
    const calculateTotals = useCallback((checkout: CreateCheckoutRequest) => {
        const totalWithoutDiscount = checkout.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0;
        const totalDiscountProduct = checkout.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0;
        const totalDiscountGlobal = checkout.discountType === DiscountType.FIXED ? parseFloat(checkout.discountAmount) : (totalWithoutDiscount - totalDiscountProduct) * parseFloat(checkout.discountAmount) / 100;
        const totalTTC = (totalWithoutDiscount - totalDiscountProduct - totalDiscountGlobal).toString();
        const totalWithoutVAT = checkout.lines?.reduce((acc, line) => acc + (line.price * line.quantity - line.price * line.quantity * line.VAT / 100), 0) ?? 0;
        const totalHT = (totalWithoutVAT - totalDiscountProduct - totalDiscountGlobal).toString();
        
        return { totalTTC, totalHT };
    }, []);

    // Fonction optimisée pour mettre à jour le checkout
    const updateCheckout = useCallback((updatedCheckout: CreateCheckoutRequest) => {
        const { totalTTC, totalHT } = calculateTotals(updatedCheckout);
        const finalCheckout = {
            ...updatedCheckout,
            totalTTC,
            totalHT
        };
        setCheckoutToCreate(finalCheckout);
        onCreateCheckoutChange(finalCheckout);
    }, [calculateTotals, onCreateCheckoutChange]);

    // Gestionnaire optimisé pour la quantité
    const handleQuantityChange = useCallback((lineId: number, newQuantity: number) => {
        if (!checkoutToCreate) return;

        let newCheckoutToCreate: CreateCheckoutRequest;
        
        if (newQuantity > 0) {
            newCheckoutToCreate = {
                ...checkoutToCreate,
                lines: checkoutToCreate.lines?.map((l) => l.idModel === lineId ? {
                    ...l,
                    quantity: newQuantity
                } : l)
            };
        } else {
            newCheckoutToCreate = {
                ...checkoutToCreate,
                lines: checkoutToCreate.lines?.filter((l) => l.idModel !== lineId)
            };
        }
        
        updateCheckout(newCheckoutToCreate);
    }, [checkoutToCreate, updateCheckout]);

    // Gestionnaire optimisé pour la réduction
    const handleDiscountChange = useCallback((lineId: number, newDiscount: string) => {
        if (!checkoutToCreate) return;

        let discount = formatNumber(newDiscount);
        
        const newCheckoutToCreate = {
            ...checkoutToCreate,
            lines: checkoutToCreate.lines?.map((l) => l.idModel === lineId ? {
                ...l,
                discount: discount
            } : l)
        };
        
        updateCheckout(newCheckoutToCreate);
    }, [checkoutToCreate, updateCheckout]);

    // Gestionnaire optimisé pour le type de réduction
    const handleDiscountTypeChange = useCallback((lineId: number, newDiscountType: DiscountType) => {
        if (!checkoutToCreate) return;

        const newCheckoutToCreate: CreateCheckoutRequest = {
            ...checkoutToCreate,
            lines: checkoutToCreate.lines?.map((l) => l.idModel === lineId ? {
                ...l,
                discountType: newDiscountType
            } : l)
        };
        
        updateCheckout(newCheckoutToCreate);
    }, [checkoutToCreate, updateCheckout]);

    return <Table>
        <TableHeader className="bg-neutral-100">
            <TableRow>
                <TableHead className="w-[40%]">Produit</TableHead>
                <TableHead className="w-[10%]">Quantité</TableHead>
                <TableHead className="w-[10%]">Réduction</TableHead>
                <TableHead className="w-[15%]">Type de remise</TableHead>
                <TableHead className="w-[15%]">Total HT</TableHead>
                <TableHead className="w-[10%]"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {
            isEditable ?
                checkoutToCreate?.lines?.map((line) => {                    
                    return <TableRow key={line.idModel}>
                        <TableCell>
                            <ModelCell model={line.modelProduct ?? {
                                name: line.name,
                                attributs: [],
                                price: line.price,
                                image: noPicture.src
                            }} />
                        </TableCell>
                        <TableCell>
                            <Input 
                                type="number" 
                                min={0} 
                                value={line.quantity ?? 0} 
                                onChange={(e) => handleQuantityChange(line.idModel, parseInt(e.target.value))}
                            /> 
                        </TableCell>
                        <TableCell>
                            <Input 
                                type="text" 
                                inputMode="decimal"
                                value={line.discount ?? 0}
                                onChange={(e) => handleDiscountChange(line.idModel, e.target.value)}
                                key={`discount-${line.idModel}`}
                            /> 
                        </TableCell>
                        <TableCell>                                                
                            <Select 
                                value={line.discountType} 
                                onValueChange={(value) => handleDiscountTypeChange(line.idModel, value as DiscountType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Type de remise" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={DiscountType.PERCENTAGE}>%</SelectItem>
                                    <SelectItem value={DiscountType.FIXED}>€</SelectItem>
                                </SelectContent>
                            </Select>                                                    
                        </TableCell>
                        <TableCell>{(line.price * line.quantity - (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity)).toFixed(2)} €</TableCell>
                        <TableCell>
                            <Button variant="destructive" size="icon" onClick={() => onDeleteCheckoutLine(line.idModel)}>
                                <Trash2Icon className="w-4 h-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                })
            :
                checkout && checkout.lines?.map((line) => {
                    return <TableRow key={line.id}>
                        <TableCell>
                            <ModelCell model={line.modelProduct ?? {
                                name: line.name,
                                attributs: [],
                                price: line.price,
                                image: noPicture.src
                            }} />
                        </TableCell>
                        <TableCell>                                                     
                            <span>{line.quantity}</span>
                        </TableCell>
                        <TableCell>                                                    
                            <span>{parseFloat(line.discount).toFixed(2)}</span>
                        </TableCell>
                        <TableCell>                                                     
                            <span>{line.discountType === DiscountType.PERCENTAGE ? "%" : "€"}</span>
                        </TableCell>
                        <TableCell>{(line.price * line.quantity - (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity)).toFixed(2)} €</TableCell>
                    </TableRow>
                })}
        </TableBody>
    </Table>
}
