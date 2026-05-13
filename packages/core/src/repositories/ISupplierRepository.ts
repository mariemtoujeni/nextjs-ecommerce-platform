import { Supplier, SupplierFilter, SupplierInput } from "../models";
import { ReturnAll } from "../types";

export interface ISupplierRepository {
    readAll(options: SupplierFilter): Promise<ReturnAll<Supplier>>;
    create(supplier: SupplierInput): Promise<Supplier>;
}