import { SupabaseClient } from "@supabase/supabase-js";
import { IInventoryRepository } from "../../repositories";
import { InventoryFilter, Inventory, InventoryFilterTypeAdmin, InventoryInput, InventoryLine } from "../../models/Inventory";
import { ActiveFilter, ReturnAll } from "../../types/utils";
import { KeyMap, mapToType } from "./MapToType";
import { ModelProductDetail } from "../../models/Checkout";
import { ProductDescription, ProductImage } from "../../models/Product";
import { productImageKeyMap } from "./ProductRepository";
import { ModelAttributValue } from "../../models";
import { modelAttributValueKeyMap } from "./ModelRepository";
import { InternalServerError, NotFoundError } from "../../types/error";

const inventoryKeyMap: KeyMap<Inventory> = {
    id: "id",
    name: "nom",
    valorisation: "valorisation",
    createdAt: "date_creation",
    status: "statut"
}

export const ModelProductDetailKeyMap2: KeyMap<ModelProductDetail> = {
    name: {
        key: "produits",
        transform: (produit) => 
            produit?.produit_descriptions?.find((desc: ProductDescription) => desc.lang === 'fr')?.titre ?? ""
    },
    attributs: {
        key: "modele_attribut_valeurs",
        transform: (atts) => atts?.map((a: any) => a.attribut_valeurs?.nom) ?? []
    },
    price: "prix_vente_ht",
    image: {
        key: "produits",
        transform: (produit) => `/api/assets/${produit?.produit_images?.[0]?.url ?? ""}`
    },
    codeBar: "modeles_admin.code_barre",
    img: {
            key: 'produits.produit_images',
            transform: (value) => Array.isArray(value)
                ? value.map(img => mapToType<ProductImage>(img, productImageKeyMap))
                : []
    },
    attributValues: {
        key: 'modele_attribut_valeurs',
        transform: (value) => Array.isArray(value)
            ? value.map(attribute => mapToType<ModelAttributValue>(attribute, modelAttributValueKeyMap))
            : []
    }
};

const inventoryLineKeyMap: KeyMap<InventoryLine> = {
    inventoryId: "id_inventaire",
    modelId: "id_modele",
    quantity: "quantite",
    purchasePriceHT: "prix_achat_ht",
    model: {
        key: 'modeles',
        transform: (value) => (
            mapToType<ModelProductDetail>(value, ModelProductDetailKeyMap2))
    }
}

type FilterMappingReturn = {
    column: string;
    query: string;
    filterValues: string[];
}
type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => FilterMappingReturn;
export const inventoryFilter: Record<InventoryFilterTypeAdmin, FilterMappginFunction> = {
    [InventoryFilterTypeAdmin.STATE]: (baseQuery, filter) => ({
        column: "statut",
        query: baseQuery,
        filterValues: filter.values as string[]
    })
}

