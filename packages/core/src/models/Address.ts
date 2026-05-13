import { Z } from "vitest/dist/chunks/reporters.d.79o4mouw.js";
import { z } from "zod";

// Modèle représentant une adresse liée à un utilisateur
export type Address = {
    id: number;
    numero_client: number;
    designation: string;
    civilite: string;
    nom: string;
    prenom: string;
    adresse: string;
    adresse2: string;
    adresse3: string;
    code_postal: string;
    ville: string;
    pays: string;
    interphone: string;
    code_porte: string;
    instructions: string;
    default: boolean;
    created_at: Date;
    updated_at: Date;
    societe: string;
} 
export type defaultAddress = {
    id: number;
    address: string;
    postalCode: string;
    city: string;
    default: boolean;
    designation: string;
    country: string;
}
export type AddressFormInput = {
    designation: string;
    address: string;
    complement: string;
    building: string;
    postalCode: string;
    city: string;
    country: string;
}

export type AddressQueryOptions = {
    clientNumber?: number;
    designation?: string;
    def?: boolean;
    limit?: number;
};
export const FactAddressInputSchema = z.object({
    civility: z.string().min(1, "Civility is required"),
    lastName: z.string().min(1, "Last name is required"),
    firstName: z.string().min(1, "First name is required"),
    designation: z.string().optional(),
    company: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    complement: z.string().optional(),
    building: z.string().optional(),
    postalCode: z.string().min(1, "Postal code is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
})
export type FactAddressInput = z.infer<typeof FactAddressInputSchema>;

export const AddressSignUpInputSchema = z.object({  
    civility: z.string().min(1, "Civility is required"), 
    address: z.string().min(1, "Address is required"),
    complement: z.string().optional(),
    building: z.string().optional(),
    postalCode: z.string().min(1, "Postal code is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    company: z.string().optional(),
})

export type AddressSignUpInput = z.infer<typeof AddressSignUpInputSchema>;
export const AddressSignUpClubSchema = z.object({ 
    civility: z.string().min(1, "Civility is required"), 
    address: z.string().min(1, "Address is required"),
    complement: z.string().optional(),
    building: z.string().optional(),
    postalCode: z.string().min(1, "Postal code is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),  

 })
 export type AddressSignUpClub = z.infer<typeof AddressSignUpClubSchema>;