'use client';
import { applyDiscountAction } from '@repo/actions/cart';
import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { useRouter } from 'next/navigation';

export function AddButton({ dict }: { dict: any }) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    setError(false);

    const promoInput = document.getElementById('promo-code') as HTMLInputElement | null;
    const giftInput = document.getElementById('gift-code') as HTMLInputElement | null;

    const promo = promoInput?.value.trim();
    const gift = giftInput?.value.trim();
    const formData = new FormData();
    if (promo) formData.append('promo-code', promo);
    if (gift) formData.append('gift-code', gift);

    try {
      const result = await applyDiscountAction(formData);
      if (!result) {
        setError(true);
      } else {
        const closeBtn = document.getElementById('discount-dialog-close') as HTMLElement | null;
        closeBtn?.click();
        router.refresh();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center w-[120px]">
      {error && (
        <span className="text-red-600 text-sm mb-1">
          Code invalide
        </span>
      )}
      <Button onClick={handleClick} disabled={isLoading} className="w-full">
        {isLoading ? `${dict.cart.discount.add}...` : dict.cart.discount.add}
      </Button>
    </div>
  );
}
