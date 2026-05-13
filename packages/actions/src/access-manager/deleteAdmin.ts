"use server"

import { deleteAdminUseCase } from "@repo/core/usecases";

export const deleteAdminAction = async (id: string, email: string): Promise<void> => {
    try {
        const newAccessSetting = await deleteAdminUseCase(id, email);
        return newAccessSetting;
    } catch (error: any) {
        throw error;
    }
}