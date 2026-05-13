"use server";

import { getProductAdmin } from "@repo/core/usecases";
import { notFound } from "next/navigation";

export const getProductAdminAction = async (id: string) => {
    try {
        const product = await getProductAdmin(Number(id));
        return product;
    } catch (error) {
        console.error(error);
        notFound();
    }
}