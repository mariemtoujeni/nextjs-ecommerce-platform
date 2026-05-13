import { Client, Opinion, OpinionFilter, opinionInput } from "../models";
import { ReturnAll } from "../types";

export interface IOpinionRepository {
    read(options: OpinionFilter): Promise<ReturnAll<Opinion>>;
    createOpinion(opinion: Opinion): Promise<Opinion>;
    readOpinionById(id: number): Promise<Opinion | null>;
    updateOpinion(opinion: Opinion): Promise<Opinion>;
    deleteOpinion(id: number): Promise<void>;
    readOpinionByUserId(userId: number): Promise<Opinion[]>;
    readOpinionByProductId(productId: number): Promise<Opinion[]>;
    readProductOpinion(productId: number): Promise<number | null>;
    addOpinion(input: opinionInput,client: Client):Promise<Opinion>
}