"use server";

import { addProductAlertUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { CreateAlertInput, InsertedProductAlert } from "@repo/core/models";

export const addProductAlertAction = async (productAlert: CreateAlertInput): Promise<InsertedProductAlert>=>{
  try {
    const createdProductAlert = await addProductAlertUseCase(productAlert);
    return createdProductAlert;
  } catch (error: any) {
    console.error("Add ProductAlert error:", error);
    throw new BadRequestError("Failed to add ProductAlert");
  }
};
