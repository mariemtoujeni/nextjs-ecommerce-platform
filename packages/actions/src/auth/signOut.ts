"use server";

import { getInjection } from "@repo/core/types";
import { redirect } from "next/navigation";

export const signOutAction = async () => {
  const authService = await getInjection("IAuthenticationService");

  await authService.signOut();

  redirect("/signin");
};
