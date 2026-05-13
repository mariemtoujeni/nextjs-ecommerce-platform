"use client";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { generateSlug } from "~/app/[lang]/(main)/product/[slug]/utils/generateSlug";
import { Product } from "@repo/core/models";
import { dictionary } from "~/app/dictionaries";


type ProductCardProps = React.HTMLAttributes<HTMLAnchorElement> & {
  product: Product;
  lang: "fr" | "en";
  translations: dictionary;
  width?: number;
};

export function ProductCard({ className, product, lang, translations, width, ...props }: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const productDescriptionLang = product.descriptions.find(d => d.lang === lang);
  const productDescription = productDescriptionLang 
    ? productDescriptionLang 
    : product.descriptions[0]
      ? product.descriptions[0]
      : {description: "", title: ""};
  const slug = generateSlug({ id: product.id ?? 0, title: productDescription.title });

  const imageToShow =
    isHovered && product.images && product.images.length > 1
      ? product.images[1]
      : product.images[0];
  const handleClick = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastProductListUrl', window.location.pathname);
  }
};

  return (
    <Link
      href={`/${lang}/product/${slug}`}
      onClick={handleClick}
      className={cn("flex flex-col gap-4 justify-stretch p-0 shrink-0", className, width ? `w-[${width}px]` : "")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Image */}
      <div className="aspect-[12/13] overflow-hidden bg-card">
        <img
          src={imageToShow?.url || "/images/placeholder/placeholder.svg"}
          className={`w-full h-full object-contain ${imageToShow?.url ? "mix-blend-multiply" : ""}`}
          alt={productDescription.title}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 bg-white">
        <div className="text-base sm:text-2xl font-bold text-card-foreground leading-none tracking-tight min-h-[4rem]">
          {productDescription.title}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between ">
        <div className="flex items-center gap-2">
          <p className="text-sm sm:text-base text-card-foreground/70 line-through">
            {/*product.oldPrice?.toString() || ""} €*/}
          </p>
          <p className="text-base sm:text-xl  font-bold text-card-foreground">
            {(product.price * (1 + product.vatRate / 100)).toFixed(2) || ""} €
          </p>
        </div>

        <Button
          variant="default"
          size="default"
          hasIcon={true}
          icon={ArrowRight}
          iconPosition="right"
          className="text-sm sm:text-base"
        >
          {translations.product.similarProducts.buy}
        </Button>
      </div>
    </Link>
  );
}
