import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { updateOrderLineUseCase } from "../../../../src/usecases/orders/order";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";
import { OrderLineInput, ReturnStatus, ReturnType } from "../../../../src/models";

describe("updateOrderLineUseCase", () => {
    let orderLineId: number;
    let orderId: number;
    let retourId: number;
    let retourLineId: number;
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

    it("should update an order line when the order line is returned", async () => {
        const orderLine: OrderLineInput = {
            id: orderLineId,
            orderId: orderId,
            modelId: 1,
            comment: "produit retourné",
            returnedAt: new Date()
        }

        const updatedOrderLine = await updateOrderLineUseCase(orderLine);
        expect(updatedOrderLine).toBeDefined();
        expect(updatedOrderLine.orderId).toBe(orderId);
        expect(updatedOrderLine.modelId).toBe(1);
        expect(updatedOrderLine.comment).toBe("produit retourné");
    });
});