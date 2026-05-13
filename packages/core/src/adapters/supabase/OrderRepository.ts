import { AdminOrder, Order, OrderAddress, OrderInput, OrderSupplierLine, 
  OrderWithClient, OrderPresenter, OrderLine, OrderWithAdmin, OrderLineInput, AdminOrderFilterType} from "../../models/Order";
import { KeyMap, mapFromType, mapToType } from "./MapToType";
import { SupabaseClient } from "@supabase/supabase-js";
import { IOrderRepository, ReadOrderProps } from "../../repositories/IOrderRepository";
import { BadRequestError, InternalServerError, NotFoundError } from "../../types/error";
import { ActiveFilter, ReturnAll } from "../../types";
import { Client } from "../../models/Client";
import { clientKeyMap } from "./ClientRepository";
import { ModelProductDetail } from "../../models/Checkout";
import { ModelProductDetailKeyMap } from "./CheckoutRepository";
import { ModelProductDetailKeyMap2 } from "./InventoryRepository";



const orderKeyMap: KeyMap<Order> = {
  id: "id",
  clientId: "numero_client",
  status: "statut",
  amount: "montant",
  deliveryFees: "frais_port",
  withoutVAT: "sans_tva",
  quotation: "devis",
  deliveryMode: "mode_livraison",
  usedCredit: "credit_utilise",
  totalDiscount: "total_reductions",
  authorisation: "autorisation",
  paymentMode: "mode_paiement",
  authorisationDate: {
    key: "date_autorisation",
    transform: (value) => new Date(value)
  },
  createdAt: {
    key: "date_creation",
    transform: (value) => new Date(value)
  },
  usedPoints: "points_utilise",
  clientComment: "commentaire_client",
  boutique: "boutique"
}

export const orderAdressKeyMap: KeyMap<OrderAddress> = {
  orderId: "id_commande",
  type: "type",
  relaisId: "id_relais",
  company: "societe",
  lastName: "prenom",
  firstName: "nom",
  address: "adresse",
  address2: "adressse2",
  address3: "adresse3",
  postCode: "code_postal",
  city: "ville",
  country: "pays",
}

export const adminOrderKeyMap: KeyMap<AdminOrder> = {
  orderId: "id_commande",
  internalComment: "commentaire_interne",
  etat: "etat"
}

export const orderWithClientKeyMap: KeyMap<OrderWithClient> = {
  ...orderKeyMap,
  client: {
    key: 'clients',
    transform: (value) => mapToType<Client>(value, clientKeyMap)
  },
  addresses: {
    key: 'commande_adresses',
    transform: (value) => Array.isArray(value) ? value.map((v) => mapToType<OrderAddress>(v, orderAdressKeyMap)) : []
  }
}

export const orderLineKeyMap: KeyMap<OrderLine> = {
  id: "id",
  orderId: "id_commande",
  modelId: "id_modele",
  reductionType: "type_reduction",
  reductionValueType: "type_valeur_reduction",
  reductionValue: "valeur_reduction",
  reductionInfo: "info_reduction",
  barCode: "code_barre",
  manufacturerRef: "reference_fabricant",
  name: "intitule",
  quantity: "quantite",
  unitPriceExclTax: "prix_unitaire_ht",
  vat: "tva",
  totalPriceInclTax: "prix_total_ttc",
  totalPriceExclTax: "prix_total_ht",
  giftVoucher: "cheque_cadeau",
  voucherDuration: "cheque_duree",
  weight: "poids",
  comment: "commentaire",
  available: "disponible",
  textPersonnalisation: "text_personnalisation",
   typePersonnalisation: "type_personnalisation",
  createdAt: {
    key: "date_creation",
    transform: (value) => new Date(value)
  },
  returnedAt: {
    key: "date_retour",
    transform: (value) => value ? new Date(value) : undefined
  },
  model: {
    key: 'modeles',
    transform: (value) => mapToType<ModelProductDetail>(value, ModelProductDetailKeyMap2)
  },
 
}
export const orderPresenterKeyMap: KeyMap<OrderPresenter> = {
  ...orderKeyMap,
  client: {
    key: 'clients',
    transform: (value) => mapToType<Client>(value, clientKeyMap)
  },
  lines: {
    key: 'commande_lignes',
    transform: (value) => Array.isArray(value) ? value.map((v) => mapToType<OrderLine>(v, orderLineKeyMap)) : []
  }
}

