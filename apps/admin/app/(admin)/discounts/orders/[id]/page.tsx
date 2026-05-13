import { Badge, Card, Heading } from "~/components/ui";
import { ArrowLeft } from "lucide-react";
import { getDiscountAction } from "@repo/actions/discounts";
import PrimaryCard from "../../(components)/primary-card";
import { notFound } from "next/navigation";
import DiscountActionButtons from "../action-buttons";
import { ActivationDateCard } from "../../(components)/activation-date-card";
import { DiscountDetailCard } from "../../(components)/discount-detail-card";
import { MaxUsageCard } from "../../(components)/max-usage-card";
import { CombinationCard } from "../../(components)/combination-card";
import { MinConditionCard } from "../../(components)/min-condition-card";
import { SummaryCard } from "../../(components)/summary-card";
import Link from "next/link";
import { ClientTypeCard } from "../../(components)/client-type-card";
import { ClickableBadge } from "../clickable-badge";
import HeadingComponent from "../../(components)/heading-component";

type Props = {
    params: Promise<{ id: string }>;
}

export default async function DiscountOrder({ params }: Props) { 
  const { id } = await params;
  if (!id) { notFound(); }
  const discountResult = await getDiscountAction(Number(id));
  const discountOrder = discountResult.item;
  if (!discountOrder) { notFound(); }

  return (
    <div className="container">
      <HeadingComponent discount={discountOrder} />
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-[2]">
          <PrimaryCard discount={discountOrder}/>
          <ClientTypeCard discount={discountOrder} />
          <MaxUsageCard discount={discountOrder} />
          <CombinationCard discount={discountOrder}/>
          <ActivationDateCard discountOrder={discountOrder}/>
          <DiscountDetailCard discount={discountOrder} />
          <MinConditionCard discount={discountOrder} />
        </div>
        <SummaryCard discount={discountOrder} />
      </div>
    </div>
  );
}
