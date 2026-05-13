import { getDictionary } from "~/app/dictionaries";
import { getCartAction, getUserCartDiscountAction } from "@repo/actions/cart";
import { LangParams } from "~/app/utils";
import { Heading } from "~/components/ui";
import { CartDiscountDialog } from "./CartDiscountDialog";
import { CartProductCard } from "~/components/cart/CartProductCard";
import { CartSummaryFooter } from "~/components/cart/CartSummaryFooter";
import { ReductionValueType } from "@repo/core/models";

export default async function ResumePage(props: { params: Promise<LangParams> }) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);
  const products = await getCartAction();

  if (!products || products.items.length === 0) {
    return (
      <div className="flex flex-col gap-6 md:gap-8 relative pb-24">
        <Heading heading="4">{dict.cart.title}</Heading>
        <p className="text-sm text-gray-500">{dict.cart.noproduct}</p>
      </div>
    );
  }

  const cartDiscount = await getUserCartDiscountAction();

  const discountsByModel = new Map<number, number>();

  let totalWithDiscountCents = 0;
  let totalWithoutDiscountCents = 0;

  for (const p of products.items) {
    const basePrice = p.model.priceWithVat ?? 0; 
    let bestReductionValuePerUnit = 0; 

    if (Array.isArray(cartDiscount.items)) {
      for (const d of cartDiscount.items) {
        try {
          const parsed = JSON.parse(d.info);
          if (parsed.modelId != null && parsed.modelId === p.model.id) {
            let reductionAmount = 0;
            if (d.discountTypeValue === ReductionValueType.MONTANT) {
              reductionAmount = Number(d.value) || 0;
            } else if (d.discountTypeValue === ReductionValueType.PERCENTAGE) {
              reductionAmount = (basePrice * (Number(d.value) || 0)) / 100;
            }
            // clamp to basePrice
            if (reductionAmount > basePrice) reductionAmount = basePrice;
            if (reductionAmount > bestReductionValuePerUnit) {
              bestReductionValuePerUnit = reductionAmount;
            }
          }
        } catch {
          // ignore malformed discount info
        }
      }
    }

    const discountedUnitPrice = Math.max(0, basePrice - bestReductionValuePerUnit);
    discountsByModel.set(p.model.id, discountedUnitPrice);
    totalWithoutDiscountCents += Math.round(basePrice * 100) * p.quantity;
    const lineTotalWithDiscount = basePrice * p.quantity - bestReductionValuePerUnit;
    totalWithDiscountCents += Math.round(Math.max(0, lineTotalWithDiscount) * 100);
  }

  const totalPresenter = (totalWithDiscountCents / 100).toFixed(2) + " €";
  const oldTotalPresenter = (totalWithoutDiscountCents / 100).toFixed(2) + " €";

  return (
    <div className="flex flex-col gap-6 md:gap-8 relative pb-24">
      <div className="flex items-center justify-between">
        <Heading heading="4">{dict.cart.title}</Heading>
        <CartDiscountDialog dict={dict} />
      </div>
      <div className="overflow-x-auto">
        <div className="flex flex-row flex-nowrap gap-2">
          {[...products.items]
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            })
            .map((product) => {
              const discountedPrice = discountsByModel.get(product.model.id);
              return (
                <div key={product.model.id} className="flex flex-col">
                  <CartProductCard
                    imageUrl={ product.model.productDetails.images.find((img) => product.model.attributs.some((attr) => attr.idAttributValue === img.attribute?.id) )?.url ?? product.model.productDetails.images[0]?.url ?? "/images/placeholder/placeholder.svg" }
                    name={ product.model.productDetails.descriptions.find((d) => d.lang === params.lang)?.title ?? "no-name" }
                    variants={product.model.attributs.map((attr) => attr.attributValue.nom).filter(Boolean).join(" / ")}
                    price={product.model.priceWithVat.toFixed(2) + " €"}
                    quantity={product.quantity}
                    variant="resume"
                    modelId={product.model.id}
                    productId={product.model.productId}
                    hasCustomization={product.customization}
                    dict={dict}
                    discountedPrice={discountedPrice}
                  />
                </div>
              );
            })}

          <CartSummaryFooter total={totalPresenter} oldTotal={oldTotalPresenter} step="resume" dict={dict} />
        </div>
      </div>
    </div>
  );
}
