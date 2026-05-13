"use server";

import { getStoreMenu } from "@repo/core/usecases";

export async function getStoreMenuAction(lang: string) {
    try {
        return await getStoreMenu(lang);
    } catch (error) {
        return [];
    }
}