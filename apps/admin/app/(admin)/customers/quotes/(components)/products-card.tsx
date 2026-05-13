'use client';

import { ModelWithProduct, QuotationLine, QuotationPresenter } from "@repo/core/models";
import { useRef, useState } from "react";
import { Card, CardHeader, CardContent, Input, CardTitle, Heading } from "~/components/ui";
import noPicture from "~/public/no-picture.jpg";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { TableSummaryModelsQuotation } from "~/components/TableSummaryModelsQuotation";
import { ReturnAll } from "@repo/core/types";

interface ProductCardProps {
  quotation?: QuotationPresenter;
  quotationLines?: ReturnAll<QuotationLine>;
  isEditable: boolean;
  products?: ModelWithProduct[];
  onSearchProduct: (search: string) => void;
  onAddQuotationLine: (model: ModelWithProduct) => void;
  onUpdateQuotationLine: (line: QuotationLine) => void;
  onDeleteQuotationLine: (modelId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  quotation, 
  quotationLines, 
  isEditable, 
  products,
  onSearchProduct,
  onAddQuotationLine,
  onUpdateQuotationLine,
  onDeleteQuotationLine
}: ProductCardProps) => {
 const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  };

  const handleSearchProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setIsOpen(true);
      const timer = setTimeout(() => {
        onSearchProduct(value);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      onSearchProduct("");
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    setTimeout(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, 100);
  };

  return (
    <Card className="mt-8">
        <CardHeader>
            <CardTitle>
                <Heading heading="3" className="text-gray-700 font-bold">Produits</Heading>
            </CardTitle>
        </CardHeader>
        <CardContent>
                <div className="flex flex-col gap-7">
                        <Popover open={isOpen} onOpenChange={handleOpenChange}>
                            <PopoverTrigger asChild>
                                <div className="w-full">
                                    <Input 
                                        ref={inputRef}
                                        autoFocus
                                        id="name" 
                                        disabled={!isEditable} 
                                        placeholder="Rechercher des produits..." 
                                        className="w-full"
                                        onChange={handleSearchProductInputChange}
                                        onFocus={handleFocus}
                                        onBlur={(e) => {
                                            if (!e.relatedTarget?.closest('[role="dialog"]')) {
                                                setIsOpen(false);
                                            }
                                        }}
                                    />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent 
                                className="w-[--radix-popover-trigger-width] p-4 bg-white z-50 shadow-md rounded-md" 
                                align="start" 
                                sideOffset={5}
                                style={{ maxHeight: '300px', overflow: 'auto' }}
                            >
                                <div className="space-y-4 w-full">
                                    {products?.map((model: ModelWithProduct) => (
                                        <div key={model.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded w-full" onClick={(e) => {
                                            e.stopPropagation();
                                            onAddQuotationLine(model);
                                            setIsOpen(false);
                                        }}>
                                            <img 
                                                src={model.product.images?.[0]?.url ?? noPicture.src} 
                                                alt={model.product.descriptions?.[0]?.title ?? 'Product'} 
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-medium">{model.product.descriptions?.[0]?.title}</p>
                                                <p className="text-sm text-gray-500">{model.priceWithoutVat} €</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <div className="border rounded-lg">                            
                            <TableSummaryModelsQuotation
                                key={quotation?.id} 
                                isEditable={isEditable} 
                                quotationLines={quotationLines}
                                onUpdateQuotationLine={onUpdateQuotationLine}
                                onDeleteQuotationLine={onDeleteQuotationLine}
                            /> 
                        </div>
                </div>
        </CardContent>
    </Card>
  );
};