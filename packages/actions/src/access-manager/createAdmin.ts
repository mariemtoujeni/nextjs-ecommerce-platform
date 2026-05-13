"use server"

import { Admin, AddAdminRequest, SignUpRequestWithoutPassword, signUpSchema } from "@repo/core/models";
import { createAdminRoleUseCase } from "@repo/core/usecases";
import { BadRequestError, generateSecurePassword, ReturnOne } from "@repo/core/types";

export const createAdminAction = async (request: AddAdminRequest): Promise<ReturnOne<Admin>> => {    
    try {
        const generatedPassword = generateSecurePassword(8);
        const userWithPassword : SignUpRequestWithoutPassword & { password: string } = { 
            password: generatedPassword,
            email: request.email,
            lastName: request.prenom,
            firstName: request.nom,
            Address: "",
            postCode: "",
            city: "",
            country: ""
        };

        const validatedUser = signUpSchema.safeParse(userWithPassword);
        if(!validatedUser.success) {
            throw new BadRequestError("Invalid options");
        }

        const timestamp: number = Date.now();
        const newAccessSetting = await createAdminRoleUseCase(request, validatedUser.data, timestamp.toString());
        
        return {
            item: newAccessSetting,
            error: undefined
        };
    } catch (error: any) {
        return {
            item: undefined as unknown as Admin,
            error: error.message
        };
    }
}

