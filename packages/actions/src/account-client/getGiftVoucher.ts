"use server"

import { GiftCard } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { getClientGiftVoucherUseCase } from "@repo/core/usecases";

export const getGiftVoucherClientAction = async ():Promise<ReturnAll<GiftCard>>=>{
   try {
       const giftVouchers = await getClientGiftVoucherUseCase();
        return {
          items: giftVouchers,
          count: giftVouchers.length,
          total: giftVouchers.length
        };

   } catch (error: any) {
         console.error("Error fetching client gift Vouchers:", error);
        return {
          items: [],
          count: 0,
          total: 0,
          error: error
        };
   }
}