// Modèle représentant un retour effectué par un client
import { z } from "zod";
import { Client } from "./Client";
import { ModelProductDetail } from "./Checkout";
import { CreditNote } from "./creditNote";
import { Order, OrderPresenter } from "./Order";

export type Return = {
  id: number;
  id_commande: number;
  type_retour: string;
  date_demande: Date;
  date_reception: Date;
  numero_suivi: string;
  numero_prise_en_charge: string;
  cab_routage: string;
  date_commande_recu_le: Date;
  motif_retour: string;
  date_remboursement: Date;
  date_reexpedition: Date;
  etat: string;
}

export const returnOptionsSchema = z.object({
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

export type ReturnFilterInput = z.input<typeof returnOptionsSchema>;
export type ReturnFilter = z.infer<typeof returnOptionsSchema>;

export enum ReturnFilterType {
  STATUS = "STATUS",
  TYPE = "TYPE"
}

export enum ReturnStatus {
  PENDING = "ENCOURS",
  APPROVED = "CONFIRME",
  VALIDATED = "VALIDE",
  REJECTED = "REFUSE"
}

export enum ReturnType {
  REPAYMENT = "REMBOURSEMENT",
  EXCHANGE = "ECHANGE",
  CREDIT = "AVOIR"
}

export const returnSchema = z.object({
  id: z.number().optional(),
  orderId: z.number(),
  type: z.nativeEnum(ReturnType),
  requestDate: z.date(),
  receivedDate: z.date().optional(),
  trackingNumber: z.string().optional(),
  supportNumber: z.string().optional(),
  routingDebitCard: z.string().optional(),
  commandReceptionDate: z.date().optional(),
  returnReason: z.string().optional(),
  repaymentDate: z.date().optional(),
  reexpeditionDate: z.date().optional(),
  status: z.nativeEnum(ReturnStatus),
});

export type Return2 = z.infer<typeof returnSchema>;
export type ReturnInput = z.input<typeof returnSchema>;

export const returnLineSchema = z.object({
  id: z.number().optional(),
  returnId: z.number(),
  modelId: z.number(),
  quantity: z.number(),
  name: z.string().optional(),
  exchangeModelId: z.number().optional().nullable(),
  returnReason: z.string().optional(),
});

export type ReturnLine = z.infer<typeof returnLineSchema>;
export type ReturnLineInput = z.input<typeof returnLineSchema>;

export type ReturnLinePresenter = ReturnLine & {
  model: ModelProductDetail;
  exchangeModel?: ModelProductDetail;
}

export type ReturnPresenter = Return2 & {
  client: Client;
  order?: OrderPresenter;
  lines: ReturnLinePresenter[];
  creditNote?: CreditNote;
}

export type ReturnPresenterInput = z.input<typeof returnSchema> & {
  lines: z.input<typeof returnLineSchema>[];
};