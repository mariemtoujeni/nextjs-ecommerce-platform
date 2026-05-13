'use client';

import { Client, Club, DiscountType, ModelWithProduct, PaymentMode, PurchaseOrderStatus, Quotation, QuotationDiscount, QuotationDiscountType, QuotationLine, QuotationStatus } from "@repo/core/models";
import { ClientCard } from "./client-card";
import { CommentCard } from "./comment-card";
import { DeliveryFeeCard } from "./delivery-fee-card";
import { DiscountCard } from "./discount-card";
import { InfoCard } from "./info-card";
import { NoteCard } from "./note-card";
import { ProductCard } from "./products-card";
import { SummaryCard } from "./summary-card";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Heading } from "~/components/ui/heading";
import { addQuotationDiscountAction, addQuotationLineAction, deleteQuotationDiscountAction, updateQuotationAction, updateQuotationDiscountAction, updateQuotationLineAction } from "@repo/actions/quotation";
import { ReturnAll } from "@repo/core/types";
import { Card } from "~/components/ui";
import { useState, useTransition } from "react";
import { toast } from "~/hooks/use-toast";
import { createPurchaseOrderAction } from "@repo/actions/orders";
import { getAllClientAction } from "@repo/actions/clients";
import { getAllProductModelsAction } from "@repo/actions/product-models";
import noPicture from '~/public/no-picture.jpg';

interface CardWrapperProps {
  quotation: Quotation;
  quotationLinesProp?: ReturnAll<QuotationLine>;
  quotationDiscountsProp?: ReturnAll<QuotationDiscount>;
  productsProp?: ReturnAll<ModelWithProduct>;
  clientsProp?: ReturnAll<Client>;
}

