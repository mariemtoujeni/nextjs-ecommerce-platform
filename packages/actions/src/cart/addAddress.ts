"use server";

import { addAddressUseCase } from "@repo/core/usecases";
import { Address, AddressFormInput } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";

export const addAddressAction = async (address: AddressFormInput): Promise<ReturnOne<Address>> => {
  try {
    const result = await addAddressUseCase(address);
    return {
      item: result,
    };
  } catch (error: any) {
    return {
      item: {} as Address,
      error: error
    };
  }
};
