"use server"
import { ReturnOne } from "@repo/core/types";
import { createThreadId } from "@repo/core/usecases";

export const createThreadAction = async () : Promise<ReturnOne<string>> => {
    try {
        const threadId = await createThreadId();
        return {
            item: threadId.threadId,
            error: undefined
        }
    } catch (error: any) {
        return {
            item: "",
            error: error.message
        }
    }
}