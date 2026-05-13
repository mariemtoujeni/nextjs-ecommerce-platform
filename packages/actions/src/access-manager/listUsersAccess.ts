"use server"

import { Admin } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listAdminsUseCase } from "@repo/core/usecases"

export const listUsersAccessAction = async (): Promise<ReturnAll<Admin>> => {
    try {
        const accessSettings = await listAdminsUseCase();
        
        // Ensure the data is properly serialized for Next.js Server Components
        return {
            total: accessSettings.total,
            count: accessSettings.count,
            items: accessSettings.items.map(admin => ({
                id: String(admin.id),
                email: String(admin.email),
                prenom: String(admin.prenom),
                nom: String(admin.nom),
                role: String(admin.role),
                created_at: String(admin.created_at)
            })),
            error: accessSettings.error
        };
    } catch (error: any) {
        return {
            total: 0,
            count: 0,
            items: [],
            error: error.message
        };
    }
}