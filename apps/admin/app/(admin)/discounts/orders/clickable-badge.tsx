"use client";

import { Badge } from "~/components/ui";
import { updateDiscountAction } from "@repo/actions/discounts";
import { Discount, DiscountState } from "@repo/core/models";
import { useRouter } from "next/navigation";
import { DiscountStatus } from "../table";

interface Props {
  discount: Discount;
}

export const ClickableBadge: React.FC<Props> = ({ discount }: Props) => {
  const router = useRouter();

  const handleToggle = async () => {
    const newState = discount.etat === DiscountState.ACTIVE ? DiscountState.INACTIVE : DiscountState.ACTIVE;
    
    try {
      await updateDiscountAction({
        ...discount,
        etat: newState
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update discount status:", error);
    }
  };

  return (
    <DiscountStatus discount={discount}/>
    // <Badge size={"md"} variant={discount.etat === DiscountState.ACTIVE ? "green" : "red"} className="cursor-pointer hover:opacity-80 transition-opacity" onClick={handleToggle} >
    //   {discount.etat === DiscountState.ACTIVE ? "Active" : "Inactive"}
    // </Badge>
  );
};