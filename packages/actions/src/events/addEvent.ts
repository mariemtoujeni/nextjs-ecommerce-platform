"use server";

import { addEventUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { EventInput } from "@repo/core/models";

export const addEventAction = async (event: EventInput) => {
  try {
    const createdEvent = await addEventUseCase(event);
    return createdEvent;
  } catch (error: any) {
    console.error("Add Event error:", error);
    throw new BadRequestError("Failed to add Event");
  }
};
