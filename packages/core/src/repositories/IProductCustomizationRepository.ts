import { Customization } from "../models/Product";

export interface IProductCustomizationRepository {
    create(productId: number, customization: Omit<Customization, "id">): Promise<Customization>;
    update(id: number, customization: Omit<Customization, "id">): Promise<void>;
    delete(id: number): Promise<void>;
}