type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => any;
export const orderFilter: Record<AdminOrderFilterType, FilterMappginFunction> = {
  [AdminOrderFilterType.STATUS]: (baseQuery, filter) => {
    const values = filter.values as string[];
    baseQuery.in('statut', values);
    return baseQuery;
  },
  [AdminOrderFilterType.BOUTIQUE]: (baseQuery, filter) => {
    const values = filter.values as string[];
    baseQuery.in('boutique', values);
    return baseQuery;
  },
  [AdminOrderFilterType.MODE_LIVRAISON]: (baseQuery, filter) => {
    const values = filter.values as string[];
    baseQuery.in('mode_livraison', values);
    return baseQuery;
  },
  [AdminOrderFilterType.DEVIS]: (baseQuery, filter) => {
    const values = filter.values as string[];
    baseQuery.eq('devis', values[0] === 'OUI');
    return baseQuery;
  }
}

export const orderWithAdminKeyMap: KeyMap<OrderWithAdmin> = {
  ...orderWithClientKeyMap,
  'comment': 'commandes_admin.commentaire_interne',
  'state': 'commandes_admin.etat',
  'client': {
    key: 'clients',
    transform: (value) => mapToType<Client>(value, clientKeyMap)
  },
  'lines': {
    key: 'commande_lignes',
    transform: (value) => Array.isArray(value) ? value.map((v) => mapToType<OrderLine>(v, orderLineKeyMap)) : []
  }
}

export class OrderRepository implements IOrderRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  async createOrderLine(orderLines: OrderLineInput[]): Promise<OrderLine[]> {
    const { data, error } = await this.supabase
      .from('commande_lignes')
      .insert(
        orderLines.map((orderLine) => ({
          id_commande: orderLine.orderId,
          id_modele: orderLine.modelId,
          type_reduction: orderLine.reductionType,
          type_valeur_reduction: orderLine.reductionValueType,
          code_barre: orderLine.barCode,
          reference_fabricant: orderLine.manufacturerRef,
          intitule: orderLine.name,
          quantite: orderLine.quantity,
          prix_unitaire_ht: orderLine.unitPriceExclTax,
          tva: orderLine.vat,
          prix_total_ht: orderLine.totalPriceExclTax,
          prix_total_ttc: orderLine.totalPriceExclTax,
          cheque_cadeau: orderLine.giftVoucher,
          cheque_duree: orderLine.voucherDuration,
          poids: orderLine.weight,
          commentaire: orderLine.comment,
          valeur_reduction: orderLine.reductionValue,
          info_reduction: orderLine.reductionInfo,
          disponible: orderLine.available,
          text_personnalisation: orderLine.textPersonnalisation,
          type_personnalisation: orderLine.typePersonnalisation,
        }))
      )
      .select("*");      

