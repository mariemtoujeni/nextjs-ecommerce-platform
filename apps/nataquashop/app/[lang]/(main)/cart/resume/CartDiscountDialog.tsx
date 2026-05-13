import React from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui";
import { AddButton } from "./AddButton";

interface CartDiscountDialogProps {
  dict: any;
}

export const CartDiscountDialog: React.FC<CartDiscountDialogProps> = ({ dict }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {dict.cart.addDiscount}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90%] md:w-[45%] max-w-2xl p-0 overflow-visible">
        {/* Header */}
        <DialogTitle>
          <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-8 pb-4">
            <Heading heading="5">
              {dict.cart.addDiscount}
            </Heading>
          </div>
        </DialogTitle>
        {/* Tabs */}
        <div className="px-4 md:px-8">
          <Tabs defaultValue="promo" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-8 border-b border-black">
              <TabsTrigger value="promo" className="border-0 font-normal data-[state=active]:font-medium data-[state=active]:bg-black data-[state=active]:text-white">
                {dict.cart.discount.promoTab}
              </TabsTrigger>
              <TabsTrigger value="gift" className="border-0 font-normal data-[state=active]:font-medium data-[state=active]:bg-black data-[state=active]:text-white">
                {dict.cart.discount.giftTab}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="promo">
              <div className="flex flex-col gap-4">
                <Label htmlFor="promo-code">{dict.cart.discount.promoLabel}</Label>
                <Input id="promo-code" name="promo-code" placeholder={dict.cart.discount.promoPlaceholder}/>
              </div>
            </TabsContent>
            <TabsContent value="gift">
              <div className="flex flex-col gap-4">
                <Label htmlFor="gift-code">{dict.cart.discount.giftLabel}</Label>
                <Input id="gift-code" name="gift-code" placeholder={dict.cart.discount.giftPlaceholder}/>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* Footer */}
        <div className="flex justify-end gap-4 px-4 md:px-8 pb-4 md:pb-8 pt-4 md:pt-8 items-end">
          <DialogClose asChild>
            <Button id="discount-dialog-close" variant="outline" className="w-[120px]">
              {dict.cart.discount.cancel}
            </Button>
          </DialogClose>
          <AddButton dict={dict} />
        </div>

      </DialogContent>
    </Dialog>
  );
};
