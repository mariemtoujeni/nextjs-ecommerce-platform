"use server";

import { BestProductReduction } from "@repo/core/models";
import { bestAutoReduction } from "@repo/core/usecases";

export async function getBestAutoReduction(
  modeleId: number,
  quantite: number,
  codePromo: string = ""
): Promise<BestProductReduction | undefined> {
  try {
    return await bestAutoReduction(modeleId, quantite, codePromo);
  } catch (error) {
    console.error("Failed to compute bestAutoReduction:", error);
    return undefined;
  }
}
