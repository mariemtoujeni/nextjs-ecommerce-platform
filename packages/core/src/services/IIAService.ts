import { ReturnAll } from "../types";
import { Product } from "../models";

export type ChatGPTResponse = {
    lang: string;
    content: string;
}

export type TrainingData = {
    input: {
        role: string;
        content: string;
    };
    preferred_output: {
        role: string;
        content: string;
    };
}

export interface IIAService {
    createThread(): Promise<{threadId: string}>;
    generateDescription(threadId?: string, product?: Product): Promise<ChatGPTResponse[]>;
    trainAssistant(products: Product[]): Promise<ReturnAll<TrainingData>>;
    resetThread(): Promise<void>;
    setThread(threadId: string): Promise<void>;
    getCurrentThreadId(): string | null;
}