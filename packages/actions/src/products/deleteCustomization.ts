"use server";
import { deleteCustomization } from "@repo/core/usecases";

export const deleteCustomizationAction = async (customizationId: number) => {
    try {
        await deleteCustomization(customizationId);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}