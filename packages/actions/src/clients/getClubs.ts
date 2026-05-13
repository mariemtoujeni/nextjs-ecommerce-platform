"use server"

import { getClubsUseCase } from "@repo/core/usecases";

export const getClubsAction = async (options?: string) => {
    try 
    {
        const clubs = await getClubsUseCase(options);
        return clubs;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
}