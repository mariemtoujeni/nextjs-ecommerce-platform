import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { createCheckoutUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { getInjection } from "../../../../src/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { CheckoutStatus, ClientType, DiscountType, PaymentMethod } from "../../../../src/models";

describe("createCheckoutUseCase", () => {
  let checkoutId = 0;
  let supabase: SupabaseClient;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");
  });

  afterAll(async () => {
    await supabase.from("caisse_lignes").delete().eq("id_caisse", checkoutId);
    await supabase.from("caisses").delete().eq("id", checkoutId);
    await supabase.from("point_vente_lignes").update({
      stock_initial: 10,
      stock_vendu: 0,
      stock_final: 10,
      prix_total_ttc: 0
    }).eq("id_point_vente", 642).eq("id_modele", 717);
  });

  it("should create a checkout", async () => {
    const shop = await supabase.from("point_ventes").select("*").eq("id", 642).single();
    if (!shop.data) {
      throw new Error("Shop not found " + JSON.stringify(shop.error));
    }

    const client = await supabase.from("clients").select("*").eq("numero_client", 34864).single();
    if (!client.data) {
      throw new Error("Client not found " + JSON.stringify(client.error));
    }

    const model = await supabase.from("modeles").select("*, produits!inner(tva, prix_vente_ht, produit_descriptions!inner(titre, description)), modeles_admin!inner(code_barre)").eq("id", 717).eq("produits.produit_descriptions.lang", "fr").single();
    if (!model.data) {
      throw new Error("Model not found " + JSON.stringify(model.error));
    }

    const checkout = await createCheckoutUseCase({
        idClient: client.data.numero_client,
        idShop: shop.data.id,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        discountType: DiscountType.PERCENTAGE,
        discountAmount: '10',
        totalHT: '100',
        totalTTC: '100',
        cbAmount: '100',
        checkAmount: '0',
        cashAmount: '0',
        NoVAT: false,
        status: CheckoutStatus.OPEN,
        lines: [
            {
                idModel: model.data.id,
                name: model.data.produits.produit_descriptions[0].titre,
                codeBar: model.data.modeles_admin.code_barre,
                price: model.data.prix_vente_ht > 0 ? model.data.prix_vente_ht : model.data.produits.prix_vente_ht > 0 ? model.data.produits.prix_vente_ht : 0,
                quantity: 1,
                discount: '0',
                discountType: DiscountType.PERCENTAGE,
                VAT: model.data.produits.tva,
                comment: model.data.produits.produit_descriptions[0].description
            }
        ],
        shop: {
            id: shop.data.id,
            name: shop.data.nom,
            expirationDate: shop.data.date_fin,
            isActive: shop.data.actif,
            createdAt: shop.data.date_creation,
            status: shop.data.statut,
            department: shop.data.numero_departement
        },
        client: {
          userId: client.data.numero_client,
          email: client.data.email,
          firstName: client.data.prenom,
          lastName: client.data.nom,
          phone: "",
          mobilePhone: "",
          workPhone: "",
          clubMemberId: 0,
          clubId: 0,
          credit: 0,
          club: {
            id: 0,
            name: "",
            president: "",
            email: "",
            accountantAccount: "",
            paymentMode: 0,
            paymentDelay: 0,
            referent: "",
            partner: false,
            phone: "",
            code: "",
            valid: false,
            siren: "",
            tvaNumber: "0"
          },
          clientNumber: 0,
          type: ClientType.CLIENT,
          lang: "",
          birthDate: new Date(),
          newsLetter: false,
          siteOffer: false,
          partnerOffer: false,
          fidelityPoints: 0,
          clientAddress: [{
            id: 0,
            numero_client: 0,
            designation: "",
            civilite: "",
            nom: "",
            prenom: "",
            adresse: "",
            adresse2: "",
            adresse3: "",
            code_postal: "",
            ville: "",
            pays: "",
            interphone: "",
            code_porte: "",
            instructions: "",
            default: false,
            created_at: new Date(),
            updated_at: new Date(),
            societe: ""
          }],
          order: [],
          quotation: [],
          createdAt: new Date()
        }
    });

    checkoutId = checkout.id;

    expect(checkout.idClient).toBe(client.data.numero_client);
    expect(checkout.idShop).toBe(shop.data.id);
    expect(checkout.paymentMethod).toBe(PaymentMethod.DEBIT_CARD);
    expect(checkout.discountType).toBe(DiscountType.PERCENTAGE);
    expect(checkout.discountAmount).toBe(10);
    expect(checkout.totalHT).toBe(100);
    expect(checkout.totalTTC).toBe(100);
  });
});