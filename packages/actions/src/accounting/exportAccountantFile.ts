'use server';

import { exportAccountingOnlineUseCase } from "@repo/core/usecases";

export type ExportAccountantFileResult = {
    success: boolean;
    error?: string;
    url?: string;
}

export const exportAccountantFile = async (dateDebut: string, dateFin: string): Promise<ExportAccountantFileResult> => {
    try {
        const url = await exportAccountingOnlineUseCase(dateDebut, dateFin);
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