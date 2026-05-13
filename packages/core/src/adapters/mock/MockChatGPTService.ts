import { InternalServerError } from "../../types/error";
import { ChatGPTResponse, IIAService, TrainingData } from "../../services";
import { Product } from "../../models";
import { ReturnAll } from "../../types/utils";

export class MockChatGPTService implements IIAService {
    private threadId: string | null = null;

    async createThread(): Promise<{threadId: string}> {
        throw new InternalServerError("Not implemented");
    }

    async generateDescription(threadId?: string, product?: Product): Promise<ChatGPTResponse[]> {
        throw new InternalServerError("Not implemented");
    }

    async trainAssistant(products: Product[]): Promise<ReturnAll<TrainingData>> {
        throw new InternalServerError("Not implemented");
    }

    async resetThread(): Promise<void> {
        this.threadId = null;
    }

    async setThread(threadId: string): Promise<void> {
        this.threadId = threadId;
    }

    getCurrentThreadId(): string | null {
        return this.threadId;
    }
}