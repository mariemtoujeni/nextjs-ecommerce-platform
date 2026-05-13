import { Address, Cart, CartInput, ClientAddress, Country, CreateAdminAlert, DeliveryCart, 
         DeliveryCartInput, 
         DiscountCart, 
         DiscountCartInput, 
         ModelAttributValue, ModelProduct, OrderDeliveryMode, Stock } from "../../models";
import { ICartRepository } from "../../repositories";
import { SupabaseClient } from "@supabase/supabase-js";
import { KeyMap, mapFromType, mapToType } from "./MapToType";
import { InternalServerError } from "../../types/error";
import { modelWithProductDetailKeyMap } from "./ProductAlertRepository";
import { modelAttributValueKeyMap } from "./ModelRepository";
import { clientAddressKeyMap } from "./ClientRepository";


export const cartKeyMap: KeyMap<Cart> = {
    userId: "id_user",
    modelId: "id_modele",
    quantity: "quantite",
    shipping: "expedition",
    customization: "personnalisation",
    text: "text",
    price: "prix",
    discountType: "type_reduction",
    discountValueType: "type_valeur_reduction",
    discountValue: "valeur_reduction",
    discountInfo: "info_reduction",
    createdAt: "created_at",
    updatedAt: "updated_at",
    textPersonalisation: "text_personnalisation",
    typePersonalisation: "type_personnalisation",
    model: {
        key: 'modeles',
        transform: (value) => mapToType<ModelProduct>(value, modelproductKeyMap)
    },
    
}

export const modelproductKeyMap: KeyMap<ModelProduct> = {
    ...modelWithProductDetailKeyMap,
    attributs: {
        key: 'modele_attribut_valeurs',
        transform: (value) => Array.isArray(value)
            ? value.map(attribute => mapToType<ModelAttributValue>(attribute, modelAttributValueKeyMap))
            : []
    }
}

export const stockKeyMap: KeyMap<Stock> = {
    idModel: "id_modele",
    locked: "bloque",
    disponible: "disponible",
    indisponible: "indisponible",
    updatedAt: "updated_at"
}

export const deliveryCartKeyMap: KeyMap<DeliveryCart> = {
    userId: "id_user",
    deliveryMode: "mode_livraison",
    billingAddressId: "id_adresse_facturation",
    relaisId: "id_relais",
    weight: "poids",
    prix: "prix",
    company: "societe",
    lastName: "nom",
    firstName: "prenom",
    adress: "adresse",
    adress2: "adresse2",
    adress3: "adresse3",
    postCode: "code_postal",
    city: "ville",
    country: "pays",
    clientAddressId: "id_adresse",
    valid: "valide",
    billingAddress: {
        key: 'billing_address',
        transform: (value) => value ? [mapToType<Address>(value, clientAddressKeyMap)] : []
    },
    clientAddress: {
        key: 'client_address',
        transform: (value) => value ? [mapToType<Address>(value, clientAddressKeyMap)] : []
    }

}

export const discountCartKeyMap: KeyMap<DiscountCart> = {
    userId: "id_user",
    id: "id",
    discountType: "type_reduction",
    discountTypeValue: "type_valeur_reduction",
    value: "valeur_reduction",
    info: "info_reduction"
}

export class CartRepository implements ICartRepository {
    
    private supabase: SupabaseClient;
    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
    async updateDiscountCart(discountCart: DiscountCart): Promise<DiscountCart> {
        const { data, error } = await this.supabase
            .from('panier_reduction')
            .update({
                discountType: discountCart.discountType,
                discountTypeValue: discountCart.discountTypeValue,
                value: discountCart.value,
                info: discountCart.info
            })
            .eq('id_user', discountCart.userId)
            .select('*')

        if (error) throw new InternalServerError(error.message);

        return mapToType<DiscountCart>(data, discountCartKeyMap)
    }
    async deleteDiscountCart(userId: string): Promise<void> {
        const { error } = await this.supabase.from('panier_reduction').delete().eq('id_user', userId);
        if (error) throw new InternalServerError(error.message);
    }
    async updateDeliveryPriceForCart(panier: DeliveryCart): Promise<DeliveryCart> {
        if (!panier) throw new InternalServerError("Panier_livraison object is required");

        //get zone for user's pays and mode_livraison
        const { data: zoneData, error: zoneError } = await this.supabase
            .from('livraison_zones_pays')
            .select('zone')
            .eq('pays', panier.country) 
            .eq('mode_livraison', panier.deliveryMode)
            .maybeSingle();

        if (zoneError) throw new InternalServerError(zoneError.message);
        if (!zoneData) throw new InternalServerError('No livraison zone found for pays and mode_livraison');

        //get livraison price for mode_livraison, zone and poids range
        const { data: livraisonData, error: livraisonError } = await this.supabase
            .from('livraisons')
            .select('prix')
            .eq('mode_livraison', panier.deliveryMode)
            .eq('zone', zoneData.zone)
            .lte('poids_min', panier.weight)
            .gt('poids_max', panier.weight)
            .maybeSingle();

        if (livraisonError) throw new InternalServerError(livraisonError.message);
        if (!livraisonData) throw new InternalServerError('No livraison price found for weight and zone');

        //update panier_livraison.prix for user
        const { data: updatedData, error: updateError } = await this.supabase
            .from('panier_livraison')
            .update({ prix: livraisonData.prix })
            .eq('id_user', panier.userId)
            .select('*, client_address:client_adresses!id_adresse (*), billing_address:client_adresses!id_adresse_facturation (*)')
            .maybeSingle();

        if (updateError) throw new InternalServerError(updateError.message);

        return mapToType<DeliveryCart>(updatedData, deliveryCartKeyMap);
    }


