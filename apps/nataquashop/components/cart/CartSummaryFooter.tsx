import React from "react";
import { NextStepButton } from "./NextStepButton";
import { getUserAction } from "@repo/actions/auth";
import { DeliveryCart } from "@repo/core/models";
import { ValidationProvider } from "./ValidationContext";
export type CartStep = 'resume' | 'shipping' | 'payment';

interface CartSummaryFooterProps {
  total: string;
  oldTotal?: string;
  step: CartStep;
  formData?: FormData;
  dict: any;
  deliveryCart?: DeliveryCart;
  paymentMethod?: string;
}

export const CartSummaryFooter: React.FC<CartSummaryFooterProps> = async ({ total, oldTotal, step, dict, formData, deliveryCart, paymentMethod }) => {
  const user = await getUserAction();

  const getStepContent = () => {
    switch (step) {
      case 'resume':
        return (
          <>
            <div>
              {oldTotal !== total ? (
                <span className="mr-2 text-sm text-gray-500 line-through">{oldTotal}</span>
              ) : null}
              <span>{dict.cart.footer.resume.total.replace('{total}', total)}</span>
            </div>
            <span className="block text-xs font-normal text-black/60">{dict.cart.footer.resume.vatIncluded}</span>
          </>
        );
      case 'shipping':
        return (
          <span className="text-xs font-normal text-black/60 line-clamp-2 max-w-[400px]">{dict.cart.footer.shipping.text}</span>
        );
      case 'payment':
        return (
          <span className="text-xs font-normal text-black/60 line-clamp-2 max-w-[400px]">{dict.cart.footer.payment.text}</span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-neutral-200 shadow-lg z-50">        
      
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-3 gap-3">
        <div className="text-lg font-bold w-full ">
          
          {getStepContent()}
        </div>
        <div className="w-full md:w-auto">
        {step !== 'payment' && 
        (
            <NextStepButton step={step} dict={dict} user_anonymous={user.is_anonymous} deliveryCart={deliveryCart}/>
        )}
        </div>
      </div>
    </div>
  );
};
