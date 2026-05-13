import { ReturnAll } from '../../types/utils';
import { Client, Opinion, opinionInput } from '../../models';
import { IOpinionRepository } from '../../repositories';
import { SharedMemory } from './SharedMemory';

export class MockOpinionRepository implements IOpinionRepository
{
    addOpinion(input: opinionInput, client: Client): Promise<Opinion> {
        throw new Error('Method not implemented.');
    }
    readProductOpinion(productId: number): Promise<number | null> {
        throw new Error('Method not implemented.');
    }

    createOpinion(opinion: Opinion): Promise<Opinion> {
        const newOpinion = { ...opinion, id: SharedMemory.opinions.length + 1 };
        SharedMemory.opinions.push(newOpinion);
        return Promise.resolve(newOpinion);
        
    }
    readOpinionById(id: number): Promise<Opinion | null> {
        const opinion = SharedMemory.opinions.find(opinion => opinion.id === id) || null;
        if (!opinion) {
            return Promise.resolve(null);
        }
        return Promise.resolve(opinion);
        
    }
    updateOpinion(opinion: Opinion): Promise<Opinion> {
        const index = SharedMemory.opinions.findIndex(op => op.id === opinion.id);
        if (index === -1) {
            return Promise.reject(new Error('Opinion not found'));
        }
        SharedMemory.opinions[index] = { ...SharedMemory.opinions[index], ...opinion };
        return Promise.resolve(SharedMemory.opinions[index]);
    }
    deleteOpinion(id: number): Promise<void> {
        const index = SharedMemory.opinions.findIndex(op => op.id === id);
        if (index === -1) {
            return Promise.reject();
        }
        SharedMemory.opinions.splice(index, 1);
        return Promise.resolve();
        
    }
    readOpinionByUserId(userId: number): Promise<Opinion[]> {
        const opinions = SharedMemory.opinions.filter(opinion => opinion.userId === userId);
        if (opinions.length === 0) {
            return Promise.resolve([]);
        }
        return Promise.resolve(opinions);
        
    }
    readOpinionByProductId(productId: number): Promise<Opinion[]> {
        const opinions = SharedMemory.opinions.filter(opinion => opinion.productId === productId);
        if (opinions.length === 0) {
            return Promise.resolve([]);
        }
        return Promise.resolve(opinions);
    }
    async read(): Promise<ReturnAll<Opinion>> {
        const items= SharedMemory.opinions;
        return {
            items,
            total: items.length,
            count: items.length,
    }
    
}
clear(): void {
    SharedMemory.opinions = [];
}
}