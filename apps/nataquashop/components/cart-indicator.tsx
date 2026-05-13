'use client';

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui";
import { useCart } from "./cart-context";

export default function CartButton() {
  const { cartCount } = useCart();

  const showCount = cartCount > 0;

  return (
    <Link href="/cart/resume" className="relative">
      <Button variant="ghost" size="icon">
        <ShoppingCart className="h-5 w-5" />
        {showCount && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 h-5 w-5 rounded-full bg-lime text-black text-xs flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
