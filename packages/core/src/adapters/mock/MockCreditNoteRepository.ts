// Mock du repository des avoirs pour les tests unitaires
import { ICreditNoteRepository, ReadCreditNoteProps } from "../../repositories";
import { CreditNote, creditNote, CreditNoteInput } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { ReturnAll, ReturnOne } from "../../types";

export class MockCreditNoteRepository implements ICreditNoteRepository {

    readUnused(clientNumber: number): Promise<CreditNote[]> {
        throw new Error("Method not implemented.");
    }
    update(id: number, montant_restant: number, utilise: boolean): Promise<CreditNote> {
        throw new Error("Method not implemented.");
    }

    async read(clientNumber: number): Promise<CreditNote[]> {
        return SharedMemory.creditNotes.filter(note => note.clientId === clientNumber);
    }
    
    async readAll(props: ReadCreditNoteProps): Promise<ReturnAll<CreditNote>> {
        throw new Error("Not implemented");
    }

    async readByCommandId(commandId: number): Promise<ReturnOne<CreditNote>> {
        throw new Error("Not implemented");
    }

    async create(creditNoteInput: CreditNoteInput): Promise<ReturnOne<CreditNote>> {
        throw new Error("Not implemented");
    }
} 