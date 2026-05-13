import { IProductCustomizationRepository } from "../../repositories/IProductCustomizationRepository";
import { Customization } from "../../models/Product";
import { SharedMemory } from "./SharedMemory";
import { NotFoundError } from "../../types/error";

export class MockProductCustomization implements IProductCustomizationRepository {
    async create(productId: number, customization: Omit<Customization, "id">): Promise<Customization> {
        const newCustomization: Customization = {
            ...customization,
            id: SharedMemory.productCustomizations.length + 1,
        }
        SharedMemory.productCustomizations.push({
            ...newCustomization,
            productId,
        });
        return newCustomization;
    }
    async update(id: number, customization: Omit<Customization, "id">): Promise<void> {
        const c = SharedMemory.productCustomizations.find(c => c.id === id);
        if (!c) {
            throw new NotFoundError("Customization not found");
        }
        c.description = customization.description;
        c.price = customization.price;
    }
    async delete(id: number): Promise<void> {
        const index = SharedMemory.productCustomizations.findIndex(c => c.id === id);
        if (index === -1) {
            throw new NotFoundError("Customization not found");
        }
        SharedMemory.productCustomizations.splice(index, 1);
    }
}