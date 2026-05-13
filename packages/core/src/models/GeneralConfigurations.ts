import { z } from "zod"

export const settingsSchema = z.object({
    duree_validite_cheque_cadeau: z.number(),
    type_duree_validite_cheque_cadeau: z.string(),
    duree_validite_avoir: z.number(),
    type_duree_validitee_avoir: z.string(),
    duree_validite_email_relance: z.number(),
    type_duree_validite_email_relance: z.string(),
    duree_validite_cashback: z.number(),
    type_duree_validite_cashback: z.string()
})

export type SettingsRequest = z.infer<typeof settingsSchema>

export type Settings = {
    duree_validite_cheque_cadeau: number;
    type_duree_validite_cheque_cadeau: string;
    duree_validite_avoir: number;
    type_duree_validitee_avoir: string;
    duree_validite_email_relance: number;
    type_duree_validite_email_relance: string;
    duree_validite_cashback: number;
    type_duree_validite_cashback: string;
    reduction_cashback?: number;
}