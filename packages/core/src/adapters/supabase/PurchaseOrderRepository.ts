import { PurchaseOrderLine, PurchaseOrderLineInput, PurchaseOrder, PurchaseOrderInput,
    PurchaseOrderPresenter, PurchaseOrderPresenterInput, 
  PurchaseOrderInput2, PurchaseOrderStatus, 
  PurchaseOrderFilterInput,
  PurchaseOrderFilterType,
  Supplier,
  ShippingDataForSupplier,
  ShippingDataForSupplierPresenter,
  ShippingDataForSupplierLine,
  ShippingDataForSupplierInput,
  ShippingType,
  ShippingStatus
 } from "../../models";
import { KeyMap, mapFromType, mapToType } from "./MapToType";
import { ModelProductDetail, PaymentMethod } from "../../models/Checkout";
import { ModelProductDetailKeyMap } from "./CheckoutRepository";
import { ActiveFilter, ReturnAll, ReturnOne } from "../../types/utils";
import { IPurchaseOrderRepository, ReadPurchaseOrderLineProps } from "../../repositories/IPurchaseOrderRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { supplierKeyMap } from "./SupplierRepository";
import { InternalServerError, NotFoundError } from "../../types/error";

export const expeditionLineKeyMap: KeyMap<ShippingDataForSupplierLine> = {
    id: "id",
    expeditionId: "id_expedition",
    modelId: "id_modele",
    quantity: "quantite",
    checkoutQuantity: "quantite_commande"
  };


export const expeditionKeyMap: KeyMap<ShippingDataForSupplierPresenter> = {
    id: "id",
    orderId: "id_commande",
    purchaseOrderId: "id_commande_fournisseur",
    type: "type",
    createdAt: "date_creation",
    expeditionDate: "date_expedition",
    expectedDate: "date_attente",
    weight: "poids",
    trackingNumber: "numero_suivi",
    status: "etat",
    etiquette: "etiquette",
    lines: {
      key: "expeditions_lignes",
      transform: (value) => value.map((line: any) => mapToType<ShippingDataForSupplierLine>(line, expeditionLineKeyMap))
    }
  };


export const purchaseOrderKeyMap: KeyMap<PurchaseOrder> = {
    id: "id",
    supplierId: "id_fournisseur",
    orderDate: "date_commande",
    paymentMode: "mode_paiement",
    clubId: "id_club",
    deliveryDate: "date_livraison",
    validationDate: "date_validation",
    remise: "remise",
    totalHT: "prix_total_ht",
    valid: "valid",
    shippingFees: "frais_port",
    shippingVAT: "port_tva",
    paymentDelay: "delais_paiement",
    deposit: "accompte",
    createdAt: "date_creation",
    comment: "comment",
    status: "statut"
  };

export const purchaseOrderLineKeyMap: KeyMap<PurchaseOrderLine> = {
    id: "id",
    orderSupplierId: "id_commande_fournisseur",
    modelId: "id_modele",
    validationDate: "date_validation",
    quantity: "quantite",
    receivedQuantity: "quantite_recue",
    unitHtPrice: "prix_unitaire_ht",
    discount: "remise",
    vat: "tva",
    valid: "valid",
    comment: "comment",
    ttcPrice: "prix_ttc",
    modelProduct: {
      key: 'modeles',
      transform: (value) => mapToType<ModelProductDetail>(value, ModelProductDetailKeyMap)
    }
  };

export const mapOrderStatus : Record<PurchaseOrderStatus, string> = {
    [PurchaseOrderStatus.BROUILLON]: "BROUILLON",
    [PurchaseOrderStatus.PARTIELLE]: "PARTIELLE",
    [PurchaseOrderStatus.ENVOYEE]: "ENVOYEE",
    [PurchaseOrderStatus.RECU]: "RECU",
    [PurchaseOrderStatus.ANNULEE]: "ANNULEE"
}

