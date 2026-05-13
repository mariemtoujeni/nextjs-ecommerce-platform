"use server"

import { signInUseCase } from "@repo/core/usecases"
import { signInSchema, SignInRequest } from "@repo/core/models"


export const signInAction = async (formData: SignInRequest) => {
    
    const { email, password } = formData
    const validatedFields = signInSchema.safeParse({
        email: email,
        password: password,
    })

    if (!validatedFields.success) {
        return {
            success: false,
        }
    }

    try {
        await signInUseCase(formData);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}