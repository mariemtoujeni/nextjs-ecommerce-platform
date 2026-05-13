import { ApiKey } from "../../models";
import { IApiKeyRepository } from "../../repositories";
import { SharedMemory } from "./SharedMemory";
import { NotFoundError } from "../../types/error";

export class MockApiKeyRepository implements IApiKeyRepository {
    async readByKey(key: string): Promise<ApiKey> {
        const apiKey = SharedMemory.apiKeys.find(k => k.key === key);
        
        if(!apiKey) {
            throw new NotFoundError("ApiKey not found: " + key);
        }

        return apiKey;
    } 
}