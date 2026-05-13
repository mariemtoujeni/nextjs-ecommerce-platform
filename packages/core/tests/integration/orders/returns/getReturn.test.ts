import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getReturnUseCase } from "../../../../src/usecases/orders/returns";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";


describe("getReturnUseCase", () => {
    let returnId: number;
    let commandeId: number;
    let supabase: SupabaseClient;
    
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");

        const commande = {
            numero_client: 6535,
            statut: "EXPEDIEE",
            mode_livraison: "SO_COLISSIMO",
            montant: 100,
            frais_port: 10,
            reste: 0,
            sans_tva: false,
            devis: false,
            autorisation: "3939995316b89ccfd02b0a755eb2b51be4fc7d9d",
            mode_paiement: "systempay",
            refus_paiement: "",
            credit_utilise: 0,
            points_utilise: 0,
            total_reductions: 0,
            commentaire_client: "test",
            date_creation: new Date().toISOString(),
            boutique: "NATAQUASHOP"
        }

        const { data: commandeData, error: commandeError } = await supabase.from("commandes").insert(commande).select().single();
        if (commandeError) throw commandeError;
        commandeId = commandeData.id;

        const retour = {
            id_commande: commandeId,
            type_retour: "REMBOURSEMENT",
            date_demande: new Date().toISOString(),
            date_reception: new Date().toISOString(),
            numero_suivi: "1R234567890",
            numero_prise_en_charge: "1R2345678901452",
            cab_routage: "3939995316b89ccfd02b0a755eb2b51be4fc7d9d",
            date_commande_recu_le: new Date().toISOString(),
            motif_retour: "test",
            date_remboursement: new Date().toISOString(),
            date_reexpedition: new Date().toISOString(),
            etat: "VALIDE"
        }

        const { data: retourData, error: retourError } = await supabase.from("retours").insert(retour).select().single();
        if (retourError) throw retourError;
        returnId = retourData.id;
    });

    afterAll(async () => {
        await supabase.from("retours").delete().eq("id", returnId);
        await supabase.from("commandes").delete().eq("id", commandeId);
    });

    it("should return a return", async () => {
        const retour = await getReturnUseCase(returnId);
        expect(retour).toBeDefined();
        expect(retour.item).toBeDefined();
        expect(retour.item.id).toBe(returnId);
        expect(retour.item.orderId).toBe(commandeId);
        expect(retour.item.type).toBe("REMBOURSEMENT");
        expect(retour.item.status).toBe("VALIDE");
        expect(retour.item.requestDate).toBeDefined();
        expect(retour.item.receivedDate).toBeDefined();
        expect(retour.item.trackingNumber).toBe("1R234567890");
    });

    it("should return an error if the return does not exist", async () => {
        const retour = await getReturnUseCase(-1);
        expect(retour).toBeDefined();
        expect(retour.item).toBeNull();
        expect(retour.error).toBeDefined();
    });
});