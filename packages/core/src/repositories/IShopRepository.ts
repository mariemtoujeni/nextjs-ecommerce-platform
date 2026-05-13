import { Shop, ShopFilterInput, ShopInput, ShopLine, ShopLineInput, ShopPresenter } from "../models";
import { ReturnAll } from "../types";

export interface IShopRepository {
    readShops(onlyActive: boolean, options?: ShopFilterInput) : Promise<ReturnAll<Shop>>;
    readShopById(id: number) : Promise<ShopPresenter>;
    updateShop(id: number, shop: ShopInput) : Promise<Shop>;
    updateShopLine(shopLine: ShopLineInput[]) : Promise<ShopLine[]>;
    createShop(shop: ShopInput) : Promise<Shop>;
    createShopLine(shopLines: ShopLineInput[]) : Promise<ShopLine[]>;
    deleteShop(id: number) : Promise<void>;
    deleteShopLine(idModel: number, idShop: number) : Promise<void>;
}