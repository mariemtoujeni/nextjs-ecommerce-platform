import { ISupplierRepository } from "../../repositories";
import { Supplier, SupplierFilter, SupplierInput } from "../../models";
import { ReturnAll } from "../../types/utils";
import { SharedMemory } from "./SharedMemory";

export class MockSupplierRepository implements ISupplierRepository {
    readAll(options: SupplierFilter): Promise<ReturnAll<Supplier>> {
        return Promise.resolve({
            total: SharedMemory.suppliers.length,
            count: SharedMemory.suppliers.length,
            items: SharedMemory.suppliers
        });
    }

    create(supplier: SupplierInput): Promise<Supplier> {
        const newSupplier: Supplier = {
            ...supplier,
            id: SharedMemory.suppliers.length + 1,
            code: supplier.code ?? "",
            address: supplier.address ?? "",
            zipCode: supplier.zipCode ?? "",
            city: supplier.city ?? "",
            country: supplier.country ?? "",
            phone: supplier.phone ?? "",
            email: supplier.email ?? "",
            siret: supplier.siret ?? ""
        };
        SharedMemory.suppliers.push(newSupplier);
        return Promise.resolve(newSupplier);
    }
}