export const CardWrapper: React.FC<CardWrapperProps> = ({ quotation: initialQuotation, quotationLinesProp, quotationDiscountsProp, productsProp, clientsProp }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [quotation, setQuotation] = useState<Quotation>(initialQuotation);
  const [quotationLines, setQuotationLines] = useState<QuotationLine[]>(quotationLinesProp?.items || []);
  const [quotationDiscounts, setQuotationDiscounts] = useState<QuotationDiscount[]>(quotationDiscountsProp?.items || []);
  const [products, setProducts] = useState<ModelWithProduct[]>(productsProp?.items || []);
  const [clients, setClients] = useState<ReturnAll<Client> | null>(clientsProp || null);
  const [note, setNote] = useState("");

  const isEditable = quotation.status !== QuotationStatus.VALIDE;

  const handleQuotationChange = async (updatedQuotation: Quotation) => {
    try {
      setQuotation(updatedQuotation);
      const result = await updateQuotationAction(updatedQuotation);
      toast({ title: "Succée", description: "devis mis à jour succée." });
    } catch (error) {
      setQuotation(initialQuotation);
      toast({ title: "Erreur", description: "erreur lors de mis à jour." });
    }
  };

  const handleClubChange = async (updatedClub: Club) => {
    try {
      //const result = await updateClubAction(updatedClub);
      toast({ title: "Succée", description: "club mis à jour succée." });
    } catch (error) {
      toast({ title: "Erreur", description: "erreur lors de mis à jour." });
    }
  };

  const handleSearchClient = async (searchTerm: string) => {
    const result = await getAllClientAction({ search: searchTerm, limit: 5 });
    setClients(result);
  };

  const handleSearchProduct = async (search: string) => {
    const result = await getAllProductModelsAction({ sort: 'asc', search });
    setProducts(result.items);
  };

  const handleAddQuotationLine = (model: ModelWithProduct) => {
    startTransition(async () => {
      const existingLine = quotationLines.find(line => line.modelId === model.id);
      if (existingLine) {
        const updatedLine = { ...existingLine, quantity: existingLine.quantity + 1 };
        const result = await updateQuotationLineAction(updatedLine);
        setQuotationLines(quotationLines.map(l => l.id === updatedLine.id ? updatedLine : l));
      } else {
        const newLine = await addQuotationLineAction({
          quotationId: quotation.id,
          modelId: model.id,
          quantity: 1,
          unitPriceExcludingTax: model.priceWithoutVat,
          tva: 20,
          modelProduct: {
            name: model.product.descriptions?.[0]?.title ?? "Product",
            attributs: model.attributValues?.map((attribut) => attribut.attributValue.nom) ?? [],
            image: model.product.images?.[0]?.url ?? noPicture.src,
            price: model.priceWithoutVat,
            weight: model.weight || 0,
          },
          discountType: QuotationDiscountType.CLUB,
          discountValueType: DiscountType.PERCENTAGE,
          barcode: "",
          manufacturerReference: "",
          totalPriceExcludingTax: 0,
          totalPriceIncludingTax: 0,
          giftVoucher: false,
          checkDuration: 0,
          weight: 0,
          comment: "",
          discountValue: 0,
          discountInfo: "",
          available: false,
        });
        if (newLine) {
          setQuotationLines([...quotationLines, newLine]);
        }
      }
    });
  };

  const handleUpdateQuotationLine = (line: QuotationLine) => {
    startTransition(async () => {
      const result = await updateQuotationLineAction(line);
      setQuotationLines(quotationLines.map(l => l.id === line.id ? line : l));
    });
  };

  const handleDeleteQuotationLine = (modelId: number) => {
    startTransition(async () => {
      const lineToDelete = quotationLines.find(line => line.modelId === modelId);
      if (lineToDelete) {
        const result = await updateQuotationLineAction({ ...lineToDelete, quantity: 0 });
        setQuotationLines(quotationLines.filter(l => l.modelId !== modelId));
      }
    });
  };

  const handleAddDiscount = () => {
    startTransition(async () => {
      const newDiscount = await addQuotationDiscountAction({
        quotationId: quotation.id, value: 0, valueType: DiscountType.FIXED, type: QuotationDiscountType.CLUB, info: '',
        discountId: 0
      });
      if(newDiscount) {
        setQuotationDiscounts([...quotationDiscounts, newDiscount]);
      }
    });
  };

  const handleRemoveDiscount = (id: number) => {
    startTransition(async () => {
      const result = await deleteQuotationDiscountAction(id);
      setQuotationDiscounts(quotationDiscounts.filter(d => d.id !== id));
    });
  };

  const handleUpdateDiscount = (id: number, field: keyof QuotationDiscount, value: any) => {
    startTransition(async () => {
      const discount = quotationDiscounts.find(d => d.id === id);
      if (discount) {
        const updatedDiscount = { ...discount, [field]: value };
        const result = await updateQuotationDiscountAction(updatedDiscount);
        setQuotationDiscounts(quotationDiscounts.map(d => d.id === id ? updatedDiscount : d));
      }
    });
  };

  const handleValidateQuotation = async () => {
    try {
      const quotationResult = await updateQuotationAction({ ...quotation, status: QuotationStatus.VALIDE });
      const orderResult = await createPurchaseOrderAction({ 
        status: PurchaseOrderStatus.BROUILLON, 
        supplierId: 0, 
        orderDate: new Date(), 
        paymentMode: PaymentMode.CHEQUE, 
        clubId: 0, 
        deliveryDate: new Date(), 
        validationDate: new Date(), 
        remise: 0, 
        totalHT: 0, 
        valid: false, 
        shippingFees: 0, 
        shippingVAT: 0, 
        paymentDelay: 0, 
        deposit: 0, 
        comment: "" 
      });
      toast({ title: "Succée", description: "devis validé avec succée." });
      router.push("/customers/quotes");
    } catch (error) {
      toast({ title: "Erreur", description: "erreur lors de validation." });
    }
  };

  const calculateSubTotal = () => {
    const subTotal = quotationLines.reduce((acc, line) => {
      const lineTotal = line.unitPriceExcludingTax * line.quantity;
      
      let discountAmount = 0;
      
      if (line.discountValueType === DiscountType.PERCENTAGE) {
        discountAmount = lineTotal * (line.discountValue / 100);
      } else {
        discountAmount = line.discountValue * line.quantity;
      }
      
      return acc + (lineTotal - discountAmount);
    }, 0);

    return subTotal;
  };

  
  return (
    <div className="container w-full">
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-row gap-3 items-center h-[26px]">              
            <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => router.push(`/customers/quotes`)}>
                <ArrowLeft style={{ width: '16px', height: '16px' }}/>
            </Card>                    
            <Heading key='page-title' heading={"2"} className="text-gray-700 mt-3">#{quotation.id}</Heading>
        </div>
        {
            quotation.status === QuotationStatus.VALIDE ?
            <div className="flex flex-row gap-3 items-center h-[26px]">
                <Button variant="outline" size="lg" onClick={() => router.push("/customers/quotes")}>Annuler</Button>
            </div> :
            <div className="flex flex-row gap-3 items-center h-[26px]">
                <Button variant="outline" size="lg" onClick={() => router.push("/customers/quotes")}>Annuler</Button>
                <Button variant="destructive" size="lg" onClick={async () => {
                          await updateQuotationAction({...quotation, status: QuotationStatus.ARCHIVE});
                          router.push("/customers/quotes"); }}>
                    Archiver
                </Button>
            </div>
        }
      </div>

      <div className="flex flex-row gap-7 w-full">
        <div className="w-full md:basis-2/3 space-y-4">
          <ProductCard 
            isEditable={isEditable} 
            products={products}
            quotationLines={{items: quotationLines, count: quotationLines.length, total: quotationLines.length}}
            onSearchProduct={handleSearchProduct}
            onAddQuotationLine={handleAddQuotationLine}
            onUpdateQuotationLine={handleUpdateQuotationLine}
            onDeleteQuotationLine={handleDeleteQuotationLine}
          />
          <DiscountCard 
            discounts={quotationDiscounts}
            isEditable={isEditable}
            onAddDiscount={handleAddDiscount}
            onRemoveDiscount={handleRemoveDiscount}
            onUpdateDiscount={handleUpdateDiscount} 
            subTotal={calculateSubTotal()} />
          <InfoCard quotationClub={quotation.club} onClubChange={handleClubChange} isEditable={isEditable} />
          <DeliveryFeeCard quotation={quotation} onQuotationChange={handleQuotationChange} isEditable={isEditable}/>
          <SummaryCard 
            quotation={quotation} 
            quotationLines={quotationLines} 
            quotationDiscounts={quotationDiscounts} 
            onValidateQuotation={handleValidateQuotation}
            onDownloadQuotation={() => router.push(`/quotation/preview/${quotation.id}`)}
          />
        </div>

        <div className="w-full md:basis-1/3 space-y-4">
          <ClientCard 
            quotation={quotation} 
            onQuotationChange={handleQuotationChange} 
            isEditable={isEditable} 
            clients={clients} 
            onSearchClient={handleSearchClient}
          />
          <NoteCard note={note} onNoteChange={setNote} isEditable={isEditable} />
          <CommentCard quotation={quotation} onQuotationChange={handleQuotationChange} isEditable={isEditable}/>
        </div>
      </div>
    </div>
  );
}