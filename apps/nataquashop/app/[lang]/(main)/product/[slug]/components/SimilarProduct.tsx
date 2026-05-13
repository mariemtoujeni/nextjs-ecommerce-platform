"use client";
import { getProductBySousCategorieAction } from "@repo/actions/products";
import { Product } from "@repo/core/models";
import { useEffect, useState } from "react";
import { dictionary } from "~/app/dictionaries";

import { ProductCard } from "~/components/product-card";
import { Langs } from "~/app/utils";

interface SimilarProductsProps {
  productId: number;
  translations: dictionary;
  lang: Langs;
}

export const SimilarProducts = ({
  productId,
  translations,
  lang
}: SimilarProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getProductBySousCategorieAction(productId);
     
      setProducts(result);
    };
    fetchData();
  }, [productId]);

  return (
<div className=" mx-auto px-4">
  <div className="text-[32px] font-bold mb-4">
    {translations.product.similarProducts.title}
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {products.map((product) => (
      
        <ProductCard 
          product={product} 
          lang={lang} 
          translations={translations} 
          key={product.id}
        />
      
    ))}
  </div>
</div>

  );
};
