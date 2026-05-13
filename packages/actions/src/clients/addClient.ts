'use server';

import { createUserUseCase, populateClientDetailsUseCase } from "@repo/core/usecases";
import { Client, ClientAddressInput, ClientInput, ClubInput } from "@repo/core/models";

export const addClientAction = async (client: ClientInput, address: ClientAddressInput, club?: ClubInput): Promise<Client> => {
  try {
    const result = await populateClientDetailsUseCase(client, address, club);
    return result;
  } catch (error: any) {
    throw error;
  }
};
