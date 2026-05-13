"use server"
import { Customization } from "@repo/core/models";
import { updateCustomization } from "@repo/core/usecases";

export const updateCustomizationAction = async (customization: Customization) => {
    try {
        await updateCustomization(customization.id, customization);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}