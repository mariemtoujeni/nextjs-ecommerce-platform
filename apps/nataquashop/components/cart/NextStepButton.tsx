'use client'

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { CartStep } from './CartSummaryFooter';
import { DeliveryCart, OrderDeliveryMode } from '@repo/core/models';
import { useValidation } from './ValidationContext';

interface NextButtonProps {
  step: CartStep;
  dict: any;
  user_anonymous: boolean;
  deliveryCart?: DeliveryCart;
}

export function NextStepButton({ step, dict, user_anonymous, deliveryCart }: NextButtonProps) {
  const router = useRouter();

  let triggerRelayError = () => {};
  try {
    const validation = useValidation();
    triggerRelayError = validation.triggerRelayError;
  } catch {
    // context not available, just ignore
  }

  const handleClick = () => {
    if (step === 'resume') {
      router.push(user_anonymous ? '/signin?redirect=/cart/shipping' : '/cart/shipping');
      return;
    }

    if (step === 'shipping') {
      if (deliveryCart?.deliveryMode === OrderDeliveryMode.MONDIAL_RELAY && !deliveryCart?.relaisId) {
        triggerRelayError(); 
        return;
      }
      router.push('/cart/payment');
    }
  };

  return (
    <Button className="bg-lime text-black font-bold px-6 py-3 text-base" onClick={handleClick}>
      {step === 'resume'
        ? dict.cart.footer.resume.button
        : step === 'shipping'
        ? dict.cart.footer.shipping.button
        : 'Continue'}
    </Button>
  );
}
