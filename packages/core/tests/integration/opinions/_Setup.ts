import { getInjection } from "../../../src/types";
import { signInTestUser, TestUser } from "../utils";

const getSupabaseClient = async () => await getInjection('ISupabaseClient');


export const setup = async () => {
  await signInTestUser(TestUser.ADMIN);

  const supabase = await getSupabaseClient();
  await supabase.from("avis_produits").insert([
    { id: 9999,
      id_produit: 1,
      numero_client: 3,
      pseudo: "squaadtest",
      email: "mariem@example.com",
      titre: "Excellent",
      texte: "pas mal",
      note: 2,
      date_ajout: new Date(),
      id_modele: 1,
      id_commande: 102,
      reponse_admin: "",
      valide: false,
      actif: true,
},
    { 
      id_produit: 50,
      numero_client: 190,
      pseudo: "squaadtest",
      email: "mariem@example.com",
      titre: "Excellent",
      texte: "pas mal",
      note: 2,
      date_ajout: new Date(),
      id_modele: 1,
      id_commande: 102,
      reponse_admin: "",
      valide: false,
      actif: true,
},
   
  ]);
};
export const teardown = async () => {
  const supabase = await getSupabaseClient();
  await supabase.from("avis_produits").delete().eq("pseudo", "squaadtest");
};




  
  
