'use server';

import { exportAccountingCheckoutsUseCase } from "@repo/core/usecases";

export type ExportCheckoutsFileResult = {
    success: boolean;
    error?: string;
    url?: string;
}

export const exportCheckoutsFile = async (dateDebut: string, dateFin: string): Promise<ExportCheckoutsFileResult> => {
    try {
        const url = await exportAccountingCheckoutsUseCase(dateDebut, dateFin);
        return {
            success: true,
            url: url
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Une erreur est survenue, veuillez réessayer plus tard"
        }
    }
}