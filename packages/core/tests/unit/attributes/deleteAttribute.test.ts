import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { deleteAttributeUseCase, listAttributesUseCase } from '../../../src/usecases';
import { getInjection } from "../../../src/types/di";

describe('deleteAttributeUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);
    
    it('should delete an attribute', async () => {     
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const attribute = await deleteAttributeUseCase({         
            id: 1,
            name: "Couleur",
            legend: "Couleur principale du produit",
            filters: [
                {
                    id: 1,            
                    nom: 'Rouge',
                    id_attribut: 1,
                    couleur: '#FF0000'
                },
                {
                    id: 2,
                    nom: 'Bleu',
                    id_attribut: 1,
                    couleur: '#0000FF'
                },
            ],
            values: [
                {
                    id: 1,
                    nom: 'Rouge',
                    id_attribut: 1,
                    linkedFilters: [
                        {
                            id: 1,
                            nom: 'Rouge',
                            id_attribut: 1,
                            couleur: '#FF0000'
                        }
                    ]
                },
                {
                    id: 2,
                    nom: 'Bleu',
                    id_attribut: 1,
                    linkedFilters: [
                        {
                            id: 2,
                            nom: 'Bleu',
                            id_attribut: 1,
                            couleur: '#0000FF'
                        }
                    ]
                }
            ]
        });

        const attributes = await listAttributesUseCase();
        expect(attributes.length).toBe(2);
    });
});