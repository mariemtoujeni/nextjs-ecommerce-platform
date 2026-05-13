"use server";

import { uploadImageUseCase } from "@repo/core/usecases";
import { BadRequestError, ReturnOne } from "@repo/core/types";

export const uploadEventCoverImageAction = async (file: File): Promise<ReturnOne<string>> => {
  try {
    const publicUrl = await uploadImageUseCase(file);
    return {
      item: publicUrl
    };
  } catch (error: any) {
    console.error("Upload Event Cover Image error:", error);
    return {
      item: "",
      error: error
    }
  }
};