export const mapPaymentMode : Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: "ESPECE",
    [PaymentMethod.CHECK]: "CHEQUE",
    [PaymentMethod.DEBIT_CARD]: "CARTE",
    [PaymentMethod.CREDIT_CARD]: "CARTE",
    [PaymentMethod.TRANSFER]: "VIREMENT",
    [PaymentMethod.OTHER]: "MIXTE"
}

export const mapValid : Record<string, number> = {
    "VALID": 1,
    "INVALID": 0
}

type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => any;
export const purchaseOrderFilter: Record<PurchaseOrderFilterType, FilterMappginFunction> = {
  [PurchaseOrderFilterType.STATUS]: (baseQuery, filter) => {
    const values = filter.values as string[];
    const filterValue = values.map(value => mapOrderStatus[value as PurchaseOrderStatus] ?? value as string);
    return baseQuery.in('statut', filterValue);
  },
  [PurchaseOrderFilterType.MODE_PAIEMENT]: (baseQuery, filter) => {
    const values = filter.values as string[];
    const filterValue = values.map(value => mapPaymentMode[value as PaymentMethod] ?? value as string);
    return baseQuery.in('mode_paiement', filterValue);
  },
  [PurchaseOrderFilterType.VALID]: (baseQuery, filter) => { 
    const values = filter.values as string[];
    const filterValue = values.map(value => mapValid[value as string] ?? Number(value));
    return baseQuery.in('valid', filterValue);
  }
}

export class PurchaseOrderRepository implements IPurchaseOrderRepository {
    private supabase: SupabaseClient;

      constructor(supabase: SupabaseClient) {
          this.supabase = supabase;
      }

      async createPurchaseOrder(purchaseOrder: PurchaseOrderInput): Promise<PurchaseOrder> {

        const newPurchaseOrder = {
          orderDate: purchaseOrder.orderDate,
          paymentMode: purchaseOrder.paymentMode,
          deliveryDate: purchaseOrder.deliveryDate,
          validationDate: purchaseOrder.validationDate,
          remise: purchaseOrder.remise,
          totalHT: purchaseOrder.totalHT,
          valid: purchaseOrder.valid,
          shippingFees: purchaseOrder.shippingFees,
          shippingVAT: purchaseOrder.shippingVAT,
          paymentDelay: purchaseOrder.paymentDelay,
          deposit: purchaseOrder.deposit,
          comment: purchaseOrder.comment,
          status: purchaseOrder.status
        }
    
        const { data, error } = await this.supabase.from('commandes_fournisseur').insert(mapFromType(newPurchaseOrder, purchaseOrderKeyMap)).select("*").single();
        if (error) throw new InternalServerError(error.message);
        return mapToType<PurchaseOrder>(data, purchaseOrderKeyMap);
      }

      async readPurchaseOrderLine(props: ReadPurchaseOrderLineProps): Promise<PurchaseOrderLine | PurchaseOrderLine[]> {
        const purchaseOrderLineRequest =  this.supabase.from('commande_fournisseur_lignes')
          .select('*, commandes_fournisseur!inner(id_fournisseur)');
    
        if (props.supplierId) purchaseOrderLineRequest.eq('commandes_fournisseur.id_fournisseur', props.supplierId);
        if (props.modelId) purchaseOrderLineRequest.eq('id_modele', props.modelId);
        purchaseOrderLineRequest.eq('commandes_fournisseur.valid', false);
        purchaseOrderLineRequest.eq('commandes_fournisseur.statut', PurchaseOrderStatus.BROUILLON);
        
        if (props.supplierId && props.modelId) {
          purchaseOrderLineRequest.limit(1);
          const { data, error } = await purchaseOrderLineRequest;
          if (error) throw new NotFoundError(error.message);
          if (Array.isArray(data)) {
            return mapToType<PurchaseOrderLine>(data[0], purchaseOrderLineKeyMap);
          } else {
            return mapToType<PurchaseOrderLine>(data, purchaseOrderLineKeyMap);
          }
        }
        const { data, error } = await purchaseOrderLineRequest;
        if (error) throw new InternalServerError(error.message);
        return data.map((line: any) => mapToType<PurchaseOrderLine>(line, purchaseOrderLineKeyMap));    
      }
    
