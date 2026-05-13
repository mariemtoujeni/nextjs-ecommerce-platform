"use server"

import { Admin, UpdateAdminRequest, addAdminSchema, NewAdmin } from "@repo/core/models";
import { updateAdminRoleUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const updateAdminRoleAction = async (request: UpdateAdminRequest): Promise<Admin> => {
    const validatedFields = addAdminSchema.safeParse({
        ...request
    })

    if (!validatedFields.success) {
        throw new BadRequestError(validatedFields.error.message);
    }
    
    try {
        const newAccessSetting = await updateAdminRoleUseCase({
            id: request.id,
            prenom: request.prenom,
            nom: request.nom,
            email: request.email,
            role: request.role
        });
        return newAccessSetting;
    } catch (error: any) {
        throw error;
    }
}