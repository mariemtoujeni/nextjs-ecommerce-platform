import { CreateAlertInput, InsertedProductAlert, ProductAlert, ProductAlertFilter } from '../../models';
import { IProductAlertRepository } from '../../repositories';
import { ReturnAll } from "../../types/utils";
import { SharedMemory } from './SharedMemory';


export class MockProductAlertRepository implements IProductAlertRepository {
    async create(productAlert: CreateAlertInput): Promise<InsertedProductAlert> {
        const newProduct: ProductAlert = {
            ...productAlert,
            id: SharedMemory.productAlerts.length + 1,
            clientNumber: (productAlert as any).clientNumber ?? 0,
            client: {} as any,
            model: {} as any, 
            createdAt: new Date(),
            isActif: true,
            isEmailSent: false,
            email: productAlert.email ?? "",
        };
        SharedMemory.productAlerts.push(newProduct);
        return newProduct;
    }
    
    
    
    async delete(id: number): Promise<void> {
        const index = SharedMemory.productAlerts.findIndex(e => e.id === id);
        SharedMemory.productAlerts.splice(index, 1);
    }

    async read(options: ProductAlertFilter): Promise<ReturnAll<ProductAlert>> {
        const { limit, offset, sort } = options;

        const productAlerts = 'asc' == sort
            ? [...SharedMemory.productAlerts].sort((a, b) => a.id - b.id).slice(offset, offset + limit)
            : [...SharedMemory.productAlerts].sort((a, b) => b.id - a.id).slice(offset, offset + limit);

        return {
            total: SharedMemory.productAlerts.length,
            count: productAlerts.length,
            items: productAlerts,
        };
    }

    async update(productAlert: ProductAlert): Promise<ProductAlert> {
        const index = SharedMemory.productAlerts.findIndex(e => e.id === productAlert.id);
        if (index === -1) {
            throw new Error("productAlert not found");
        }
        SharedMemory.productAlerts[index] = productAlert;
        return productAlert;
    }
}