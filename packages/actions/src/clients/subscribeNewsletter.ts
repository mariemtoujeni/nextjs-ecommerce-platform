"use server"

import { subscribeNewsletterUseCase } from "@repo/core/usecases";

export const subscribeNewsletterAction = async (email: string) => {
    try {
        await subscribeNewsletterUseCase(email);
        return true;
    } catch (error: any) {
        return false;
    }
}