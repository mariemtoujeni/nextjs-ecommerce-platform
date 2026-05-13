'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DiscountType, QuotationLine } from "@repo/core/models";
import noPicture from '~/public/no-picture.jpg';
import { Button } from "./ui";
import { Trash2Icon } from "lucide-react";
import { ReturnAll } from "@repo/core/types";

export interface TableModelsProps {
    isEditable: boolean;
    quotationLines?: ReturnAll<QuotationLine>;
    onUpdateQuotationLine: (line: QuotationLine) => void;
    onDeleteQuotationLine: (modelId: number) => void;
}

export const TableSummaryModelsQuotation = ({ isEditable, quotationLines, onUpdateQuotationLine, onDeleteQuotationLine }: TableModelsProps) => {

    const handleLineChange = (line: QuotationLine, field: keyof QuotationLine, value: any) => {
        if (field === 'quantity' && Number(value) <= 0) {
            onDeleteQuotationLine(line.modelId);
        } else {
            onUpdateQuotationLine({ ...line, [field]: value });
        }
    };

    return (
        <Table>
            <TableHeader className="bg-neutral-100">
                <TableRow>
                <TableHead className="w-[40%]">Produit</TableHead>
                <TableHead className="w-[10%]">Quantité</TableHead>
                <TableHead className="w-[10%]">Réduction</TableHead>
                <TableHead className="w-[15%]">Type de remise</TableHead>
                <TableHead className="w-[15%]">Total</TableHead>
                <TableHead className="w-[10%]"></TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
                {quotationLines?.items?.map((line) => {
                    const imageSrc = line.modelProduct?.image ?? noPicture.src;
                    const productName = line.modelProduct?.name ?? 'no-image'
                    const totalLine = line.discountValueType === DiscountType.FIXED ? (line.unitPriceExcludingTax * line.quantity) - (line.quantity * line.discountValue) : (line.unitPriceExcludingTax * line.quantity) - (line.unitPriceExcludingTax * (line.quantity * line.discountValue / 100)) ;

                    return (
                        <TableRow key={line.id}>
                            <TableCell>
                                <div className="flex flex-row gap-4 w-full">
                                    <div className="border rounded-md w-fit h-fit">
                                        <img src={imageSrc} alt={productName} width={58} height={58} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">{productName}</span>
                                        {line.modelProduct?.attributs && line.modelProduct.attributs.length > 0 && (
                                            <div className="flex flex-row gap-1">
                                                {line.modelProduct.attributs.map((attribut, index) => (
                                                    <Badge key={index} variant="blue" size="sm">{attribut}</Badge>
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-sm text-blue-600">{line.unitPriceExcludingTax.toFixed(2)} €</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {isEditable ? (
                                    <Input
                                        type="number"
                                        min={1}
                                        value={line.quantity ?? 1}
                                        onChange={(e) => handleLineChange(line, 'quantity', parseInt(e.target.value))}
                                    />
                                ) : (
                                    <span>{line.quantity}</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {isEditable ? (
                                    <Input
                                        type="number"
                                        min={0}
                                        value={line.discountValue ?? 0}
                                        onChange={(e) => handleLineChange(line, 'discountValue', parseFloat(e.target.value))}
                                    />
                                ) : (
                                    <span>{(line.discountValue || 0).toFixed(2)}</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {isEditable ? (
                                    <Select
                                        value={line.discountValueType || DiscountType.PERCENTAGE}
                                        onValueChange={(value) => handleLineChange(line, 'discountValueType', value as DiscountType)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type de remise" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={DiscountType.PERCENTAGE}>%</SelectItem>
                                            <SelectItem value={DiscountType.FIXED}>€</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span>{line.discountValueType === DiscountType.PERCENTAGE ? "%" : "€"}</span>
                                )}
                            </TableCell>
                            <TableCell>{totalLine.toFixed(2)} €</TableCell>
                            <TableCell>
                                {isEditable && (
                                    <Button variant="destructive" size="icon" onClick={() => onDeleteQuotationLine(line.modelId)}>
                                        <Trash2Icon className="w-4 h-4" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
