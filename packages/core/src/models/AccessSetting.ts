import { z } from "zod"

export const addAdminSchema = z.object({
    clientNumber: z.number().optional(),
    prenom: z.string(),
    nom: z.string(),
    email: z.string().email(),
    role: z.string().refine((role) => role === 'admin.super' || role === 'admin.editor', {
        message: 'Role must be either admin or super_admin'
    })
});

export type AddAdminRequest = z.infer<typeof addAdminSchema>;

export type Admin = {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    role: string;
    created_at: string;
    reset_password_code?: string;
}

export type NewAdmin = Omit<Admin, 'id'  | 'created_at'>;

export type UpdateAdminRequest = Pick<Admin, 'id' > &  AddAdminRequest;