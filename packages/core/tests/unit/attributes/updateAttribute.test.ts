import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { updateAttributeUseCase } from '../../../src/usecases';
import { getInjection } from "../../../src/types/di";

describe('updateAttributeUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('should update an attribute', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const attribute = await updateAttributeUseCase(1, {         
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
                {
                    id: -1,
                    nom: 'Vert',
                    id_attribut: 1,
                    couleur: '#00FF00'
                }
            ],
            values: [
                {
                    id: 1,
                    id_attribut: 1,
                    nom: 'Rouge',
                    linkedFilters: [{
                        id: 1,            
                        nom: 'Rouge',
                        id_attribut: 1,
                        couleur: '#FF0000'
                    }]
                },
                {
                    id: 2,
                    id_attribut: 1,
                    nom: 'Bleu',
                    linkedFilters: [{
                        id: 2,            
                        nom: 'Bleu',
                        id_attribut: 1,
                        couleur: '#0000FF'
                    }]
                },
                {
                    id: -1,
                    id_attribut: 1,
                    nom: 'Vert',
                    linkedFilters: [{
                        id: -1,            
                        nom: 'Vert',
                        id_attribut: 1,
                        couleur: '#00FF00'
                    }]
                },
                {
                    id: -2,
                    id_attribut: 1,
                    nom: 'Vert militaire',
                    linkedFilters: [
                        {
                            id: 1,            
                            nom: 'Rouge',
                            id_attribut: 1,
                            couleur: '#FF0000'
                        },
                        {
                            id: -1,            
                            nom: 'Vert',
                            id_attribut: 1,
                            couleur: '#00FF00'
                        }
                    ]
                }
            ]
        });

        expect(attribute).toBeDefined();
        expect(attribute.id).toBe(1);
        expect(attribute.name).toBe('Couleur');
        expect(attribute.legend).toBe('Couleur principale du produit');
        expect(attribute.filters.length).toBe(3);
        expect(attribute.values.length).toBe(4);
        expect(attribute.filters[0]?.nom).toBe('Rouge');
        expect(attribute.filters[0]?.couleur).toBe('#FF0000');
        expect(attribute.values[0]?.nom).toBe('Rouge');
        expect(attribute.values[0]?.id_attribut).toBe(1);
        expect(attribute.values[0]?.linkedFilters.length).toBe(1);
        expect(attribute.values[0]?.linkedFilters[0]?.nom).toBe('Rouge');
        expect(attribute.values[0]?.linkedFilters[0]?.id_attribut).toBe(1);
        expect(attribute.values[0]?.linkedFilters[0]?.couleur).toBe('#FF0000');
        expect(attribute.values[1]?.nom).toBe('Bleu');
        expect(attribute.values[1]?.id_attribut).toBe(1);
        expect(attribute.values[1]?.linkedFilters.length).toBe(1);
        expect(attribute.values[1]?.linkedFilters[0]?.nom).toBe('Bleu');
        expect(attribute.values[1]?.linkedFilters[0]?.id_attribut).toBe(1);
        expect(attribute.values[1]?.linkedFilters[0]?.couleur).toBe('#0000FF');
        expect(attribute.values[2]?.nom).toBe('Vert');
        expect(attribute.values[2]?.id_attribut).toBe(1);
        expect(attribute.values[2]?.linkedFilters.length).toBe(1);
        expect(attribute.values[2]?.linkedFilters[0]?.nom).toBe('Vert');
        expect(attribute.values[2]?.linkedFilters[0]?.id_attribut).toBe(1);
        expect(attribute.values[2]?.linkedFilters[0]?.couleur).toBe('#00FF00');
        expect(attribute.values[3]?.nom).toBe('Vert militaire');
        expect(attribute.values[3]?.id_attribut).toBe(1);
        expect(attribute.values[3]?.linkedFilters.length).toBe(2);
        expect(attribute.values[3]?.linkedFilters[0]?.nom).toBe('Rouge');
        expect(attribute.values[3]?.linkedFilters[0]?.id_attribut).toBe(1);
        expect(attribute.values[3]?.linkedFilters[0]?.couleur).toBe('#FF0000');
        expect(attribute.values[3]?.linkedFilters[1]?.nom).toBe('Vert');
        expect(attribute.values[3]?.linkedFilters[1]?.id_attribut).toBe(1);
        expect(attribute.values[3]?.linkedFilters[1]?.couleur).toBe('#00FF00');
    });
});