    if (error) throw new InternalServerError(error.message);
    return data.map((row) => mapToType<OrderLine>(row, orderLineKeyMap));
  }


  
  async createOrderSupplierLine(orderSupplierLine: OrderSupplierLine): Promise<OrderSupplierLine> {
    throw new Error("Method not implemented.");
  }

  async createAdminOrder(adminOrder: AdminOrder): Promise<AdminOrder> {
    const { data, error } = await this.supabase.from('commandes_admin').insert({
      id_commande: adminOrder.orderId,
      commentaire_interne: adminOrder.internalComment,
      etat: adminOrder.etat,
    }).select("*").single();

    if (error) throw new InternalServerError(error.message);
    return mapToType<AdminOrder>(data, adminOrderKeyMap);
  }

  async createOrderAddress(orderAddress: OrderAddress): Promise<OrderAddress> {

    const { data, error } = await this.supabase.from('commande_adresses').insert({
      id_commande: orderAddress.orderId,
      type: orderAddress.type,
      id_relais: orderAddress.relaisId,
      societe: orderAddress.company,
      nom: orderAddress.lastName,
      prenom: orderAddress.firstName,
      adresse: orderAddress.address,
      adresse2: orderAddress.address2,
      adresse3: orderAddress.address3,
      code_postal: orderAddress.postCode,
      ville: orderAddress.city,
      pays: orderAddress.country,
    }).select("*").single();

    if (error) throw new InternalServerError(error.message);
    return mapToType<OrderAddress>(data, orderAdressKeyMap);
  }

  async createOrder(order: OrderInput): Promise<Order> {

    const { data, error } = await this.supabase.from('commandes').insert({
      numero_client: order.clientNumber,
      statut: order.status,
      montant: order.amount,
      frais_port: order.deliveryFees,
      sans_tva: order.withoutVAT,
      devis: order.quotation,
      mode_livraison: order.deliveryMode,
      credit_utilise: order.usedCredit,
      total_reductions: order.totalDiscount,
      autorisation: order.authorisation,
      mode_paiement: order.paymentMode,
      date_autorisation: (new Date()).toISOString()
    }).select("*").single();

    if (error) throw new InternalServerError(error.message);
    return mapToType<Order>(data, orderKeyMap);
  }

  async createOrderLines(orderLines: OrderLineInput[]): Promise<OrderLine[]> {
    const { data, error } = await this.supabase.from('commande_lignes').insert(orderLines.map((orderLine) => mapFromType(orderLine, orderLineKeyMap))).select("*");
    if (error) throw new InternalServerError(error.message);
    return data ? data.map(orderLine => mapToType<OrderLine>(orderLine, orderLineKeyMap)) : [];
  }

  async read(clientNumber: number): Promise<Order[]> {
    const { data, error } = await this.supabase.from('commandes')
      .select('*')
      .eq('numero_client', clientNumber);
    if (error) {
      throw new NotFoundError(error.message);
    }

    return data ? data.map(order => mapToType<Order>(order, orderKeyMap)) : [];

  }

  async readById(id: number): Promise<Order> {
    const { data, error } = await this.supabase.from('commandes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new NotFoundError(error.message);
    return mapToType<Order>(data, orderKeyMap);
  }

  async readAllOrderPresenter(props: ReadOrderProps): Promise<ReturnAll<OrderPresenter>> {
    const { limit, offset, sort, search, filters } = props.options || {};
    const startOffset = (offset ?? 0) * (limit ?? Number.MAX_SAFE_INTEGER);
    const endOffset = startOffset + (limit ?? Number.MAX_SAFE_INTEGER) - 1;

    if(search && search !== '') {
        const idCommande = parseInt(search);
        if(!isNaN(idCommande) || search === "NATAQUASHOP" || search === "SWIMWEAR" || search === "CRAZYSWIM") { 
          let query = this.supabase.from('commandes')
            .select("*, clients!inner(*, clubs!id_club(*)), commande_lignes!inner(*, modeles!inner(*, produits!inner(*, produit_descriptions!inner(*))))", { count: 'exact' })
            .eq('devis', false);

          if(props.clientNumber) {
            query.eq('numero_client', props.clientNumber);
          }
          if(props.orderNumber) {
            query.eq('id', props.orderNumber);
          }
          if(props.startDate && props.endDate) {
            query.gte('date_creation', new Date(props.startDate).toISOString());
            query.lte('date_creation', new Date(props.endDate).toISOString());
          }

          if(search === "NATAQUASHOP" || search === "SWIMWEAR" || search === "CRAZYSWIM") {
            query.eq('boutique', search);
          } else if(!isNaN(idCommande)) {
            query.eq('id', idCommande);
          }

          if(filters) {
            filters.forEach(filter => {
              const filterKey = filter.key as AdminOrderFilterType;
              query = orderFilter[filterKey](query, filter);
            });
          }
    
          query = query.order('date_creation', { ascending: sort === 'asc' });
          query = query.range(startOffset, endOffset);
    
          const { data: ordersData, error: ordersError, count: totalOrders } = await query;
          if (ordersError) throw new InternalServerError(ordersError.message);
    
          if (!ordersData || ordersData.length === 0) { 
            return {
              total: 0,
              count: 0,
              items: []
            };
          }
    
          const orders : OrderPresenter[] = ordersData.map((order: any) => mapToType<OrderPresenter>(order, orderPresenterKeyMap));
    
          return {
            items: orders,
            total: totalOrders ?? 0,
            count: orders.length
          }          
        } else {          
          let query = this.supabase.from('clients')
            .select('*')
            .or(`nom.ilike.%${search}%,prenom.ilike.%${search}%, email.ilike.%${search}%`)
            .limit(1);

          const { data: clientsData, error: clientsError, count: totalClients } = await query;
          if (clientsError) throw new InternalServerError(clientsError.message);

          const clientNumber = clientsData?.length > 0 ? clientsData[0].numero_client : null;

          let query2 = this.supabase.from('commandes')
            .select('*, clients!inner(*, clubs!id_club(*)), commande_lignes!inner(*, modeles!inner(*, produits!inner(*, produit_descriptions!inner(*))))', { count: 'exact' })
            .eq('numero_client', clientNumber);

          const { data: ordersData, error: ordersError, count: totalOrders } = await query2;
          if (ordersError) throw new InternalServerError(ordersError.message);

          if (!ordersData || ordersData.length === 0) { 
            return {
              total: 0,
              count: 0,
              items: []
            };
          }
          
          const orders : OrderPresenter[] = ordersData.map((order: any) => mapToType<OrderPresenter>(order, orderPresenterKeyMap));

          return {
            items: orders,
            total: totalOrders ?? 0,
            count: orders.length
          }
        }
    } else {
      let query = this.supabase.from('commandes')
        .select("*, clients!inner(*, clubs!id_club(*)), commande_lignes!inner(*, modeles!inner(*, produits!inner(*, produit_descriptions!inner(*))))", { count: 'exact' })
        .eq('devis', false);

      if(props.clientNumber) {
        query.eq('numero_client', props.clientNumber);
      }
      if(props.orderNumber) {
        query.eq('id', props.orderNumber);
      }
      if(props.startDate && props.endDate) {
        query.gte('date_creation', new Date(props.startDate).toISOString());
        query.lte('date_creation', new Date(props.endDate).toISOString());
      }

      if(filters) {
        filters.forEach(filter => {
          const filterKey = filter.key as AdminOrderFilterType;
          query = orderFilter[filterKey](query, filter);
        });
      }

      query = query.order('date_creation', { ascending: sort === 'asc' });
      query = query.range(startOffset, endOffset);

      const { data: ordersData, error: ordersError, count: totalOrders } = await query;
      if (ordersError) throw new InternalServerError(ordersError.message);

      if (!ordersData || ordersData.length === 0) { 
        return {
          total: 0,
          count: 0,
          items: []
        };
      }

      const orders : OrderPresenter[] = ordersData.map((order: any) => mapToType<OrderPresenter>(order, orderPresenterKeyMap));

      return {
        items: orders,
        total: totalOrders ?? 0,
        count: orders.length
      }
    }
  }

  async readAll(props: ReadOrderProps): Promise<ReturnAll<OrderWithClient>> {
    const { limit, offset, sort, search, filters } = props.options || {};
    const startOffset = (offset ?? 0) * (limit ?? Number.MAX_SAFE_INTEGER);
    const endOffset = startOffset + (limit ?? Number.MAX_SAFE_INTEGER) - 1;

    let query = this.supabase.from('commandes')
      .select("*, clients!inner(*, clubs!id_club(*))", { count: 'exact' })
      .eq('devis', false);

    if (props.clientNumber) {
      query.eq('numero_client', props.clientNumber);
    }
    if (props.orderNumber) {
      query.eq('id', props.orderNumber);
    }
    if (props.startDate && props.endDate) {
      query.gte('date_creation', new Date(props.startDate).toISOString());
      query.lte('date_creation', new Date(props.endDate).toISOString());
    }

    if (search && search !== '') {
      query.or(`clients.nom.ilike.%${search}%,clients.prenom.ilike.%${search}%, clients.email.ilike.%${search}%, clients.clubs.nom.ilike.%${search}%`);
    }

    // if(filters) {
    //   filters.forEach(filter => {
    //     const filterKey = filter.key as OrderFilterType;
    //   });
    // }

    query = query.order('date_creation', { ascending: sort === 'asc' });
    query = query.range(startOffset, endOffset);

    const { data: ordersData, error: ordersError, count: totalOrders } = await query;
    if (ordersError) throw new InternalServerError(ordersError.message);

    if (!ordersData || ordersData.length === 0) {
      return {
        total: 0,
        count: 0,
        items: []
      };
    }

    const orders: OrderWithClient[] = ordersData.map((order: any) => mapToType<OrderWithClient>(order, orderWithClientKeyMap));

    return {
      items: orders,
      total: totalOrders ?? 0,
      count: orders.length
    }
  }

  async readAllOrderLines(orderId: number): Promise<ReturnAll<OrderLine>> {
    const { data, error } = await this.supabase.from('commande_lignes')
      .select('*')
      .eq('id_commande', orderId);
    if (error) throw new InternalServerError(error.message);
    return {
      items: data ? data.map(orderLine => mapToType<OrderLine>(orderLine, orderLineKeyMap)) : [],
      total: data?.length ?? 0,
      count: data?.length ?? 0
    };
  }

  async updateOrderLine(orderLine: OrderLineInput): Promise<OrderLine> {
    const { data, error } = await this.supabase.from('commande_lignes')
      .update(mapFromType(orderLine, orderLineKeyMap))
      .eq('id', orderLine.id)
      .select()
      .single();
    if (error) throw new InternalServerError(error.message);
    return mapToType<OrderLine>(data, orderLineKeyMap);
  }

  async updateOrderLines(orderLines: OrderLineInput[]): Promise<OrderLine[]> {
    const updateOrderLinesRequest = this.supabase.from('commande_lignes')
      .update(orderLines.map((orderLine) => mapFromType(orderLine, orderLineKeyMap)));
    if(orderLines.length > 0 && orderLines[0]?.id) {
      updateOrderLinesRequest.in('id', orderLines.map((orderLine) => orderLine.id));
    } 
    
    if(orderLines.length > 0 && orderLines[0]?.orderId) {
      updateOrderLinesRequest.in('id_commande', orderLines.map((orderLine) => orderLine.orderId));
    } 
    
    if(orderLines.length > 0 && orderLines[0]?.modelId) {
      updateOrderLinesRequest.in('id_modele', orderLines.map((orderLine) => orderLine.modelId));
    }

    const { data, error } = await updateOrderLinesRequest.select();
    if (error) {
      throw new InternalServerError(error.message);
    }
    return data ? data.map(orderLine => mapToType<OrderLine>(orderLine, orderLineKeyMap)) : [];
  }

  async readOrderAddress(orderId: number): Promise<OrderAddress[]> {
    const { data, error } = await this.supabase.from('commande_adresses')
      .select('*')
      .eq('id_commande', orderId);
    if (error) throw new NotFoundError(error.message);
    return data ? data.map(orderAddress => mapToType<OrderAddress>(orderAddress, orderAdressKeyMap)) : [];
  
  }

 
  async readAdmin(id: number): Promise<OrderWithAdmin> {
    const { data, error } = await this.supabase
      .from('commandes')
      .select(`
        *,
        commande_lignes(
          *,
          modeles(
            id,
            produits!inner( *, produit_images(*), produit_descriptions(*) ),
            modele_attribut_valeurs( *, attribut_valeurs(*) )
          )
        ),
        clients(*),
        commande_reductions(*),
        commande_adresses(*),
        commandes_admin(*)
      `)
      .eq('id', id)
      .single();

    if(error) throw new BadRequestError(error.message);

    return mapToType<OrderWithAdmin>(data, orderWithAdminKeyMap);
  }
}