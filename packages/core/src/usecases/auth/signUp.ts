import {  SignUpPayload, SignUpPayloadSchema } from "../../models";
import { getInjection } from "../../types";

export const signUpUseCase = async ( user: SignUpPayload ): Promise<{ success: boolean; error?: string }> => {
  const validateClient = SignUpPayloadSchema.parse(user);
  const userRepository = await getInjection("IUserRepository");

  return userRepository.createUser(validateClient);
};
