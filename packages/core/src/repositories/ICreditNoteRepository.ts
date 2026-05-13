// Interface du repository pour la récupération des avoirs d'un client
import { creditNote, CreditNote, CreditNoteFilterInput, CreditNoteInput } from "../models";
import { ReturnAll, ReturnOne } from "../types";

export type ReadCreditNoteProps = {
    clientNumber?: number;
    orderNumbers?: number[];
    startDate?: Date;
    endDate?: Date;
    options?: CreditNoteFilterInput;
}

export interface ICreditNoteRepository {    
    read(clientNumber: number): Promise<CreditNote[]>;
    readAll(props: ReadCreditNoteProps): Promise<ReturnAll<CreditNote>>;
    create(creditNoteInput: CreditNoteInput): Promise<ReturnOne<CreditNote>>;
    readUnused(clientNumber: number): Promise<CreditNote[]>
    update(id: number, montant_restant: number, utilise: boolean): Promise<CreditNote>;
} 