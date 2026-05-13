'use client';

import { useEffect, useTransition } from "react";
import { Button } from "../ui";
import { deleteCartUnitAction } from "@repo/actions/cart";
import { useRouter } from "next/navigation";
import { useCart } from "../cart-context";

type ConfirmButtonProps = {
  modelId?: number;
};

export function ConfirmButton({ modelId }: ConfirmButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { syncCartCount } = useCart();
  
  if (!modelId) return;
  const handleClick = () => {
    startTransition(async () => {
      await deleteCartUnitAction(modelId);
      await syncCartCount();
      router.refresh();
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} >
      {isPending ? "En cours..." : "Confirmer"}
    </Button>
  );
}
