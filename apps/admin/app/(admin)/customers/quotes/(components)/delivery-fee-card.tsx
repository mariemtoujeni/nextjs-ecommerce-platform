'use client';

import { OrderDeliveryMode, Quotation, QuotationLine } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui";

interface DeliveryFeeCardProps {
  quotation: Quotation;
  quotationLines?: ReturnAll<QuotationLine>;
  isEditable: boolean;
  onQuotationChange: (quotation: Quotation) => void;
}

export const DeliveryFeeCard: React.FC<DeliveryFeeCardProps> = ({quotation, quotationLines, isEditable, onQuotationChange}: DeliveryFeeCardProps) => {

  const [deliveryFee, setDeliveryFee] = useState(quotation.shippingFees);
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<OrderDeliveryMode>(quotation.deliveryMode);
  const weight = quotationLines?.items.reduce((total, item) => {
    return total + (item.modelProduct?.weight || 0);
  }, 0) || 0;


  const handleShippingFeeChange = (value: number) => {
    setDeliveryFee(value);
    onQuotationChange({
      ...quotation,
      shippingFees: value
    });
  };


  const handleDeliveryModeChange = (value: OrderDeliveryMode) => {
    setSelectedDeliveryMode(value);
    onQuotationChange({
      ...quotation,
      deliveryMode: value
    });
  };


  useEffect(() => {
    setDeliveryFee(quotation.shippingFees);
    setSelectedDeliveryMode(quotation.deliveryMode);
  }, [quotation.shippingFees, quotation.deliveryMode]);

  return (
    <Card>
      <CardHeader className="text-gray-700 font-bold">Frais de livraison</CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col w-full md:w-1/3 space-y-2">
            <Label>Frais de livraison</Label>
            <Input
              placeholder="0.00"
              type="number" min={0}
              value={deliveryFee}
              onChange={(e) => handleShippingFeeChange(Number(e.target.value))}
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-100" : ""}
            />
          </div> 
          <div className="flex flex-col w-full md:w-1/3 space-y-2">
            <Label>Poids des colis</Label>
            <Input 
              placeholder="0g"
              value={`${weight}g`}
              readOnly
              className="bg-gray-100"
            />
          </div>  
          <div className="flex flex-col w-full md:w-1/3 space-y-2">
            <Label>Mode de livraison</Label>
            <Select
              value={selectedDeliveryMode}
              onValueChange={(value) => handleDeliveryModeChange(value as OrderDeliveryMode)}
              disabled={!isEditable}
            >
              <SelectTrigger className={`${!isEditable ? "bg-gray-100" : "bg-muted focus:bg-white"}`}>
                <SelectValue placeholder="Sélectionner un mode" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderDeliveryMode).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode
                      .replaceAll("_", " ")
                      .toLowerCase()
                      .replace(/(^|\s)\S/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};