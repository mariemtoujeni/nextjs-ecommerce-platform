import { z } from "zod";
import { Client } from "./Client";
import { StoreMenu } from "./Category";


export const clubOptionsSchema = z.object({
    search: z.string().optional().default(''),
    filters: z.array(z.object({
        key: z.string(),
        values: z.union([z.array(z.string()), z.array(z.object({
            key: z.string(),
            values: z.array(z.string())
        }))]),
    })).optional(),
})

export type ClubFilterInput = z.input<typeof clubOptionsSchema>;
export type ClubFilter = z.infer<typeof clubOptionsSchema>;

export type Club = {
    id: number;
    name: string;
    president: string; 
    email: string;
    accountantAccount: string;
    paymentMode: number;
    paymentDelay: number;
    referent: string;
    phone: string;
    code: string;
    partner: boolean;
    valid: boolean;
    siren: string;
    tvaNumber: string;
    clubStore?: StoreMenu[];
}

export type ClubInput = Omit<Club, 'id'>;

export type ClubWithClients = Club & {
    clients: Client[];
}
export const clubSignUpInputSchema = z.object({
    name: z.string().min(1, "Name is required"),
    president: z.string().min(1, "President name is required"),
    referent: z.string().min(1, "Referent name is required"),
    siren: z.string().min(1, "SIREN is required"),
    tvaNumber: z.string().min(1, "TVA number is required"),

})
export type clubSignUpInput = z.infer<typeof clubSignUpInputSchema>;