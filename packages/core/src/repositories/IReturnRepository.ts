// Interface du repository pour la récupération des retours liés à une liste de commandes
import { ReturnAll, ReturnOne } from "../types";
import { Return, ReturnFilterInput, ReturnPresenter, ReturnPresenterInput } from "../models";

export interface IReturnRepository {
    read(orderIds: number[]): Promise<Return[]>;
    listAllReturns(options: ReturnFilterInput): Promise<ReturnAll<ReturnPresenter>>;
    getReturn(id: number): Promise<ReturnOne<ReturnPresenter>>;
    updateReturn(id: number, returnData: ReturnPresenterInput): Promise<ReturnOne<ReturnPresenter>>;
    createReturn(returnData: ReturnPresenterInput): Promise<ReturnOne<ReturnPresenter>>;
} 