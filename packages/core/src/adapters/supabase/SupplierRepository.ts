import { ISupplierRepository } from "../../repositories/ISupplierRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { Supplier, SupplierFilter, SupplierInput } from "../../models/Supplier";
import { BadRequestError } from "../../types/error";
import { ReturnAll } from "../../types/utils";
import { KeyMap, mapFromType, mapToType } from "./MapToType";

export const supplierKeyMap: KeyMap<Supplier> = {
    id: "id",
    name: "nom",
    code: "code",
    address: "adresse",
    zipCode: "code_postal",
    city: "ville",
    country: "pays",
    phone: "tel",
    email: "email",
    siret: "siret",
}

export class SupplierRepository implements ISupplierRepository {
    private supabase: SupabaseClient;
    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async readAll(options: SupplierFilter): Promise<ReturnAll<Supplier>> {
        const startOffset = options.offset * options.limit;
        const endOffset = startOffset + options.limit - 1;
        const orderCol = options.sort.includes("name") ? "name" : "id";
        const orderAsc = options.sort.includes("asc");

        const { data, error, count } = await this.supabase.from("fournisseurs")
        .select("*", { count: "exact" })
        .order(orderCol, { ascending: orderAsc })
        .range(startOffset, endOffset);

        if (error) {
            throw new BadRequestError(error.message);
        }
        
        return { items: data.map(item => mapToType<Supplier>(item, supplierKeyMap))
            , total: data.length, count: count ?? 0
        };
    }

    async create(supplier: SupplierInput): Promise<Supplier> {

        // read all suppliers
        const { count, error: suppliersError } = await this.supabase.from("fournisseurs").select("*", { count: "exact" });
        if (suppliersError) {
            throw new BadRequestError(suppliersError.message);
        }       

        const supplierToCreate  = mapFromType<SupplierInput>(supplier, supplierKeyMap);
        
        // Ajouter le code généré à l'objet
        supplierToCreate.code = `F_${((count ?? 0) + 1).toString().padStart(4, '0')}`;
        supplierToCreate.adresse_comp = "-";
        supplierToCreate.fax = "-";
        supplierToCreate.siret = "-";
        supplierToCreate.siren = "-";
        supplierToCreate.ape = "-";
        supplierToCreate.num_intra_commu = "-";
        supplierToCreate.num_compte_aux = "-";


        console.log(supplierToCreate);

        const { data, error } = await this.supabase.from("fournisseurs").insert(supplierToCreate).select("*").single();
        if (error) {
            throw new BadRequestError(error.message);
        }
        const newSupplier = mapToType<Supplier>(data, supplierKeyMap);
        return newSupplier;
    }
}