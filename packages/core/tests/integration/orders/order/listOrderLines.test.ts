import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listOrderLinesUseCase } from "../../../../src/usecases/orders/order";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";

describe("listOrderLinesUseCase", () => {
    let orderId: number;
    let orderLineId: number;
    let supabase: SupabaseClient;
    

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");

        const order = {
            numero_client: 6535,
            statut: "EXPEDIEE",
            mode_livraison: "SO_COLISSIMO",
            date_autorisation: new Date().toISOString(),
            montant: 13.3,
            frais_port: 1,
            reste: 0,
            sans_tva: false,
            devis: false,
            autorisation: "3939995316b89ccfd02b0a755eb2b51be4fc7d9d",
            mode_paiement: "systempay",
            credit_utilise: 0,
            points_utilise: 0,
            total_reductions: 0,
            commentaire_client: "test",
            date_creation: new Date().toISOString(),
            boutique: "NATAQUASHOP"
        }

        const { data: orderData, error: orderError } = await supabase.from("commandes").insert(order).select().single();
        if (orderError) throw orderError;
        orderId = orderData.id;

        const orderLine = {
            id_commande: orderId,
            id_modele: 1,
            quantite: 1,
            prix_unitaire_ht: 10.25,
            tva: 20,
            prix_total_ht: 10.25,
            prix_total_ttc: 12.3,
            cheque_cadeau: false,
            cheque_duree: 0,
            poids: 100,
            valeur_reduction: 0,
            disponible: true,
            date_creation: new Date().toISOString()
        }

        const { data: orderLineData, error: orderLineError } = await supabase.from("commande_lignes").insert(orderLine).select().single();
        if (orderLineError) throw orderLineError;
        orderLineId = orderLineData.id;
    });

    afterAll(async () => {
        await supabase.from("commande_lignes").delete().eq("id", orderLineId);
        await supabase.from("commandes").delete().eq("id", orderId);
    });

    it("should list order lines", async () => {
        const orderLines = await listOrderLinesUseCase(orderId);
        expect(orderLines.items).toBeDefined();
        expect(orderLines.total).toBe(1);
        expect(orderLines.count).toBe(1);
        expect(orderLines.items?.length).toBe(1);
        const firstItem = orderLines.items?.[0];
        expect(firstItem).toBeDefined();
        expect(firstItem!.id).toBe(orderLineId);
        expect(firstItem!.orderId).toBe(orderId);
        expect(firstItem!.modelId).toBe(1);
        expect(firstItem!.quantity).toBe(1);
    });
});