      async createPurchaseOrderLine(purchaseOrderLine: PurchaseOrderLineInput): Promise<PurchaseOrderLine> {
        const newPurchaseOrderLine = mapFromType(purchaseOrderLine, purchaseOrderLineKeyMap);
        const { data, error } = await this.supabase.from('commande_fournisseur_lignes').insert(newPurchaseOrderLine).select("*").single();
        if (error) throw new InternalServerError(error.message + " | " + JSON.stringify(newPurchaseOrderLine, null, 2));
        return mapToType<PurchaseOrderLine>(data, purchaseOrderLineKeyMap);
      }
    
      async updatePurchaseOrderLine(purchaseOrderLine: PurchaseOrderLineInput): Promise<PurchaseOrderLine> {
        const updatedPurchaseOrderLine = mapFromType(purchaseOrderLine, purchaseOrderLineKeyMap);
        const { data, error } = await this.supabase.from('commande_fournisseur_lignes')
          .update(updatedPurchaseOrderLine)
          .eq('id', purchaseOrderLine.id)
          .select("*")
          .single();
        if (error) throw new InternalServerError(error.message);
        return mapToType<PurchaseOrderLine>(data, purchaseOrderLineKeyMap);
      }
    
      async deletePurchaseOrderLine(id: number): Promise<void> {
        const { error } = await this.supabase.from('commande_fournisseur_lignes').delete().eq('id', id);
        if (error) throw new InternalServerError(error.message);
      }
    
      async readPurchaseOrder(id: number): Promise<PurchaseOrderPresenter> {    
        const { data : purchaseOrderData, error : purchaseOrderError } = await this.supabase
          .from('commandes_fournisseur')
          .select(`
            *,
            fournisseurs!inner(*),
            commande_fournisseur_lignes!inner(
              *,
              modeles!inner(
                id,
                prix_vente_ht,
                produits(
                  id,
                  prix_vente_ht,
                  tva,
                  produit_descriptions(titre, lang)
                ),
                modele_attribut_valeurs(
                  id_attribut_valeur,
                  attribut_valeurs(
                    nom
                  )
                )
              )
            )
          `)
          .eq('id', id)
          .eq('commande_fournisseur_lignes.modeles.produits.produit_descriptions.lang', 'fr')
          .single();
        if (purchaseOrderError) {      
          throw new InternalServerError(purchaseOrderError.message);
        }
        
        if (!purchaseOrderData) throw new InternalServerError('No purchase order data found');
    
        const purchaseOrder = mapToType<PurchaseOrder>(purchaseOrderData, purchaseOrderKeyMap);

        // Defensive: fournisseurs, expeditions and commande_fournisseur_lignes may be missing or null
        const supplierRaw = (purchaseOrderData as any).fournisseurs;
        const supplier = supplierRaw ? mapToType<Supplier>(supplierRaw, supplierKeyMap) : undefined;
    
        const linesRaw = (purchaseOrderData as any).commande_fournisseur_lignes;
        let purchaseOrderLines : PurchaseOrderLine[] = [];

        const expeditions = await this.supabase.from('expeditions')
          .select('*, expeditions_lignes!id_expedition(*)')
          .eq('id_commande_fournisseur', id)
          .single();
        let mappedExpeditions : ShippingDataForSupplierPresenter | undefined;
        if (!expeditions.error) {
          const expeditionsData = expeditions.data;
          mappedExpeditions = mapToType<ShippingDataForSupplierPresenter>(expeditionsData, expeditionKeyMap);
        }
        
        try {
          if(Array.isArray(linesRaw)) {
            for(const line of linesRaw) {
              let image = '';
              try {
                const productImageRequest = this.supabase.from('produit_images')
                    .select('url')
                    .eq('id_produit', line.modeles.produits.id);
                if(line.modeles.modele_attribut_valeurs.length > 0) {
                  productImageRequest.in('id_attribut_valeur', line.modeles.modele_attribut_valeurs.map((a: { id_attribut_valeur: number }) => a.id_attribut_valeur));
                }
                const productImage = await productImageRequest;                
                if(!productImage.error && productImage.data && productImage.data.length > 0) {
                  image = productImage.data[0]?.url;
                } else {
                  throw new Error('No product image found');
                }
              } catch (error) {
                const productImageRequest = this.supabase.from('produit_images')
                    .select('url')
                    .eq('id_produit', line.modeles.produits.id);
                const productImage = await productImageRequest;
                if(!productImage.error && productImage.data && productImage.data.length > 0) {
                  image = productImage.data[0]?.url;
                }
              }
    
              const modelAdminRequest = this.supabase.from('modeles_admin')
                .select('code_barre')
                .eq('id_modele', line.modeles.id)
                .single();
              const modelAdmin = await modelAdminRequest;
              let codeBar = '';
              if(modelAdmin.data) {
                codeBar = modelAdmin.data?.code_barre;
              }
    
              const purchaseOrderLine = mapToType<PurchaseOrderLine>({
                id: line.id,
                id_commande_fournisseur: line.id_commande_fournisseur,
                id_modele: line.id_modele,
                quantite: line.quantite,
                date_validation: line.date_validation,
                quantite_recue: line.quantite_recue,
                prix_unitaire_ht: line.prix_unitaire_ht,
                tva: line.tva,
                remise: line.remise,
                comment: line.comment,
                modeles: {
                  titre: line.modeles.produits.produit_descriptions[0].titre,
                  attribut_valeurs: line.modeles.modele_attribut_valeurs.map((a: { attribut_valeurs: { nom: string } }) => a.attribut_valeurs.nom),
                  prix_vente_ht: line.modeles.produits.prix_vente_ht,
                  image: image ? `/api/assets/${image}` : '',
                  code_barre: codeBar
                }
              }, purchaseOrderLineKeyMap)
              purchaseOrderLines.push(purchaseOrderLine);
            }
          }
        } catch (error) {
          console.log("ERROR >>>>>>>>>>>> purchaseOrderLines", error);
        }
    
        return {
          ...purchaseOrder,
          supplier,
          lines: purchaseOrderLines,
          expeditions: mappedExpeditions
        };
      }
    
