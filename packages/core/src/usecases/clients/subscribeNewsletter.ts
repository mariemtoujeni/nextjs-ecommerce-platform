import { z } from "zod";
import { getInjection } from "../../types";

const emailSchema = z.string().email();

export const subscribeNewsletterUseCase = async (email: string): Promise<boolean> => {
  const clientRepository = await getInjection("IClientRepository");

  const result = emailSchema.safeParse(email);
  if (!result.success) {
    throw new Error("Invalid email address");
  }

  return await clientRepository.subscribeNewsletter(result.data);
};
