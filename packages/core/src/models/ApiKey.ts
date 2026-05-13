import { Supplier } from "./Supplier";

export type ApiKeyDTO = {
    id: number;
    key: string;
    supplierId: number;
    supplier: Supplier;
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
}

export class ApiKey {
    id: number;
    key: string;
    supplierId: number;
    supplier: Supplier;
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;

    constructor(data: {
        id: number;
        key: string;
        supplierId: number;
        supplier: Supplier;
        createdAt: string;
        updatedAt: string;
        expiresAt: string | null;
    }) {
        this.id = data.id;
        this.key = data.key;
        this.supplierId = data.supplierId;
        this.supplier = data.supplier;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.expiresAt = data.expiresAt;
    }

    isExpired(): boolean {
        if("" == this.expiresAt || null == this.expiresAt) {
            return false;
        }

        return new Date(this.expiresAt) < new Date();
    }
}