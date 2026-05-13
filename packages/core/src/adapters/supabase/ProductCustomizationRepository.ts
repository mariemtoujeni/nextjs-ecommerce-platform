import { Customization } from "../../models/Product";
import { IProductCustomizationRepository } from "../../repositories/IProductCustomizationRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { BadRequestError } from "../../types/error";

export class ProductCustomizationRepository implements IProductCustomizationRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async create(productId: number, customization: Omit<Customization, "id">): Promise<Customization> {
        const { data, error } = await this.supabase.from("produit_personnalisations").insert({
            description: customization.description,
            prix: customization.price,
            id_produit: productId,
        }).select().single();
        if (error) throw new BadRequestError(error.message);
        return {
            id: data.id,
            description: data.description,
            price: data.prix,
        };
    }
    async update(id: number, customization: Omit<Customization, "id">): Promise<void> {
        const { error } = await this.supabase.from("produit_personnalisations").update({
            description: customization.description,
            prix: customization.price,
        }).eq("id", id);
        if (error) throw new BadRequestError(error.message);
    }
    
    async delete(id: number): Promise<void> {
        const { error } = await this.supabase.from("produit_personnalisations").delete().eq("id", id);
        if (error) throw new BadRequestError(error.message);
    }
    
}