      async listPurchaseOrderPresenter(options?: PurchaseOrderFilterInput): Promise<ReturnAll<PurchaseOrderPresenter>> {
        const { limit, offset, sort, search, filters } = options || {};
        // Récupérer toutes les commandes avec leurs fournisseurs en une seule requête
        let query = this.supabase
          .from('commandes_fournisseur')
          .select('*, fournisseurs!inner(*)', { count: 'exact' })
          .order('date_creation', { ascending: false });
    
        if (filters) {      
          filters.forEach(filter => {
            const filterKey = filter.key as PurchaseOrderFilterType;
            if (purchaseOrderFilter[filterKey]) {
              query = purchaseOrderFilter[filterKey](query, filter);
            }
          });
        }
    
        if (search && search.trim() !== '') {
          const searchLower = search.toLowerCase();
          const searchNumber = parseInt(search);
          if (!Number.isNaN(searchNumber)) {
            query = query.eq('id', searchNumber);
          } else {
            query = query.or(`fournisseurs.nom.ilike.%${search}%,fournisseurs.code.ilike.%${search}%`);
          }
        }
    
        const startOffset = (offset ?? 0) * (limit ?? Number.MAX_SAFE_INTEGER);
        const endOffset = startOffset + (limit ?? Number.MAX_SAFE_INTEGER) - 1;
        query = query.range(startOffset, endOffset);
    
        const { data: ordersData, error: ordersError, count: totalCommandes } = await query.order('id', { ascending: sort === 'asc' });
        
        if (ordersError) {
          throw new InternalServerError(ordersError.message);
        }
    
        if (!ordersData || ordersData.length === 0) {
          return {
            total: 0,
            count: 0,
            items: []
          };
        }
    
        // Récupérer tous les IDs des commandes
        const orderIds = ordersData.map(order => order.id);
    
        // Récupérer toutes les lignes de commande en une seule requête
        const { data: linesData, error: linesError } = await this.supabase
          .from('commande_fournisseur_lignes')
          .select('*')
          .in('id_commande_fournisseur', orderIds);
    
        if (linesError) throw new InternalServerError(linesError.message);
    
        // Grouper les lignes par commande pour un accès O(1)
        const linesByOrderId = new Map<number, any[]>();
        if (linesData) {
          linesData.forEach(line => {
            const orderId = line.id_commande_fournisseur;
            if (!linesByOrderId.has(orderId)) {
              linesByOrderId.set(orderId, []);
            }
            linesByOrderId.get(orderId)!.push(line);
          });
        }
    
        // Construire les présentateurs de commandes
        const purchaseOrdersPresenters: PurchaseOrderPresenter[] = ordersData.map(order => {
          // Mapper la commande directement depuis les données de la base
          const purchaseOrder = mapToType<PurchaseOrder>(order, purchaseOrderKeyMap);
    
          // Récupérer les lignes pour cette commande
          const orderLines = linesByOrderId.get(order.id) || [];
          const lines = orderLines.map((line: any) => mapToType<PurchaseOrderLine>(line, purchaseOrderLineKeyMap));
    
          // Mapper le fournisseur
          const supplier: Supplier | undefined = order.fournisseurs
            ? mapToType<Supplier>(order.fournisseurs, supplierKeyMap)
            : undefined;
    
          return {
            ...purchaseOrder,
            lines,
            supplier
          };
        });
    
        return {
          total: totalCommandes ?? 0,
          count: purchaseOrdersPresenters.length,
          items: purchaseOrdersPresenters
        };
      }

