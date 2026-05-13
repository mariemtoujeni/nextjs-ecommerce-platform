import { getDiscountAction } from "@repo/actions/discounts";
import PrimaryCard from "../../(components)/primary-card";
import { notFound } from "next/navigation";
import { ActivationDateCard } from "../../(components)/activation-date-card";
import { MaxUsageCard } from "../../(components)/max-usage-card";
import { CombinationCard } from "../../(components)/combination-card";
import { MinConditionCard } from "../../(components)/min-condition-card";
import { SummaryCard } from "../../(components)/summary-card";
import { ClientTypeCard } from "../../(components)/client-type-card";
import { DiscountDetailCard } from "./discount-product-detail";
import { DiscountTypeProduct } from "@repo/core/models";
import { getCategoriesAction } from "@repo/actions/categories";
import { getSubCategoriesAction } from "@repo/actions/subcategories";
import { getBrandsAction } from "@repo/actions/brand";
import { listCollectionsAction } from "@repo/actions/collections";
import HeadingComponent from "../../(components)/heading-component";

type Props = {
    params: Promise<{ id: string }>;
}

export default async function DiscountProduct({ params }: Props) { 
  const { id } = await params;
  if (!id) { notFound(); }
  const discountResult = await getDiscountAction(Number(id));
  const discountProduct = discountResult.item;
  if (!discountProduct) { notFound(); }

  const categories = await getCategoriesAction({limit: 5000});
  const subcategories = await getSubCategoriesAction({limit: 5000});
  const brand = await getBrandsAction({limit: 5000});
  const collections = await listCollectionsAction();
  const options: Record<DiscountTypeProduct, { id: number; label: string }[]> = {
    [DiscountTypeProduct.MODELE]: [],   
    [DiscountTypeProduct.MARQUE]: brand.items.map(b => ({ id: b.id, label: b.name })),       
    [DiscountTypeProduct.SOUS_CATEGORIE]: subcategories.items.map(sc => ({ id: sc.id, label: sc.name })), 
    [DiscountTypeProduct.COLLECTION]: collections.items.map(c => ({ id: c.id, label: c.name })),
    [DiscountTypeProduct.CATEGORIE]: categories.items.map(cat => ({ id: cat.id, label: cat.name })),
    [DiscountTypeProduct.PRODUIT]: [],
    [DiscountTypeProduct.CONDITION_PROMO]: [],
    [DiscountTypeProduct.EN_PROMO]: [],
    [DiscountTypeProduct.EXPEDITION]: []
  };


  return (
    <div className="container">
      <HeadingComponent discount={discountProduct} />
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-[2]">
          <PrimaryCard discount={discountProduct}/>
          <ClientTypeCard discount={discountProduct} />
          <MaxUsageCard discount={discountProduct} />
          <CombinationCard discount={discountProduct}/>
          <ActivationDateCard discountOrder={discountProduct}/>
          <DiscountDetailCard discount={discountProduct} options={options}/> 
          <MinConditionCard discount={discountProduct} />
        </div>
        <SummaryCard discount={discountProduct}  />
      </div>
    </div>
  );
}