    async addDiscountCart(discountCart: DiscountCartInput): Promise<DiscountCart> {
        const { data, error } = await this.supabase.from('panier_reduction').insert({
            id_user: discountCart.userId,
            type_reduction: discountCart.discountType,
            type_valeur_reduction: discountCart.discountTypeValue,
            valeur_reduction: discountCart.value,
            info_reduction: discountCart.info,
        }).select("*").single();
        if (error) throw new InternalServerError(error.message);

        return mapToType<DiscountCart>(data, discountCartKeyMap);
    }

    async getUserDiscountCart(userId: string): Promise<DiscountCart[]> {
    const { data, error } = await this.supabase
        .from('panier_reduction')
        .select('*')
        .eq('id_user', userId);

    if (error) throw new InternalServerError(error.message);
    return data ? data.map(row => mapToType<DiscountCart>(row, discountCartKeyMap)) : []
    }

    async updateStockList(stock: Stock[]): Promise<void> {
       const {data , error} = await this.supabase.from('stocks').upsert(stock.map(st => mapFromType<Stock>(st, stockKeyMap)) )
              .select('')
    }
    
    async getStockList(cart: Cart[]): Promise<Stock[]> {
       const {data , error} = await this.supabase.from('stocks')
              .select('*')
              .in('id_modele', cart.map((p: Cart) => p.modelId));
            
        return data ? data.map(stock => mapToType<Stock>(stock, stockKeyMap)) : []
    }

    async deleteCart(userId: string): Promise<void> {
        const { error } = await this.supabase.from('paniers').delete().eq('id_user', userId);
        if (error) throw new InternalServerError(error.message);
    }

    async getCountryWithoutTVA(code: string): Promise<Country> {
        const { data, error } = await this.supabase.from('pays_sans_tva')
            .select('*').eq('code', code).maybeSingle();
        if (error) throw new InternalServerError(error.message);
        return data;
    }

    async createAdminAlert(data: CreateAdminAlert): Promise<void> {
        await  this.supabase.from('admin_alertes').insert({
        date: new Date().toISOString(), ...data });
    }

    async deleteDeliveryCart(userId: string): Promise<void> {
        const { error } = await this.supabase.from('panier_livraison').delete().eq('id_user', userId);
        if (error) throw new InternalServerError(error.message);
    }

    async getDeliveryCartbyId(userId: string): Promise<DeliveryCart | null> {
        const { data, error } = await this.supabase.from('panier_livraison')
            .select('*, client_address:client_adresses!id_adresse (*), billing_address:client_adresses!id_adresse_facturation (*)')
            .eq('id_user', userId)
            .maybeSingle();
        if (error) throw new InternalServerError(error.message);
        if (!data) {
            return null;
        }
        return mapToType<DeliveryCart>(data, deliveryCartKeyMap);
    }

    async addDeliveryCart(deliveryCart: DeliveryCartInput): Promise<DeliveryCart> {
        const { data, error } = await this.supabase.from('panier_livraison').insert({
            id_user: deliveryCart.userId,
            id_adresse_facturation: deliveryCart.billingAddressId,
            id_adresse: deliveryCart.clientAddressId,
            mode_livraison: deliveryCart.deliveryMode,
            poids: deliveryCart.weight,
            prix: deliveryCart.prix,
            valide: deliveryCart.valid,
            societe: deliveryCart.company,
            nom: deliveryCart.lastName,
            prenom: deliveryCart.firstName,
            adresse: deliveryCart.adress,
            adresse2: deliveryCart.adress2,
            adresse3: deliveryCart.adress3,
            code_postal: deliveryCart.postCode,
            ville: deliveryCart.city,
            pays: deliveryCart.country,
        }).select("*, client_address:client_adresses!id_adresse (*), billing_address:client_adresses!id_adresse_facturation (*)").single();
        if (error) throw new InternalServerError(error.message);

        return mapToType<DeliveryCart>(data, deliveryCartKeyMap);
    }