      async listPurchaseOrderLines(id: number): Promise<ReturnAll<PurchaseOrderLine>> {
        const { data: linesData, error: linesError, count: totalLines } = await this.supabase
          .from('commande_fournisseur_lignes')
          .select('*', { count: 'exact' })
          .eq('id_commande_fournisseur', id);
        if(linesError) throw new InternalServerError(linesError.message);

        const mappedLines = linesData.map((line) => mapToType<PurchaseOrderLine>(line, purchaseOrderLineKeyMap));

        return {
          total: totalLines ?? 0,
          count: mappedLines.length,
          items: mappedLines
        };
      }
    
      async createPurchaseOrderPresenter(purchaseOrderToCreate: PurchaseOrderPresenterInput): Promise<PurchaseOrderPresenter> {    
        const finalTotalHT = purchaseOrderToCreate.totalHT;
    
        const newPurchaseOrder : PurchaseOrderInput2 = {
          createdAt: new Date(),
          orderDate: purchaseOrderToCreate.orderDate,
          paymentMode: purchaseOrderToCreate.paymentMode,
          deliveryDate: purchaseOrderToCreate.deliveryDate,
          validationDate: purchaseOrderToCreate.validationDate,
          remise: purchaseOrderToCreate.remise,
          totalHT: finalTotalHT,
          valid: purchaseOrderToCreate.valid,
          shippingFees: purchaseOrderToCreate.shippingFees ?? 0,
          shippingVAT: purchaseOrderToCreate.shippingVAT ?? 20,
          paymentDelay: purchaseOrderToCreate.paymentDelay ?? 0,
          deposit: purchaseOrderToCreate.deposit ?? 0,
          comment: purchaseOrderToCreate.comment ?? "", 
          status: purchaseOrderToCreate.status,
          supplierId: purchaseOrderToCreate.supplierId,
          clubId: purchaseOrderToCreate.clubId
        }
    
        const { data : purchaseOrderData, error : purchaseOrderError } = await this.supabase.from('commandes_fournisseur').insert(mapFromType(newPurchaseOrder, purchaseOrderKeyMap)).select("*").single();
        if (purchaseOrderError) throw new InternalServerError(purchaseOrderError.message);
    
        let purchaseOrderLines : PurchaseOrderLine[] = [];
    
        for(const line of purchaseOrderToCreate.lines) {
          const newPurchaseOrderLine : PurchaseOrderLineInput = {        
            orderSupplierId: purchaseOrderData.id,
            modelId: line.modelId,
            quantity: line.quantity,
            receivedQuantity: line.receivedQuantity,
            unitHtPrice: line.unitHtPrice,
            discount: line.discount,
            vat: line.vat,
            valid: line.valid,
            comment: line.comment,
            ttcPrice: line.ttcPrice
          }
          const createdPurchaseOrderLine = await this.createPurchaseOrderLine(newPurchaseOrderLine);
          purchaseOrderLines.push(createdPurchaseOrderLine);
        }

        let expeditionsToCreate : ShippingDataForSupplierInput | undefined = purchaseOrderToCreate.expeditions as ShippingDataForSupplierPresenter | undefined;
        if(!expeditionsToCreate) {
          expeditionsToCreate = {
            purchaseOrderId: purchaseOrderData.id,
            type: ShippingType.EMPTY,
            createdAt: new Date()
          };
        }

        const createdExpeditions = await this.supabase.from('expeditions')
          .insert(mapFromType(expeditionsToCreate, expeditionKeyMap))
          .select("*")
          .single();
        if(createdExpeditions.error) {
          throw new InternalServerError(createdExpeditions.error.message);
        }
        const mappedExpeditions = mapToType<ShippingDataForSupplierPresenter>(createdExpeditions.data, expeditionKeyMap);

        let linesToCreate : ShippingDataForSupplierLine[] = [];
        for(const line of purchaseOrderToCreate.lines) {
          linesToCreate.push({
            expeditionId: createdExpeditions.data.id,
            modelId: line.modelId,
            quantity: line.receivedQuantity ?? 0,
            checkoutQuantity: line.quantity
          });
        }
        
         const createdLines = await this.supabase.from('expeditions_lignes')
           .insert(linesToCreate.map(line => mapFromType(line, expeditionLineKeyMap)))
           .select("*");
        if(createdLines.error) {
          throw new InternalServerError(createdLines.error.message);
        }
        const shippingObject : ShippingDataForSupplierPresenter = {
          ...mappedExpeditions,
          lines: createdLines.data.map((line) => mapToType<ShippingDataForSupplierLine>(line, expeditionLineKeyMap))
        }

        return {
          ...mapToType<PurchaseOrder>(purchaseOrderData, purchaseOrderKeyMap),
          lines: purchaseOrderLines,
          expeditions: shippingObject
        };
      }
    
