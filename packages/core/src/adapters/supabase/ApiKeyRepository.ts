import { ApiKey, ApiKeyDTO } from "../../models/ApiKey";
import { IApiKeyRepository } from "../../repositories/IApiKeyRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { KeyMap, mapToType } from "./MapToType";
import { UnauthorizedError } from "../../types/error";
import { supplierKeyMap } from "./SupplierRepository";
import { Supplier } from "../../models/Supplier";

const apiKeyKeyMap: KeyMap<ApiKeyDTO> = {
    id: 'id',
    key: 'key',
    supplierId: 'supplier_id',
    supplier: {
        key: 'fournisseurs',
        transform: (value) => mapToType<Supplier>(value, supplierKeyMap)
    },
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    expiresAt: 'expires_at'
}

export class ApiKeyRepository implements IApiKeyRepository {
    private readonly supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async readByKey(key: string): Promise<ApiKey> {
        const { data, error } = await this.supabase.from('api_keys').select('*, fournisseurs(*)').eq('key', key).single();
        if (error) throw new UnauthorizedError('Invalid API key');
        return new ApiKey(mapToType<ApiKeyDTO>(data, apiKeyKeyMap));
    }
}