"use server"

import { Settings, SettingsRequest, settingsSchema } from "@repo/core/models";
import { updateConfsUseCase } from "@repo/core/usecases"
import { BadRequestError } from "@repo/core/types"

export const updateConfsAction = async (confs: SettingsRequest): Promise<Settings> => {
    const validatedFields = settingsSchema.safeParse({
        ...confs
    })

    if (!validatedFields.success) {
        throw new BadRequestError(validatedFields.error.message);
    }
    
    try {
        const generalConf = await updateConfsUseCase(confs);
        return generalConf;
    } catch (error: any) {
        throw error;
    }
}