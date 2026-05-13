import { getInjection, ResetPasswordResult } from "../../types";
import { signInUseCase } from "./signIn";

export const resetPasswordUseCase = async ( newPassword: string, token: string ): Promise<ResetPasswordResult> => {
  const userRepo = await getInjection("IUserRepository");
  const user = await userRepo.findUserByResetToken(token);

  if (!user) {
    return { success: false, error: "Invalid token" };
  }

  const now = new Date();
  if (new Date(user.reset_password_expires_at) < now) {
    return { success: false, error: "Token expired" };
  }

  const result = await userRepo.resetPassword(newPassword, user.id_user);
  await userRepo.invalidateResetToken(token);

  if (!result) {
    return { success: false, error: "Failed to reset password" };
  }
  await signInUseCase({
    email: user.email,
    password: newPassword
  });
  return { success: true };
};