      async updatePurchaseOrder(id: number, purchaseOrder: PurchaseOrderPresenterInput): Promise<ReturnOne<PurchaseOrderPresenter>> {
        const finalTotalHT = purchaseOrder.lines.reduce(
          (acc, line) => acc + (line.quantity * (line.unitHtPrice ?? 0)),
          0
        );
    
        const updatedPurchaseOrder : PurchaseOrderInput2 = {
          createdAt: purchaseOrder.createdAt,
          totalHT: finalTotalHT,
          valid: purchaseOrder.valid,
          status: purchaseOrder.status,
          supplierId: purchaseOrder.supplierId,
          clubId: purchaseOrder.clubId,
          orderDate: purchaseOrder.orderDate,
          paymentMode: purchaseOrder.paymentMode,
          deliveryDate: purchaseOrder.deliveryDate,
          validationDate: purchaseOrder.validationDate,
          remise: purchaseOrder.remise,
        }
        const { data : purchaseOrderData, error : purchaseOrderError } = await this.supabase
          .from('commandes_fournisseur')
          .update(mapFromType(updatedPurchaseOrder, purchaseOrderKeyMap)).eq('id', id).select("*").single();
    
        if (purchaseOrderError) throw new InternalServerError(purchaseOrderError.message);
    
        // DELETE ALL LINES WITH THE SAME orderSupplierId
        const { error : deleteError } = await this.supabase
          .from('commande_fournisseur_lignes')
          .delete()
          .eq('id_commande_fournisseur', id);
        if(deleteError) {
          throw new InternalServerError(deleteError.message);
        }
    
        let purchaseOrderLines : PurchaseOrderLine[] = [];
        for(const line of purchaseOrder.lines) {
          const updatedPurchaseOrderLine : PurchaseOrderLineInput = {
            orderSupplierId: id,
            modelId: line.modelId,
            quantity: line.quantity,
            receivedQuantity: line.receivedQuantity,
            unitHtPrice: line.unitHtPrice,
            discount: line.discount,
            vat: line.vat,
            valid: line.valid,
            comment: line.comment,
            ttcPrice: line.ttcPrice ? line.ttcPrice : line.quantity * (line.unitHtPrice ?? 0) * (1 + (line.vat ?? 20) / 100)
          }
                  
          const mappedUpdatedPurchaseOrderLine = mapFromType(updatedPurchaseOrderLine, purchaseOrderLineKeyMap);
          
          const createdPurchaseOrderLine = await this.supabase
            .from('commande_fournisseur_lignes')
            .upsert(mappedUpdatedPurchaseOrderLine)
            .select("*")
            .single();
          if(createdPurchaseOrderLine.error) {
            throw new InternalServerError(createdPurchaseOrderLine.error.message);
          }
          purchaseOrderLines.push(mapToType<PurchaseOrderLine>(createdPurchaseOrderLine.data, purchaseOrderLineKeyMap));      
        }
        
        let mappedExpeditions : ShippingDataForSupplierPresenter | undefined;
        if(purchaseOrder.expeditions) {
          const updatedExpeditions : ShippingDataForSupplierInput = {
            id: purchaseOrder.expeditions.id,
            purchaseOrderId: purchaseOrder.id,
            createdAt: purchaseOrder.expeditions.createdAt,
            expeditionDate: purchaseOrder.expeditions.expeditionDate,
            expectedDate: purchaseOrder.expeditions.expectedDate,
            weight: purchaseOrder.expeditions.weight,
            trackingNumber: purchaseOrder.expeditions.trackingNumber,
            status: purchaseOrder.status === PurchaseOrderStatus.RECU ? ShippingStatus.SHIPPED : purchaseOrder.expeditions.status,
            etiquette: purchaseOrder.expeditions.etiquette,
            type: purchaseOrder.expeditions.type
          };
          const createdExpeditions = await this.supabase.from('expeditions')
            .upsert(mapFromType(updatedExpeditions, expeditionKeyMap));
          if(createdExpeditions.error) {
            throw new InternalServerError(createdExpeditions.error.message);
          }

          if(purchaseOrder.expeditions.lines && purchaseOrder.expeditions.lines.length > 0) {            
            const deleteLines = await this.supabase.from('expeditions_lignes')
              .delete()
              .eq('id_expedition', purchaseOrder.expeditions.id);
            if(deleteLines.error) {
              throw new InternalServerError(deleteLines.error.message);
            }

            const updatedLines = await this.supabase.from('expeditions_lignes')
              .upsert(purchaseOrder.lines.map(line => mapFromType({
                expeditionId: purchaseOrder.expeditions?.id ?? 0,
                modelId: line.modelId,
                quantity: line.receivedQuantity ?? 0,
                checkoutQuantity: line.quantity
              }, expeditionLineKeyMap)));
            if(updatedLines.error) {
              throw new InternalServerError(updatedLines.error.message);
            }
          }

          const shippingObject = await this.supabase.from('expeditions')
            .select("*, expeditions_lignes!id_expedition(*)")
            .eq('id', purchaseOrder.expeditions.id)
            .single();
          if(shippingObject.error) {
            throw new InternalServerError(shippingObject.error.message);
          }

          mappedExpeditions = mapToType<ShippingDataForSupplierPresenter>(shippingObject.data, expeditionKeyMap);
        }
        return {
          item: {
            ...mapToType<PurchaseOrder>(purchaseOrderData, purchaseOrderKeyMap),
            lines: purchaseOrderLines,
            expeditions: mappedExpeditions
          }
        };
      }
    
      async deletePurchaseOrder(id: number): Promise<void> {
        throw new Error("Method not implemented.");
      }
}