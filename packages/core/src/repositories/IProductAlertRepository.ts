import { CreateAlertInput, InsertedProductAlert, ProductAlert, ProductAlertFilter } from "../models";
import { ReturnAll } from "../types";

export interface IProductAlertRepository {
    read(options: ProductAlertFilter, isActif?: boolean): Promise<ReturnAll<ProductAlert>>;
    delete(id: number): Promise<void>;
    create(productAlert: CreateAlertInput): Promise<InsertedProductAlert>;
    update(productAlert: ProductAlert): Promise<ProductAlert>;
    
}

