import { Stock, StockInput, StockFilterInput, StockPresenter, ModelStockUpdate } from "../models";
import { ReturnAll, ReturnOne } from "../types";

export interface IStockRepository {
    readStockById(id: number): Promise<Stock>;
    readStockByIds(ids: number[], options?: StockFilterInput): Promise<ReturnAll<Stock>>;
    listStocks(options?: StockFilterInput): Promise<ReturnAll<StockPresenter>>;
    listStockByModelIds(modelIds: number[]): Promise<Stock[]>;
    updateStock(stock: StockInput[]): Promise<void>;
    createStock(modelId: number): Promise<Stock>;
    updateModelStocks(updates: ModelStockUpdate[]): Promise<void>;
}