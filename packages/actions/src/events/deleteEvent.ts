"use server";

import { deleteEventUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const deleteEventAction = async (eventId: number) => {
  try {
    await deleteEventUseCase(eventId);
  } catch (error: any) {
    throw new BadRequestError("Failed to delete a Event");
  }
};
