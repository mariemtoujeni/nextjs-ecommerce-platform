/*import { Opinion } from "../models";


// Convertit une opinion TypeScript vers le format base de données
export const mapOpinionToDb = (opinion: Opinion) => {
  const row: any = {
    id_produit: opinion.productId,
    numero_client: opinion.userId,
    pseudo: opinion.pseudo,
    email: opinion.email,
    titre: opinion.title,
    texte: opinion.text,
    note: opinion.rating,
    date_ajout: opinion.createdAt,
    id_modele: opinion.modelId,
    id_commande: opinion.commandId,
    reponse_admin: opinion.responseAdmin,
    valide: opinion.validated,
    actif: opinion.actif,
  };
   if (row.id) {
    opinion.id = row.id;
  }

  return row;
};

// Convertit une ligne de la base de données vers une Opinion TypeScript
export const mapDbToOpinion = (row: any): Opinion => {
   
  const descriptions = row.produits?.produit_descriptions;
  let productName = '-';
  if (Array.isArray(descriptions) && descriptions.length > 0) {    
    const frDesc = descriptions.find((d: any) => d.lang === 'fr');
    productName = frDesc?.titre ?? descriptions[0].titre ?? '-';
  } else if (descriptions && descriptions.titre) {
    productName = descriptions.titre;
  }
  return{
  id: row.id,
  productId: row.id_produit,
  userId: row.numero_client,  
  pseudo: row.pseudo,
  email: row.email,
  title: row.titre,
  text: row.texte,
  rating: row.note,
  createdAt: new Date(row.date_ajout),
  modelId: row.id_modele,
  commandId: row.id_commande,
  responseAdmin: row.reponse_admin,
  validated: row.valide,
  actif: row.actif,
  //User
  
  clientEmail: row.clients?.email ?? '',
  clientPhone: row.clients?.telephone_portable ?? '',    
  //Product
  productName:   productName,
}};*/
