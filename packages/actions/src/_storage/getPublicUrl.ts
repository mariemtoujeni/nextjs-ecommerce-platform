"use server";

import { getInjection } from "@repo/core/types";

export const getPublicUrl = async (path: string) => {
    const storageService = await getInjection("IStorageService");
    
    const publicUrl = await storageService.getPublicUrl(path);

    return await fetch(publicUrl);
}