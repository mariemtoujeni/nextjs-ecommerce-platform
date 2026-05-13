import { BrandFilter, IBrandRepository } from "../../repositories/IBrandRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { Brand } from "../../models/Category";
import { BadRequestError } from "../../types/error";
import { ReturnAll } from "../../types/utils";
import { KeyMap, mapToType } from "./MapToType";

const brandKeyMap: KeyMap<Brand> = {
    id: "id",
    name: "nom",
}

export class BrandRepository implements IBrandRepository {
    private supabase: SupabaseClient;
    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async readAll(options: BrandFilter): Promise<ReturnAll<Brand>> {
        const startOffset = options.offset * options.limit;
        const endOffset = startOffset + options.limit - 1;
        const orderCol = options.sort.includes("name") ? "nom" : "id";
        const orderAsc = options.sort.includes("asc");

        const { data, error, count } = await this.supabase.from("marques")
        .select("*", { count: "exact" })
        .order(orderCol, { ascending: orderAsc })
        .range(startOffset, endOffset);

        if (error) {
            throw new BadRequestError(error.message);
        }
        return { items: data.map(item => mapToType<Brand>(item, brandKeyMap))
            , total: data.length, count: data.length 
        };
    }
}