export class InventoryRepository implements IInventoryRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
      this.supabase = supabase;
  }    

  private async recalculateValorisation(inventoryId: number): Promise<void> {
      const { data: lines, error: fetchError } = await this.supabase
          .from("inventaires_lignes")
          .select("quantite, prix_achat_ht")
          .eq("id_inventaire", inventoryId);

      if (fetchError) {
          throw new InternalServerError(fetchError.message);
      }

      const totalValorisation = lines?.reduce((sum, line, index) => {
          const quantity = parseFloat(line.quantite as any) || 0;
          const price = parseFloat(line.prix_achat_ht as any) || 0;
          const lineTotal = quantity * price;

          return sum + lineTotal;
      }, 0) ?? 0;

      const { error: updateError } = await this.supabase
          .from("inventaires")
          .update({ valorisation: parseFloat(totalValorisation.toFixed(2)) })
          .eq("id", inventoryId);

      if (updateError) {
          throw new InternalServerError(updateError.message);
      }
  }



  async getInventoryLines(inventoryId: number, options: InventoryFilter): Promise<ReturnAll<InventoryLine>> {
        const startOffset = options.offset * options.limit;
        const endOffset = startOffset + options.limit - 1;

        let baseQuery = this.supabase.from("inventaires_lignes").select("*, modeles!inner(*, modeles_admin(*), modele_attribut_valeurs(*, attribut_valeurs(*)), produits(*, produit_descriptions(*), produit_images(*)))", { count: 'exact' })
  					.eq('id_inventaire', inventoryId)
					.gt('quantite', 0)
					.range(startOffset, endOffset)
                    .order('id_inventaire', { ascending: options.sort === 'asc' })   
        if (options.search) {
            const searchAsNumber = parseInt(options.search);

            if (!isNaN(searchAsNumber)) {
                baseQuery.eq('id_modele', searchAsNumber);
            } else {
                //baseQuery = baseQuery.or(`nom.ilike.%${options.search}%`);
            }
        }

    	const inventaires = await baseQuery;
        if (inventaires.error) throw new NotFoundError(inventaires.error.message);
    
        return {
					items: inventaires?.data ? inventaires.data.map(inventoryLine => mapToType<InventoryLine>(inventoryLine, inventoryLineKeyMap)) : [],
					total: inventaires?.count ?? 0,
					count: inventaires?.data ? inventaires.data.length : 0,
        };
    }

  async deleteInventoryLine(inventoryId: number, modelId: number): Promise<void> {
    const { error } = await this.supabase.from('inventaires_lignes').delete()
                                         .eq('id_inventaire', inventoryId)
                                         .eq('id_modele', modelId)
    if (error) throw new InternalServerError(error.message);
    await this.recalculateValorisation(inventoryId);
  }

  async updateInventoryLine(inventoryLine: InventoryLine): Promise<InventoryLine> {
        const { data, error } = await this.supabase.from('inventaires_lignes').update({
            quantite: inventoryLine.quantity,
            prix_achat_ht: inventoryLine.purchasePriceHT,
        }).eq('id_inventaire', inventoryLine.inventoryId)
          .eq('id_modele', inventoryLine.modelId)
          .select("*, modeles!inner(*, modeles_admin(*), modele_attribut_valeurs(*, attribut_valeurs(*)), produits(*, produit_descriptions(*), produit_images(*)))").maybeSingle();
        if (error) throw new InternalServerError(error.message);
        await this.recalculateValorisation(inventoryLine.inventoryId);

        return mapToType<InventoryLine>(data, inventoryLineKeyMap);
    }

  async createInventoryLine(inventoryLine: InventoryLine): Promise<InventoryLine> {

        const { data, error } = await this.supabase.from('inventaires_lignes').insert({
            id_inventaire: inventoryLine.inventoryId,
            id_modele: inventoryLine.modelId,
            quantite: inventoryLine.quantity,
            prix_achat_ht: inventoryLine.purchasePriceHT,
        }).select("*, modeles!inner(*, modeles_admin(*), modele_attribut_valeurs(*, attribut_valeurs(*)), produits(*, produit_descriptions(*), produit_images(*)))")
          .maybeSingle();

        if (error) throw new InternalServerError(error.message);
        await this.recalculateValorisation(inventoryLine.inventoryId);
        return mapToType<InventoryLine>(data, inventoryLineKeyMap);
    }

  async updateInventory(inventory: Inventory): Promise<Inventory> {
        const { data, error } = await this.supabase.from('inventaires').update({
            nom: inventory.name,
            valorisation: inventory.valorisation,
            date_creation: inventory.createdAt,
            statut: inventory.status,
        }).eq('id', inventory.id).select().maybeSingle();
        if (error) throw new InternalServerError(error.message);

        return mapToType<Inventory>(data, inventoryKeyMap);
    }

  async createInventory(inventory: InventoryInput): Promise<Inventory> {
        const { data, error } = await this.supabase.from('inventaires').insert({
            nom: inventory.name,
            valorisation: inventory.valorisation,
            date_creation: inventory.createdAt,
            statut: inventory.status,
        }).select("*").single();
        if (error) throw new InternalServerError(error.message);

        return mapToType<Inventory>(data, inventoryKeyMap);
    }

  
  async readById(id: number): Promise<Inventory> {
        const { data, error } = await this.supabase.from('inventaires').select('*').eq('id', id).single();
        if (error) throw new Error(`find by Id failed: ${error.message}`);

        return mapToType<Inventory>(data, inventoryKeyMap);
    }


  async read(options: InventoryFilter): Promise<ReturnAll<Inventory>> {
        const startOffset = options.offset * options.limit;
        const endOffset = startOffset + options.limit - 1;
        

        let querySelect = '*';
        const filterToApply: FilterMappingReturn[] = [];
        if (options.filters) {
            options.filters.forEach(filter => {
                const newFilter = inventoryFilter[filter.key as InventoryFilterTypeAdmin](querySelect, filter);
                filterToApply.push(newFilter);
                querySelect = newFilter.query;
            });
        }
        let baseQuery = this.supabase.from('inventaires')
            .select(querySelect, { count: 'exact' })
            .range(startOffset, endOffset)
            .order('id', { ascending: options.sort === 'asc' })


        if (options.search) {
            const searchAsNumber = parseInt(options.search);

            if (!isNaN(searchAsNumber)) {
                baseQuery.eq('id', searchAsNumber);
            } else {
                baseQuery = baseQuery.or(`nom.ilike.%${options.search}%`);
            }
        }
        
        filterToApply.forEach(filter => {
            baseQuery.in(filter.column, filter.filterValues);
        });

        const inventaires = await baseQuery;
        if (inventaires.error) throw new NotFoundError(inventaires.error.message);

        return {
        items: inventaires?.data ? inventaires.data.map(inventory => mapToType<Inventory>(inventory, inventoryKeyMap)) : [],
        total: inventaires?.count ?? 0,
        count: inventaires?.data ? inventaires.data.length : 0,
        };
    }

}