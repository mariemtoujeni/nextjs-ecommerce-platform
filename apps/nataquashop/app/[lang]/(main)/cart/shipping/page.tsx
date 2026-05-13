import { getDictionary } from "~/app/dictionaries";
import CartShippingTable from "./CartShippingPage";
import { getCartAction, getDeliveryCartAction } from "@repo/actions/cart";
import { LangParams } from "~/app/utils";
import { Button } from "~/components/ui";
import { ArrowLeft } from "lucide-react";
import { CartProductCard } from "~/components/cart/CartProductCard";
import Link from "next/link";
import { CartSummaryFooter } from "~/components/cart/CartSummaryFooter";
import DeliveryPrice from "./(components)/DeliveryPrice";
import { DeliveryPriceProvider } from "./(components)/DeliveryPriceContext";
import { ValidationProvider } from "~/components/cart/ValidationContext";
import { DeliveryCart } from "@repo/core/models";

type Props = {
    params: Promise<LangParams>
}

export default async function ShippingPage({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const products = await getCartAction(); 

  let deliveryCart: DeliveryCart | null = null;

  try {
    const result = await getDeliveryCartAction();
    deliveryCart = result.item;
    if (!deliveryCart || !deliveryCart.billingAddressId) {
      console.warn("Delivery cart found but no default address:", deliveryCart);
      deliveryCart = null;
    }
  } catch (error) {
    console.error("Failed to fetch delivery cart:", error);
    deliveryCart = null;
  }

  if (!deliveryCart) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="p-6 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-center">
          {"Aucune adresse par défaut définie"}
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
        <div className="mb-4">
          <Link href={"/cart/resume"}>
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
        </div>
        <ValidationProvider>
        <div className="">
          <DeliveryPriceProvider>          
            
            <CartShippingTable deliveryCart={deliveryCart} dict={dict}/>
            <div>
              <DeliveryPrice dict={dict} />
              <span className="text-sm font-semibold text-muted-foreground mb-1 block">
                {dict.deliveryCart.commandeResume}
              </span>
            </div>
          </DeliveryPriceProvider>
          <div className="mt-6 flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
            <div className="flex flex-wrap gap-2 border border-border w-auto">
              {products.items
                .filter((product) => product.shipping === "24h")
                .map((product) => (
                  <CartProductCard
                    key={product.model.id}
                    imageUrl={ product.model.productDetails.images.find((img) => 
                              product.model.attributs.some((attr) => attr.idAttributValue === img.attribute?.id))?.url ?? product.model.productDetails.images[0]?.url ?? "no-image" }
                    name={product.model.productDetails.descriptions.find((d) => d.lang === lang)?.title ?? "no-name"}
                    variants={product.model.attributs.map((attr) => attr.attributValue.nom).filter(Boolean).join(" / ")}
                    price={(product.model.priceWithVat * product.quantity).toFixed(2) + " €"}
                    quantity={product.quantity}
                    variant="shipping"
                    shipping={product.shipping}
                    productId={product.model.productId}
                    hasCustomization={product.customization}
                    dict={dict}
                  />
                ))}
            </div>
            <div className="flex flex-col gap-2 border border-border">
              {products.items
                .filter((product) => product.shipping !== "24h")
                .map((product) => (
                  <CartProductCard
                    key={product.model.id}
                    imageUrl={ product.model.productDetails.images.find((img) =>
                              product.model.attributs.some((attr) => attr.idAttributValue === img.attribute?.id))?.url ?? product.model.productDetails.images[0]?.url ?? "no-image" }
                    name={product.model.productDetails.descriptions.find((d) => d.lang === lang)?.title ?? "no-name"}
                    variants={product.model.attributs.map((attr) => attr.attributValue.nom).filter(Boolean).join(" / ")}
                    price={(product.model.priceWithVat * product.quantity).toFixed(2) + " €"}
                    quantity={product.quantity}
                    variant="shipping"
                    shipping={product.shipping}
                    productId={product.model.productId}
                    dict={dict}
                  />
                ))}
            </div>
          </div>
        </div>
        <CartSummaryFooter total={deliveryCart.prix.toFixed(2).toString()} step="shipping" dict={dict} deliveryCart={deliveryCart}/>
        </ValidationProvider>
    </div>
  )
}
