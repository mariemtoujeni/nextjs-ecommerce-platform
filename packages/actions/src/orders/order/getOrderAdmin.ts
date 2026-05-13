"use server";
import { getOrderAdmin } from "@repo/core/usecases";
import { redirect } from "next/navigation";
import { encodedRedirect } from "../../utils";

export const getOrderAdminAction = async (id: number): Promise<any> => {
    try {
        return await getOrderAdmin(id);
    } catch(error: any) {
        console.error(error);
        return encodedRedirect('error', '/orders', 'Une erreur est survenue lors de la récupération de la commande' + error.message);
    }
}