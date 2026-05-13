'use client';

import { Card, Heading } from "~/components/ui";
import { ArrowLeft, Link } from "lucide-react";
import DiscountActionButtons from "../orders/action-buttons";
import { ClickableBadge } from "../orders/clickable-badge";
import { Discount } from "@repo/core/models";

export default function HeadingComponent({discount}: {discount: Discount}) {

  const formatDate = (date: string | Date) => {
    if (!date) return 'Date inconnue'; 
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Date invalide'; 
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', }).format(d);
  };

  const diffDays = (start: string | Date, end: string | Date) => {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const durationText = (start: Date, end: Date) => {
    const days = diffDays(start, end);

    if (days >= 360) return '(1 an)'; 
    if (days >= 28) {
      const months = Math.round(days / 30);
      return months === 1 ? '(1 mois)' : `(${months} mois)`;
    }
    if (days === 7) return '(1 semaine)';
    if (days > 1) return `(${days} jours)`;
    if (days === 1) return '(1 jour)';
    return '';
  };

  return (
      <div className="flex flex-row items-center gap-4 mb-4">
        <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                window.location.href = `/discounts`;
            }}>                        
          <ArrowLeft style={{ width: '16px', height: '16px' }}/>
        </Card>    
        <div>
          <Heading heading="2">#{discount.id}{"  "}<ClickableBadge discount={discount} /></Heading>
          <Heading heading="6">
            Commence le{' '}
            <span className="font-semibold text-blue-600">{formatDate(discount.date_debut)}</span>
            {discount.date_fin && (
              <>
                {' '}et se termine le{' '}
                <span className="font-semibold text-blue-600">{formatDate(discount.date_fin)}</span>{' '}
                <span className="ml-2 font-semibold">{durationText(discount.date_debut, discount.date_fin)}</span>
              </>
            )}
          </Heading>
        </div>
        <DiscountActionButtons discount={discount}/>
      </div>
  );
}
