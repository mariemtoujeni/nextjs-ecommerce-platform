"use client";

import { Router } from "lucide-react";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Checkbox,
  Heading,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui";

export default function SelectProduct() {
  const products = ["Produit 1", "Produit 2", "Produit 3"];
  const [selectedProduct, setSelectedProduct] = useState<string[]>([]);
  const router = useRouter();

  const toggleProduct = (value: string) => {
    setSelectedProduct((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  const [productQuantities, setProductQuantities] = useState<{
    [key: string]: number;
  }>({});

  const handleQuantityChange = (product: string, quantity: string) => {
    setProductQuantities((prev) => ({
      ...prev,
      [product]: parseInt(quantity),
    }));
  };
  return (
    <>
      <div className="mt-5 w-full ">
        {products.map((product) => (
          <div
            key={product}
            className="flex items-center space-x-2 cursor-pointer gap-2 mt-2 bg-graylight h-[80px] px-4 rounded"

          >
            <div className="flex items-center gap-3 flex-1 ml-2">
              <Checkbox
                checked={selectedProduct.includes(product)}
                onCheckedChange={() => toggleProduct(product)}
              />
              <img
                src="/images/product-placeholder.png"
                className="w-10 h-10"
              />
              <span className="bg-graylight rounded">{product}</span>
            </div>
            <div className="w-[100px]">
              <Select
                onValueChange={(value) => handleQuantityChange(product, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Quantité" className="text-black" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((qty) => (
                    <SelectItem key={qty} value={qty.toString()}>
                      {qty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        {selectedProduct.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => router.push("/account/return-products/method")}
              variant="default"
              className="mt-2"
            >
              Valider le retour
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
