import { registerFunction } from "../_shared/index.ts";

registerFunction(async ({ req, userClient, adminClient, user}) => {
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

    if(body.type === "pack")    {
        
        let prix_vente_ht = 0.0;
        let prix_vente_ttc = 0.0;
        let modeles : any = null;
        if(body.produits) {
            modeles = await userClient.from('modeles')
                .select('*, produits(*)')
                .in('id', body.produits.split('_'))
                .eq('publier', true);
            if(modeles.error) {
                throw new Error("Impossible de récupérer les modèles du pack");
            }

            prix_vente_ht = modeles.data.reduce((acc: number, modele: any) => acc + modele.produits.prix_vente_ht, 0);
            prix_vente_ttc = modeles.data.reduce((acc: number, modele: any) => acc + modele.produits.prix_vente_ttc, 0);
        }
        
        const produit = await userClient.from('produits').insert({
            personnalisation: true,
            is_pack: true,
            tva: (prix_vente_ttc - prix_vente_ht) / prix_vente_ht * 100,
            prix_vente_ht: prix_vente_ht,
            prix_vente_ttc: prix_vente_ttc,
            stock_min: 0,
            poids: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).select().single();

        if(produit.error) {
            throw new Error("Impossible de créer le pack");
        }

        if(body.titre_fr) {
            const produit_descriptions = await userClient.from('produit_descriptions').insert({
                id_produit: produit.data.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                titre: body.titre_fr,
                lang: 'fr'
            });
            if(produit_descriptions.error) {
                throw new Error("Impossible de créer la description du pack en français");
            }
        }

        if(body.titre_en) {
            const produit_descriptions = await userClient.from('produit_descriptions').insert({
                id_produit: produit.data.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                titre: body.titre_en,
                lang: 'en'
            });
            if(produit_descriptions.error) {
                throw new Error("Impossible de créer la description du pack en anglais");
            }
        }

        if(modeles)  {
            const produit_pack = [];
            for(const modele of modeles.data) {
                produit_pack.push({
                    id_produit: produit.data.id,
                    id_modele: modele.id
                });
            }

            const produit_pack_db = await userClient.from('produit_pack').insert(produit_pack);
            if(produit_pack_db.error) {
                throw new Error("Impossible d'associé les modèles au pack");
            }
        }

        return { success: true, message: 'Pack created', data: produit.data };
    }   else if(body.produit)    {
        const produit = await userClient.from('produits').insert({
            ...body.produit,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).select().single();

        if(produit.error) {
            return { success: false, error: produit.error };
        }

        if(body.clubId) {
            const magasin = await userClient.from('magasins').select('id').eq('id_club', body.clubId).single();
            if(magasin.error) {
                return { success: false, error: magasin.error };
            }

            const produit_magasin = await userClient.from('produit_magasin').insert({
                id_magasin: magasin.data.id,
                id_produit: produit.data.id
            });

            if(produit_magasin.error) {
                return { success: false, error: produit_magasin.error };
            }
        }

        if(body.boutiques) {
            for(const boutique of body.boutiques) {
                if(!boutique) {
                    continue;
                }
                const produit_boutique = await userClient.from('produit_boutiques').insert({
                    id_produit: produit.data.id,
                    boutique: boutique,
                    created_at: new Date().toISOString()
                });

                if(produit_boutique.error) {
                    return { success: false, error: produit_boutique.error };
                }
            }
        }

        if(body.produit_descriptions)   {
            for(const description of body.produit_descriptions) {
                const produit_descriptions = await userClient.from('produit_descriptions').insert({
                    id_produit: produit.data.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    ...description
                });

                if(produit_descriptions.error) {
                    return { success: false, error: produit_descriptions.error };
                }
            }
        }

        // Add line in table collection_produits
        if(body.collectionId) {
            const collection_produits = await userClient.from('collection_produits').insert({
                id_collection: body.collectionId,
                id_produit: produit.data.id,
                created_at: new Date().toISOString(),
            });

            if(collection_produits.error) {
                return { success: false, error: collection_produits.error };
            }
        }

        if(body.produit_modele_attributs_array) {
            for(const attribut of body.produit_modele_attributs_array) {
                const attribut_db = await userClient.from('attributs').select('*').eq('id', attribut.id_attribut).single();
                if(attribut_db.error) {
                    return { success: false, error: attribut_db.error };
                }
                
                const produit_modele_attributs_db = await userClient.from('produit_modele_attributs').insert({
                    id_produit: produit.data.id,
                    id_attribut: attribut_db.data.id,
                    position: attribut.position                
                });
                if(produit_modele_attributs_db.error) {
                    return { success: false, error: produit_modele_attributs_db.error };
                }

                for(const valeurId of attribut.valeurIds) {
                    const produit_modele_attribut_valeurs_db = await userClient.from('produit_modele_attribut_valeurs').insert({
                        id_produit: produit.data.id,
                        id_attribut: attribut_db.data.id,
                        id_attribut_valeur: valeurId
                    });
                    if(produit_modele_attribut_valeurs_db.error) {
                        return { success: false, error: produit_modele_attribut_valeurs_db.error };
                    }

                    const modele_db = await userClient.from('modeles').insert({
                        id_produit: produit.data.id,
                        poids: produit.data.poids,
                        prix_vente_ht: produit.data.prix_vente_ht,
                        prix_vente_ttc: produit.data.prix_vente_ttc,
                        publier: false,
                        stock_min: produit.data.stock_min,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }).select().single();
                    if(modele_db.error) {
                        return { success: false, error: modele_db.error };
                    }

                    const attribut_valeurs_db = await userClient.from('modele_attribut_valeurs').insert({
                        id_modele: modele_db.data.id,
                        id_attribut_valeur: valeurId
                    });
                    if(attribut_valeurs_db.error) {
                        return { success: false, error: attribut_valeurs_db.error };
                    }
                }
            }
        }

        return { success: true, message: 'Product created', data: produit.data };
    }  else {
        throw new Error('Missing product data');
    }
},{
    allowOnlyAdmin: true
});