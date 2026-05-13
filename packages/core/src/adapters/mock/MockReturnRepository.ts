// Mock du repository des retours pour les tests unitaires
import { IReturnRepository } from "../../repositories";
import { Return, ReturnFilterInput, ReturnPresenter, ReturnPresenterInput } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { ReturnAll, ReturnOne } from "../../types";

export class MockReturnRepository implements IReturnRepository {
   
    async read(orderIds: number[]): Promise<Return[]> {
        return SharedMemory.returns.filter(retour => orderIds.includes(retour.id_commande));
    }

    async listAllReturns(options: ReturnFilterInput): Promise<ReturnAll<ReturnPresenter>> {
        throw new Error("Not implemented");
    }

    async getReturn(id: number): Promise<ReturnOne<ReturnPresenter>> {
        throw new Error("Not implemented");
    }

    async updateReturn(id: number, returnData: ReturnPresenterInput): Promise<ReturnOne<ReturnPresenter>> {
        throw new Error("Not implemented");
    }

    async createReturn(returnData: ReturnPresenterInput): Promise<ReturnOne<ReturnPresenter>> {
        throw new Error("Not implemented");
    }
} 