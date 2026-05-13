import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { createAttributeUseCase, listAttributesUseCase, readAttributeUseCase } from '../../../src/usecases';
import { getInjection } from "../../../src/types/di";

describe('createAttributesUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);
   
    it('should create an attribute', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const attribute = await createAttributeUseCase({
            name: 'test nom',
            legend: 'test legende',
            filters: [],
            values: []
        });
        
        expect(attribute).toBeDefined();
        expect(attribute.nom).toBe('test nom');
        expect(attribute.legende).toBe('test legende');

        const attributes = await listAttributesUseCase();
        expect(attributes.length).toBe(4);
        expect(attributes[3]?.nom).toBe('test nom');
        expect(attributes[3]?.legende).toBe('test legende');
    });

    it('should create an attribute with filters', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const attribute = await createAttributeUseCase({
            name: 'test nom avec filtres',
            legend: 'Cet attribut est un test avec des filtres',
            filters: [
                {
                    nom: 'test filter',
                    couleur: 'test color'
                }
            ],
            values: []
        });

        expect(attribute).toBeDefined();
        expect(attribute.nom).toBe('test nom avec filtres');
        expect(attribute.legende).toBe('Cet attribut est un test avec des filtres');
        
        const attributeDetail = await readAttributeUseCase(attribute.id);
        expect(attributeDetail.filters.length).toBe(1);
        expect(attributeDetail.filters[0]?.nom).toBe('test filter');
        expect(attributeDetail.filters[0]?.couleur).toBe('test color');
    });

    it('should create an attribute with values', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const attribute = await createAttributeUseCase({
            name: 'test nom avec valeurs',
            legend: 'Cet attribut est un test avec des valeurs',
            filters: [],
            values: [
                {
                    nom: 'test value',
                    linkedFilters: [
                        {
                            id: 1,
                            id_attribut: 1,
                            nom: 'test filter',
                            couleur: 'test color'
                        }
                    ]
                }
            ]
        });

        expect(attribute).toBeDefined();
        expect(attribute.nom).toBe('test nom avec valeurs');
        expect(attribute.legende).toBe('Cet attribut est un test avec des valeurs');

        const attributeDetail = await readAttributeUseCase(attribute.id);
        expect(attributeDetail.values.length).toBe(1);
        expect(attributeDetail.values[0]?.nom).toBe('test value');
        expect(attributeDetail.values[0]?.id_attribut).toBe(attribute.id);
    });

    it('should create an attribute with filters and values', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const attribute = await createAttributeUseCase({
            name: 'test nom avec filtres et valeurs',
            legend: 'Cet attribut est un test avec des filtres et des valeurs',
            filters: [
                {
                    nom: 'test filter',
                    couleur: 'test color'
                }
            ],
            values: [
                {
                    nom: 'test value',
                    linkedFilters: [
                        {
                            id: -1,
                            id_attribut: 1,
                            nom: 'test filter',
                            couleur: 'test color'
                        }
                    ]
                }
            ]
        });

        expect(attribute).toBeDefined();
        expect(attribute.nom).toBe('test nom avec filtres et valeurs');
        expect(attribute.legende).toBe('Cet attribut est un test avec des filtres et des valeurs');

        const attributeDetail = await readAttributeUseCase(attribute.id);
        expect(attributeDetail.filters.length).toBe(1);
        expect(attributeDetail.values.length).toBe(1);
        expect(attributeDetail.filters[0]?.nom).toBe('test filter');
        expect(attributeDetail.filters[0]?.couleur).toBe('test color');
        expect(attributeDetail.values[0]?.nom).toBe('test value');
        expect(attributeDetail.values[0]?.id_attribut).toBe(attribute.id);
        expect(attributeDetail.values[0]?.linkedFilters.length).toBe(1);        
        expect(attributeDetail.values[0]?.linkedFilters[0]?.id_attribut).toBe(attribute.id);
        expect(attributeDetail.values[0]?.linkedFilters[0]?.nom).toBe('test filter');
        expect(attributeDetail.values[0]?.linkedFilters[0]?.couleur).toBe('test color');
    });
});