    async updateDeliveryCart(deliveryCart: DeliveryCart): Promise<DeliveryCart> {
        const { data, error } = await this.supabase
            .from('panier_livraison').update({
                mode_livraison: deliveryCart.deliveryMode,
                id_adresse_facturation: deliveryCart.billingAddressId,
                id_relais: deliveryCart.relaisId,
                poids: deliveryCart.weight,
                prix: deliveryCart.prix,
                societe: deliveryCart.company,
                nom: deliveryCart.lastName,
                prenom: deliveryCart.firstName,
                adresse: deliveryCart.adress,
                adresse2: deliveryCart.adress2,
                adresse3: deliveryCart.adress3,
                code_postal: deliveryCart.postCode,
                ville: deliveryCart.city,
                pays: deliveryCart.country,
                id_adresse: deliveryCart.clientAddressId,
                valide: deliveryCart.valid,              
            })
            .eq('id_user', deliveryCart.userId).select("*, client_address:client_adresses!id_adresse (*), billing_address:client_adresses!id_adresse_facturation (*)").single();
        if (error) throw new InternalServerError(error.message);

        return mapToType<DeliveryCart>(data, deliveryCartKeyMap);
    }

    async updateCartunit(cart: Cart, hasCustomization: boolean): Promise<Cart> {

        const { data, error } = await this.supabase
            .from('paniers')
            .update({
                quantite: cart.quantity,
                prix: cart.price,
                personnalisation: hasCustomization
            })
            .eq('id_user', cart.userId)
            .eq('id_modele', cart.modelId)
            .select('*')

        if (error) throw new InternalServerError(error.message);

        return mapToType<Cart>(data, cartKeyMap)
    }

    async addCartUnit(cart: CartInput, hasCustomization: boolean): Promise<Cart> {
        const { data, error } = await this.supabase.from('paniers').insert({
            id_user: cart.userId,
            id_modele: cart.modelId,
            quantite: cart.quantity,
            prix: cart.price,
            personnalisation: hasCustomization,
            text_personnalisation: cart.textPersonalisation,
            type_personnalisation: cart.typePersonalisation,
        }).select("*").single();
        if (error) throw new InternalServerError(error.message);        

        return mapToType<Cart>(data, cartKeyMap);
    }

    async getCartUnit(userId: string, modelId: number): Promise<Cart | null> {
        const { data, error } = await this.supabase.from('paniers').select('*')
            .eq('id_user', userId)
            .eq('id_modele', modelId)
            .maybeSingle();
        if (error) throw new InternalServerError(error.message);
        if (!data) return null; 
        return mapToType<Cart>(data, cartKeyMap);
    }

    async deleteCartUnit(userId: string, modelId: number): Promise<void> {
        const { error } = await this.supabase.from('paniers').delete().eq('id_user', userId).eq('id_modele', modelId)
        if (error) throw new InternalServerError(error.message);
    }

    async getCustomerCart(userId: string): Promise<Cart[]> {

        const {data, error} = await this.supabase.from('paniers')
            .select(`
                *,
                modeles (
                *,
                produits (*, produit_descriptions (*), produit_images (*, attribut_valeurs(*, attributs(*))) ),
                modele_attribut_valeurs(*, attribut_valeurs(*))
                )
            `)
           .eq('id_user', userId)
           if (error) throw new InternalServerError(error.message);           
        return data ? data.map(cart => mapToType<Cart>(cart, cartKeyMap)) : []
    }

    async updateStock(stock: Stock): Promise<Stock> {
        const { data, error } = await this.supabase
            .from('stocks')
            .update({
                bloque: stock.locked,
                disponible: stock.disponible,
                indisponible: stock.indisponible
            })
            .eq('id_modele', stock.idModel)

            if (error) throw new InternalServerError(error.message);

        return mapToType<Stock>(data, stockKeyMap)
    }
    
    async modelStockAvailable(modelId: number, requestedQty: number): Promise<number> {
    const { data, error } = await this.supabase
        .from('stocks') 
        .select('disponible')
        .eq('id_modele', modelId)
        .maybeSingle();

    if (error) throw new InternalServerError(error.message);
    if (!data) return 0;

    const futureDisponible = data.disponible - requestedQty;
    return futureDisponible;
    }
    
    async getStockByModelId(modelId: number): Promise<Stock> {
        const { data, error } = await this.supabase
            .from('stocks')
            .select('*')
            .eq('id_modele', modelId)
            .maybeSingle();

        if (error) throw new InternalServerError(error.message);
        return mapToType<Stock>(data, stockKeyMap);
    }

}