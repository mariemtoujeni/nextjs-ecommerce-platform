import { Trash2 } from "lucide-react";
import { Heading } from "../ui/heading";
import { QuantitySelector } from "./QuantitySelector";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button, Label } from "../ui";
import { ConfirmButton } from "./ConfirmDeleteFromPanier";
import Link from "next/link";

interface CartProductCardProps {
  imageUrl?: string;
  name: string;
  variants: string;
  price: string;
  quantity: number;
  variant?: 'resume' | 'shipping';
  shipping?: string;
  modelId?: number;
  size?: string;
  productId?: number;
  hasCustomization?: boolean;
  discountedPrice?: number;
  dict: any;
}

export const CartProductCard: React.FC<CartProductCardProps> = ({ imageUrl, name, variants, price, quantity, variant,
                                                                  shipping, modelId, size, productId, hasCustomization, dict, discountedPrice }: CartProductCardProps) => {

  const imgSrc = imageUrl || "https://via.placeholder.com/200x255?text=Image";
  

  const imageClassNames = `object-contain w-full h-full mix-blend-multiply transform transition duration-700 
                         ease-in-out hover:scale-110 opacity-100`;

  return variant === 'resume' ? (
    <div className="flex flex-col w-[300px] last:mr-0 gap-y-2">
      <div className="aspect-[783/1000] bg-neutral-200 relative">
        {/* Customization badge */}
        {hasCustomization && (
          <span className="absolute top-2 left-2 z-10 bg-lime text-xs font-bold px-1 py-0.5">
            {dict.cart.personalized}
          </span>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Trash2 className="absolute top-2 right-2 z-10 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <p className="text-sm mb-4">
              {dict.productCard.retirerQuestion}
            </p>
            <div className="flex justify-end gap-2">
              <PopoverClose asChild>
                <Button variant="outline">
                  {dict.productCard.annuler}
                </Button>
              </PopoverClose>
              <PopoverClose asChild>
                <ConfirmButton modelId={modelId} />
              </PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
        {productId ? (
          <Link href={`/product/${productId}`}>
            <div className="flex items-center justify-center h-full cursor-pointer">
              <img src={imgSrc} alt={name} className={imageClassNames} />
            </div>
          </Link>
        ) : ( <div className="flex items-center justify-center h-full">
                <img src={imgSrc} alt={name} className={imageClassNames} />
              </div> )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-x-2 items-center min-h-[4rem]">
          <Heading heading="5">{name}</Heading>
          <div className="text-base leading-tight text-border">|</div>
          <div className="text-sm text-neutral-500">{variants}</div>
        </div>
        <div className="flex items-center gap-x-2 mt-2">
          {discountedPrice != null ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-base line-through text-neutral-600">
                {price}
              </span>
              <span className="font-bold text-base text-black">
                {(discountedPrice).toFixed(2) + " €"}
              </span>
            </div>
          ) : (
            <span className="font-bold text-base">{price}</span>
          )}
          {typeof modelId === 'number' && (
            <QuantitySelector value={quantity} modelId={modelId} />
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col w-[200px] last:mr-0 gap-y-2">
      <div className="relative aspect-[783/1000] bg-neutral-200 flex items-center justify-center">
        {/* Customization badge */}
        {hasCustomization && (
          <span className="absolute top-2 left-2 z-10 bg-lime text-xs font-bold px-1 py-0.5">
            {dict.cart.personalized}
          </span>
        )}
        {/* Button top-right */}
        { shipping === "24h" ?
        <Label className="absolute font-bold top-2 right-2 z-10 text-xs">
          {dict.productCard.expedition24h}
        </Label> :
        <Label className="absolute font-bold top-2 right-2 z-10 text-xs">
          {dict.productCard.expeditionStandard}
        </Label> 
        }

        {/* Placeholder image */}
        {productId ? (
          <Link href={`/product/${productId}`}>
            <div className="flex items-center justify-center h-full cursor-pointer">
              <img src={imgSrc} alt={name} className={imageClassNames} />
            </div>
          </Link>
        ) : (
          <div className="flex items-center justify-center h-full">
            <img src={imgSrc} alt={name} className={imageClassNames} />
          </div>
        )}

      </div>

      <div className="flex flex-col gap-2 px-3">
      <div className="flex flex-row gap-x-1 items-center min-h-[4rem]">
        <Heading heading="6">{name}</Heading>
        <div className="text-base leading-tight text-border">|</div>
        <div>
          <div className="text-xs text-neutral-500">
            <span className="whitespace-nowrap">{dict.productCard.quantite}: {quantity}</span>
          </div>
          <div className="text-xs text-neutral-500">
            { 
              variants .split(" / ") .filter((val) => /^[A-Z]{1,3}$/.test(val)) .join(" / ") && 
              <span className="whitespace-nowrap">
                {dict.productCard.taille}: { variants .split(" / ") .filter((val) => /^[A-Z]{1,3}$/.test(val)) .join(" / ") }
              </span>
            }
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}; 