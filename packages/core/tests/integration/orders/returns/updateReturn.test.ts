import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { updateReturnUseCase } from "../../../../src/usecases/orders/returns";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection, InternalServerError } from "../../../../src/types";
import { ReturnStatus, ReturnType } from "../../../../src/models";

describe("updateReturnUseCase", () => {
    let returnId: number;
    let commandeId: number;
    let retourLineId: number;
    let retourLineObject: any;
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

        const orderAddressLivraison = {
            id_commande: commandeId,
            type: "LIVRAISON",
            nom: "test",
            prenom: "test",
            adresse: "1 Rue de test",
            code_postal: "75000",
            ville: "Paris",
            pays: "FR"
        }

        const { data: orderAddressLivraisonData, error: orderAddressLivraisonError } = await supabase.from("commande_adresses")
            .insert(orderAddressLivraison)
            .select()
            .single();
        if (orderAddressLivraisonError) throw orderAddressLivraisonError;

        const orderAddressFacturation = {
            id_commande: commandeId,
            type: "FACTURATION",
            nom: "test",
            prenom: "test",
            adresse: "1 Rue de test",
            code_postal: "75000",
            ville: "Paris",
            pays: "FR"
        }

        const { data: orderAddressFacturationData, error: orderAddressFacturationError } = await supabase.from("commande_adresses")
            .insert(orderAddressFacturation)
            .select()
            .single();
        if (orderAddressFacturationError) throw orderAddressFacturationError;

        const retour = {
            id_commande: commandeId,
            type_retour: ReturnType.REPAYMENT,
            date_demande: new Date().toISOString(),
            date_reception: new Date().toISOString(),
            numero_suivi: "1R234567890",
            numero_prise_en_charge: "1R2345678901452",
            cab_routage: "3939995316b89ccfd02b0a755eb2b51be4fc7d9d",
            date_commande_recu_le: new Date().toISOString(),
            motif_retour: "test",
            date_remboursement: new Date().toISOString(),
            date_reexpedition: new Date().toISOString(),
            etat: "ENCOURS"
        }

        const { data: retourData, error: retourError } = await supabase.from("retours").insert(retour).select().single();
        if (retourError) throw retourError;
        returnId = retourData.id;

        const retourLine = {
            id_retour: returnId,
            id_modele: 1069,
            quantite: 1,
            motif_retour: "test retour line",
        }

        const { data: retourLineData, error: retourLineError } = await supabase.from("retours_lignes").insert(retourLine).select().single();
        if (retourLineError) throw retourLineError;

        retourLineId = retourLineData.id;
        retourLineObject = retourLineData;
    });

    afterAll(async () => {
        const retourLineDelete = await supabase.from("retours_lignes").delete().eq("id", retourLineId);
        if (retourLineDelete.error) console.log("retourLineDelete.error: ", retourLineDelete.error);
        const retourDelete = await supabase.from("retours").delete().eq("id", returnId);        
        if (retourDelete.error) console.log("retourDelete.error: ", retourDelete.error);
        const commandeAddressDelete = await supabase.from("commande_adresses").delete().eq("id_commande", commandeId);
        if (commandeAddressDelete.error) console.log("commandeAddressDelete.error: ", commandeAddressDelete.error);
        const commandeDelete = await supabase.from("commandes").delete().eq("id", commandeId);
        if (commandeDelete.error) console.log("commandeDelete.error: ", commandeDelete.error);
    });

    it("should update a return when the return is rejected", async () => {
        const returnData = await updateReturnUseCase(returnId, {
            orderId: commandeId,
            type: ReturnType.REPAYMENT,
            requestDate: new Date(),
            status: ReturnStatus.REJECTED,
            lines: [{
                returnId: returnId,
                modelId: retourLineObject.id_modele,
                quantity: retourLineObject.quantite,
                id: retourLineId,
                name: retourLineObject.intitule,
                returnReason: retourLineObject.motif_retour,
            }],
            commandReceptionDate: new Date()
        });
        expect(returnData.item.status).toBe(ReturnStatus.REJECTED);
    });

    it("should update a return when the return is validated", async () => {        
        const returnData = await updateReturnUseCase(returnId, {
            orderId: commandeId,
            type: ReturnType.REPAYMENT,
            requestDate: new Date(),
            status: ReturnStatus.VALIDATED,
            lines: [{
                returnId: returnId,
                modelId: retourLineObject.id_modele,
                quantity: retourLineObject.quantite,
                id: retourLineId,
                name: retourLineObject.intitule,
                returnReason: retourLineObject.motif_retour,
            }],
            commandReceptionDate: new Date()
        });
        expect(returnData.item.status).toBe(ReturnStatus.VALIDATED);
    });

    it("should return an error if the return does not exist", async () => {        
        await expect(updateReturnUseCase(-1,  {
            orderId: commandeId,
            type: ReturnType.REPAYMENT,
            requestDate: new Date(),
            status: ReturnStatus.VALIDATED,
            lines: [],
            commandReceptionDate: new Date()
        })).rejects.toThrow(InternalServerError);
    });
});