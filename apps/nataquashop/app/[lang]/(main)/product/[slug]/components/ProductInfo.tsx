"use client";
import { Customization, Product, ProductPack } from "@repo/core/models";
import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui";
import { StockProduct } from "./StockProduct";
import { dictionary } from "~/app/dictionaries";
import { Personnalization } from "./Personnalization";
import { personnalization } from "../utils/personnalization";
import { useProductSelection } from "./ProductSelectionContext";
import { Cart } from "./Cart";
import PackageProduct from "./PackageProduct";
import { Langs } from "~/app/utils";
import { getBestAutoReduction } from "@repo/actions/discounts";

interface ProductInfoProps {
  product: Product;
  translations: dictionary;
  lang: Langs;
  showTitle?: boolean;
  pack?: ProductPack[];
}

export const ProductInfo = ({ product, translations, pack, lang }: ProductInfoProps) => {
  const { selectedModelId, setSelectedModelId, setCurrentImageUrl } = useProductSelection();
  const [selectedCustomization, setSelectedCustomization] = useState<Customization | null>(null);
  const [modelDiscount, setModelDiscount] = useState<number>(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({});
  const [dynamicPrice, setDynamicPrice] = useState<number>(product.price);
  const [customizationText, setCustomizationText] = useState("");
  const [descriptionPerso, setDescriptionPerso] = useState("");

  useEffect(() => {
    if (product.productAttributes) {
      const defaults: Record<number, number> = {};
      for (const attr of product.productAttributes) {
        if (attr.values?.length && attr.values[0] != null) {
          defaults[attr.id] = attr.values[0].id;
        }
      }
      setSelectedAttributes(defaults);

      if (product.modelAttributs) {
        const selectedValueIds = Object.values(defaults);
        const matchingModel = product.modelAttributs.find((model) => {
          const modelValueIds = model.attributeValues.map((v) => v.id);
          return (
            modelValueIds.length === selectedValueIds.length &&
            selectedValueIds.every((id) => modelValueIds.includes(id))
          );
        });
        if (matchingModel) {
          setSelectedModelId(matchingModel.id);
        }
      }
    }
  }, [product]);

  useEffect(() => {
    if (!product.modelAttributs) return;

    const selectedValueIds = Object.values(selectedAttributes);
    const matchingModel = product.modelAttributs.find((model) => {
      const modelValueIds = model.attributeValues.map((v) => v.id);
      if (modelValueIds.length !== selectedValueIds.length) return false;
      return selectedValueIds.every((id) => modelValueIds.includes(id));
    });

    if (!matchingModel) return;

    setSelectedModelId(matchingModel.id);
    const model = product.modelAttributs.find((m) => m.id === matchingModel.id) ?? null;
    const basePrice = model?.price ?? product.price;
    const personalizationPrice = selectedCustomization?.price ?? 0;
    setDynamicPrice(basePrice + personalizationPrice);

    const colorAttr = product.productAttributes?.find(a => a.name.toLowerCase() === "couleur");
    if (colorAttr && selectedAttributes[colorAttr.id]) {
      const colorImageUrl = product.images.find(
        img => img.attributeValueId === selectedAttributes[colorAttr.id]
      )?.url;
      setCurrentImageUrl(colorImageUrl ?? product.images[0]?.url ?? "");
    }
  }, [selectedAttributes, product, selectedCustomization, setCurrentImageUrl, setSelectedModelId]);

  useEffect(() => {
    async function fetchDiscount() {
      if (!selectedModelId) return;
      try {
        const reduction = await getBestAutoReduction(selectedModelId, 1); 

        setModelDiscount(reduction?.valeur_reduction ?? 0);
      } catch (err) {
        console.error("Failed to fetch discount:", err);
        setModelDiscount(0);
      }
    }
    fetchDiscount();
  }, [selectedModelId]);
  
  const renderStockPersonalizationCart = () => (
    <>
      <div className="mt-[20px]">
        <span className="mt-2 text-[14px] font-semibold">
          <StockProduct
            product={product}
            translations={{
              alertStock: translations.product.similarProducts.alertStock,
              notification: translations.product.similarProducts.notification,
              outStock: translations.product.similarProducts.outStock,
            }}
          />
        </span>
      </div>

      {product.customization && (
        <div className="mt-[20px]">
          <Personnalization
            message={translations.product.similarProducts.personnalization}
            customization={personnalization(product.customizations ?? [])}
            selectedCustomization={selectedCustomization}
            setSelectedCustomization={setSelectedCustomization}
            translations={translations}
            onTextChange={setCustomizationText}
            onDescriptionChange = {setDescriptionPerso}
          />
        </div>
      )}

      <div className="mt-5">
        <Cart
          product={product}
          translations={translations}
          customizationId={selectedCustomization?.id ?? null}
          personnalisationText={customizationText}
          personnalisationType={descriptionPerso}
        />
      </div>
    </>
  );

  if (product.isPackage) {
    return (
      <>
        <p className="mt-[10px]">
          <span className="text-[16px] text-gray">{product.brand.name}</span>{" "}
          <span className="text-[24px] font-bold">{product.price.toFixed(2)} €</span>
        </p>
        <PackageProduct pack={pack} lang={lang} />
        {renderStockPersonalizationCart()}
      </>
    );
  }

  return (
    <>
      <p className="mt-[10px]">
        <span className="text-[16px] text-gray">{product.brand.name}</span>{" "}
        {modelDiscount > 0 ? (
          <>
            <span className="text-[24px] font-bold line-through text-gray-500 mr-2">
              {dynamicPrice.toFixed(2)} €
            </span>
            <span className="text-[24px] font-bold text-red-600">
              {(dynamicPrice - modelDiscount).toFixed(2)} €
            </span>
          </>
        ) : (
          <span className="text-[24px] font-bold">{(dynamicPrice).toFixed(2)} €</span>
        )}
      </p>

      <div className="mt-[20px] space-y-6">
        {product.productAttributes?.map((attribute) => (
          <div key={attribute.id}>
            <p className="font-bold">{attribute.name}</p>
            <div className="flex gap-[10px] mt-[10px] flex-wrap">
              {attribute.values.map((val) => (
                <Button
                  key={val.id}
                  onClick={() => setSelectedAttributes(prev => ({ ...prev, [attribute.id]: val.id }))}
                  className={selectedAttributes[attribute.id] === val.id ? "bg-black text-white" : ""}
                  variant="outline"
                  size="default"
                >
                  {val.name}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {renderStockPersonalizationCart()}
    </>
  );
};
