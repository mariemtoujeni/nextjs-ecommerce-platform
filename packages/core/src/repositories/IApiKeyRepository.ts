import { ApiKey, Supplier } from "../models";

export interface IApiKeyRepository {
    readByKey(key: string): Promise<ApiKey>;
}