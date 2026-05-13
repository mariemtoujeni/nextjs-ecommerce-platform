"use server"
import { StockFilterInput, StockPresenter } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listStocksUseCase } from "@repo/core/usecases";

export const getListAllStocksAction = async (options?: StockFilterInput) : Promise<ReturnAll<StockPresenter>> => {
    try {
        const stocks = await listStocksUseCase(options);
        return stocks;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
}