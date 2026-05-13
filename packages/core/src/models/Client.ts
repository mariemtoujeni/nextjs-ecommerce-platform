import { z } from "zod";
import { Club } from "./Club";
import { Quotation } from "./Quotation";
import { Order } from "./Order";
import { Address } from "./Address";


export const clientOptionsSchema = z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional().default(''),
    filters: z.array(z.object({
        key: z.string(),
        values: z.union([z.array(z.string()), z.array(z.object({
            key: z.string(),
            values: z.array(z.string())
        }))]),
    })).optional(),
})

export type ClientFilterInput = z.input<typeof clientOptionsSchema>;
export type ClientFilter = z.infer<typeof clientOptionsSchema>;

export enum ClientFilterTypeAdmin {
    TYPE = "TYPE",
    // POST_CODE = "POST_CODE",
    // CITY = "CITY",
    MEMBRE_CLUB = "MEMBRE_CLUB",
}

export enum ClientType {
    CLIENT = 'CLIENT',
    CLUB = 'CLUB',
    CLUB_PARTENAIRE = 'CLUB_PARTENAIRE',
}

export type Client = {
    userId: string;
    email: string;
    lastName: string;
    firstName: string;
    phone: string;
    mobilePhone: string;
    workPhone: string;
    clubMemberId: number;
    clubId: number;
    club?: Club;
    clientNumber: number;
    type: ClientType;
    lang: string;
    newsLetter: boolean;
    siteOffer: boolean;
    partnerOffer: boolean;
    credit: number;
    fidelityPoints: number;
    birthDate: Date;
    clientAddress: Address[];
    order: Order[];
    quotation: Quotation[];
    createdAt: Date | string;

}

export type ClientAddress = {
    postCode: string;
    city: string;
    address: string;
    address2: string;
    address3: string;
    country: string;
    designation?: string;
    company: string;
    firstName: string;
    lastName: string;
    defaut?: boolean;
}


export const clientInputSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    mobilePhone: z.string().min(10, "Mobile phone must be valid"),
    phone: z.string(),
    workPhone: z.string(),
    fidelityPoints: z.number().nonnegative("Fidelity points must be >= 0"),
    credit: z.number().nonnegative("Credit must be >= 0"),
    type: z.nativeEnum(ClientType),
    marketingEmail: z.boolean(),
    marketingSMS: z.boolean(),

    clientNumber: z.number(),

    clubId: z.number().optional(),
    clubMemberId: z.number().optional(),
});

export type ClientInput = z.infer<typeof clientInputSchema>;

export const clientAddressInputSchema = z.object({
    company: z.string().min(1, "Le nom de l'entreprise est requis"),
    country: z.string().min(1, "Le pays est requis"),
    address: z.string().min(1, "L'adresse est requise"),
    postCode: z.string().min(1, "Le code postal est requis"),
    city: z.string().min(1, "La ville est requise"),
});

export type ClientAddressInput = z.infer<typeof clientAddressInputSchema>;
export const clientUpdateSchema = clientInputSchema.merge(clientAddressInputSchema);
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;

export const dataClientInputSchema = z.object({
    lastName: z.string().min(1, "First name is required"),
    firstName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    mobilePhone: z.string().optional(),
    phone: z.string().optional(),
    birthDate: z.coerce.date().nullable().optional(),
 
})

export type PasswordErrorType =
    | "TOO_SHORT"
    | "NO_UPPERCASE"
    | "NO_LOWERCASE"
    | "NO_NUMBER"
    | "NO_SPECIAL";
export const passwordClientInputSchema = z.object({
    password: z.string().min(8, { message: "TOO_SHORT" })
        .regex(/[A-Z]/, { message: "NO_UPPERCASE" })
        .regex(/[a-z]/, { message: "NO_LOWERCASE" })
        .regex(/[0-9]/, { message: "NO_NUMBER" })
        .regex(/[^A-Za-z0-9]/, { message: "NO_SPECIAL" })

})

export type passwordClientInput = z.infer<typeof passwordClientInputSchema>
export type dataClientInput = z.infer<typeof dataClientInputSchema>;

export const signUpInputSchema = z.object({
    lastName: z.string().min(1, "First name is required"),
    firstName: z.string().min(1, "Last name is required"),   
    mobilePhone: z.string().optional(),
    phone: z.string().optional(),
    birthDate: z.coerce.date().nullable().optional(),
    clubId: z.number().optional(), 
})
export type signUpInput = z.infer<typeof signUpInputSchema>;
export const signUpClubMemberSchema = z.object({
    lastName: z.string().min(1, "First name is required"),
    firstName: z.string().min(1, "Last name is required"),    
    mobilePhone: z.string().optional(),
    phone: z.string().optional(),
   
});
export type signUpClubMember = z.infer<typeof signUpClubMemberSchema>;