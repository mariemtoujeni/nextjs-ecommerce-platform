// deno-lint-ignore-file
import { registerFunction } from "../_shared/index.ts";

registerFunction(async ({ req, userClient }) => {
    const origin = req.headers.get('Origin');

    if(!origin) {
        return { success: false, error: { message: `Invalid origin ${origin}`} };
    }

    let body: any;
    const contentType = req.headers.get('Content-Type');
    if(contentType && contentType.includes('application/json')) {
        body = await req.json();
    } else {
        body = await req.formData();
    }

    if(!body.id_point_vente || !body.nom || !body.numero_departement) {
        return { success: false, error: { message: `Missing id_point_vente or nom or numero departement`} };
    }

    // Get the point_vente used to create the new point_vente
    const point_vente = await userClient.from('point_ventes').select('*').eq('id', body.id_point_vente).single();
    if(point_vente.error) {
        return { success: false, error: point_vente.error };
    }

    // Check if the point_vente is already closed
    if( point_vente.data.statut !== "CLOTURE") {
        return { success: false, error: { message: `The point_vente is not closed`} };
    }

    const newPointVente = await userClient.from('point_ventes').insert({
        nom: body.nom,
        date_creation: new Date().toISOString(),
        actif: true,
        statut: "BROUILLON",
        numero_departement: body.numero_departement
    }).select('*').single();

    if(newPointVente.error) {
        return { success: false, error: newPointVente.error };
    }

    const point_vente_lignes = await userClient.from('point_vente_lignes').select('*').eq('id_point_vente', body.id_point_vente);
    if(point_vente_lignes.error) {
        return { success: false, error: point_vente_lignes.error };
    }

    const point_vente_lignes_array = [];
    for(const ligne of point_vente_lignes.data) {
        point_vente_lignes_array.push({
            id_modele: ligne.id_modele,
            id_point_vente: newPointVente.data.id,
            stock_initial: ligne.stock_final,
            stock_vendu: 0,
            stock_final: -999
        });
    }
    const newPointVenteLignes = await userClient.from('point_vente_lignes').insert(point_vente_lignes_array);
    if(newPointVenteLignes.error) {
        return { success: false, error: newPointVenteLignes.error };
    }

    return { success: true, data: newPointVente.data };
}, {
    allowOnlyAdmin: true
});