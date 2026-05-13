import { BrandFilter, IBrandRepository } from "../../repositories";
import { ReturnAll } from "../../types/utils";
import { Brand } from "../../models";
import { SharedMemory } from "./SharedMemory";

export class MockBrandRepository implements IBrandRepository {
    readAll(options: BrandFilter): Promise<ReturnAll<Brand>> {
        return Promise.resolve({
            total: SharedMemory.brands.length,
            count: SharedMemory.brands.length,
            items: SharedMemory.brands
        });
    }
}