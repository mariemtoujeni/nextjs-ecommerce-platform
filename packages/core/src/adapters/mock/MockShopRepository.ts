import { IShopRepository } from "../../repositories";
import { Shop, ShopFilterInput, ShopInput, ShopLine, ShopLineInput, ShopPresenter, ShopStatus } from "../../models";
import { BadRequestError, NotFoundError } from "../../types/error";
import { ReturnAll } from "../../types/utils";
import { SharedMemory } from "./SharedMemory";

export class MockShopRepository implements IShopRepository {
    async readShops(onlyActive: boolean, options?: ShopFilterInput) : Promise<ReturnAll<Shop>> {
        const { limit, offset, sort, search, filters } = options || {};

        let shops = 'asc' == sort
            ? [...SharedMemory.shops].sort((a, b) => a.id - b.id).slice(offset ?? 0, (offset ?? 0) + (limit ?? Number.MAX_SAFE_INTEGER))
            : [...SharedMemory.shops].sort((a, b) => b.id - a.id).slice(offset ?? 0, (offset ?? 0) + (limit ?? Number.MAX_SAFE_INTEGER));
            
        if(search) {
            shops = shops.filter(shop => shop.name.toLowerCase().includes(search.toLowerCase()));
        }

        if(filters) {
            filters.forEach(filter => {
                if(filter.key === 'isActive') {
                    const filterValue = filter.values[0];
                    if (typeof filterValue === 'string') {
                        const isActive = filterValue.toLowerCase() === 'true';
                        shops = shops.filter(shop => shop.isActive === isActive);
                    } else if (typeof filterValue === 'boolean') {
                        shops = shops.filter(shop => shop.isActive === filterValue);
                    }
                } else if(filter.key === 'department') {
                    const filterValue = filter.values[0];
                    if (typeof filterValue === 'string') {
                        shops = shops.filter(shop => shop.department.toLowerCase().includes(filterValue.toLowerCase()));
                    }
                } else if(filter.key === 'status') {
                    const filterValue = filter.values[0] as ShopStatus;
                    if (!Object.values(ShopStatus).includes(filterValue)) {
                        throw new BadRequestError(`Invalid shop status: ${filterValue}`);
                    }
                    shops = shops.filter(shop => shop.status === filterValue);
                }
            });
        }

        if(onlyActive) {
            return {
                items: shops.filter(shop => shop.isActive),
                total: shops.filter(shop => shop.isActive).length,
                count: shops.filter(shop => shop.isActive).length
            };
        }
        return {
            items: shops,
            total: shops.length,
            count: shops.length
        };
    }

    async readShopById(id: number) : Promise<ShopPresenter> {
        const shop = SharedMemory.shops.find(shop => shop.id === id);
        if(!shop) {
            throw new NotFoundError(`Shop with id ${id} not found`);
        }
        const lines = SharedMemory.shopLines.filter(line => line.idShop === id);
        return {
            ...shop,
            lines
        };
    }

    async updateShop(id: number, shop: ShopInput) : Promise<Shop> {
        const shopToUpdate = SharedMemory.shops.find(shop => shop.id === id);
        if(!shopToUpdate) {
            throw new NotFoundError(`Shop with id ${id} not found`);
        }
        const updateShops = SharedMemory.shops.map(sh => sh.id === id ? { 
            name: shop.name ? shop.name : sh.name,
            expirationDate: shop.expirationDate ? new Date(shop.expirationDate) : sh.expirationDate,
            isActive: shop.isActive ? shop.isActive : sh.isActive,
            createdAt: shop.createdAt ? new Date(shop.createdAt) : sh.createdAt,
            status: shop.status ? shop.status : sh.status,
            department: shop.department ? shop.department : sh.department,
            id: id
        } : sh);
        SharedMemory.shops = updateShops;
        return updateShops.find(shop => shop.id === id) as Shop;
    }

    async updateShopLine(shopLine: ShopLineInput[]) : Promise<ShopLine[]> {
        // remove shopLine that are in shopLine input
        const shopLineToUpdate = SharedMemory.shopLines.filter( f => !shopLine.some(s => s.idModel === f.idModel && s.idShop === f.idShop));
        // add shopLine in shopLineToUpdate
        const updatedShopLine = [...shopLineToUpdate, ...shopLine];
        // update shopLine
        SharedMemory.shopLines = updatedShopLine;
        return shopLine;
    }

    async createShop(shop: ShopInput) : Promise<Shop> {
        const shopCreated: Shop = {
            ...shop,
            id: SharedMemory.shops.length + 1,
            expirationDate: shop.expirationDate ? new Date(shop.expirationDate) : undefined,
            createdAt: shop.createdAt ? new Date(shop.createdAt) : undefined,
            updatedAt: shop.updatedAt ? new Date(shop.updatedAt) : undefined,
        } as Shop;
        SharedMemory.shops.push(shopCreated);
        return shopCreated;
    }

    async createShopLine(shopLines: ShopLineInput[]) : Promise<ShopLine[]> {
        const shopLinesCreated: ShopLine[] = shopLines.map(shopLine => ({
            ...shopLine,
            id: SharedMemory.shopLines.length + 1,
        }));
        SharedMemory.shopLines.push(...shopLinesCreated);
        return shopLinesCreated;
    }

    async deleteShop(id: number) : Promise<void> {
        SharedMemory.shops = SharedMemory.shops.filter(shop => shop.id !== id);
    }

    async deleteShopLine(idModel: number, idShop: number) : Promise<void> {
        SharedMemory.shopLines = SharedMemory.shopLines.filter(shopLine => shopLine.idModel !== idModel && shopLine.idShop !== idShop);
    }
}