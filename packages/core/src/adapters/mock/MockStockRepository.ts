import { IStockRepository } from "../../repositories";
import { ModelStockUpdate, Stock, StockFilterInput, StockInput, StockPresenter } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { InternalServerError, NotFoundError } from "../../types/error";
import { ReturnAll } from "../../types/utils";

export class MockStockRepository implements IStockRepository {
    updateModelStocks(updates: ModelStockUpdate[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async createStock(modelId: number): Promise<Stock> {
        const stock: Stock = {
            idModel: modelId,
            locked: 0,
            disponible: 0,
            indisponible: 0,
            updatedAt: new Date().toISOString(), 
        };

        SharedMemory.stocks.push(stock);

        return stock;
    }

    async readStockById(id: number): Promise<Stock> {
        const stock = SharedMemory.stocks.find(stock => stock.idModel === id);
        if (!stock) {
            throw new NotFoundError('Stock not found');
        }
        return stock;
    }

    async listStockByModelIds(modelIds: number[]): Promise<Stock[]> {
        const stocks = SharedMemory.stocks.filter(stock => modelIds.includes(stock.idModel));
        if (stocks.length === 0) {
            throw new NotFoundError('Stocks not found');
        }
        return stocks;
    }
    
    async readStockByIds(ids: number[]): Promise<ReturnAll<Stock>> {
        const stocks = SharedMemory.stocks.filter(stock => ids.includes(stock.idModel));
        if (stocks.length === 0) {
            throw new NotFoundError('Stocks not found');
        }
        return {
            items: stocks,
            total: stocks.length,
            count: stocks.length
        };
    }

    async updateStock(stocks: StockInput[]): Promise<void> {
        // First filter the stocks to only keep the ones that are in the SharedMemory and not in the stocks array
        SharedMemory.stocks = SharedMemory.stocks.filter(stock => !stocks.some(s => s.idModel === stock.idModel));
        // Then update the stocks in the SharedMemory
        SharedMemory.stocks = [...SharedMemory.stocks, ...stocks];
    }

    async listStocks(options?: StockFilterInput): Promise<ReturnAll<StockPresenter>> {
        throw new InternalServerError("Not implemented");
    }
}