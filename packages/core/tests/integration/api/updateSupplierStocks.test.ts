import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signInTestUser, TestUser } from "../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { generateRandomString, getInjection } from "@repo/core/types";
import { updateSuppliserStockUseCase } from "@repo/core/usecases";

describe('UpdateSupplierStocks', async () => {
    let client: SupabaseClient;
    let apiKeyId = 999999;
    let apiKey: string;

    beforeAll(async () => {

        await signInTestUser(TestUser.ADMIN);
        client = await getInjection('ISupabaseClient');
        apiKey = generateRandomString(32);

        const { data, error } = await client.from('api_keys').upsert({
            id: apiKeyId,
            key: apiKey,
            supplier_id: 3,
            created_at: new Date(),
            updated_at: new Date(),
        })

        if(error) {
            console.error(error)
            throw error;
        }
    });

    afterAll(async () => {
        await client.from('api_keys').delete().eq('id', apiKeyId);
        await client.from('modeles').upsert([
            {id: 128589, stock_min: 10},
            {id: 128590, stock_min: 10}
        ]);
    });

    it('[ARENA] Should update the supplier stocks', async () => {
        const { promise } = await updateSuppliserStockUseCase(apiKey, {
            records: {  
                nataquashop: [
                    // Sac de sport de toute les couleurs
                    {
                        
                        material: '7232302',
                        eancode: '8171923962910',
                        stockquantity: '10',
                        deliveryquantity: ''
                    },
                    {
                        material: '7232302',
                        eancode: '8171923963016',
                        stockquantity: '5',
                        deliveryquantity: ''
                    }
                ]
            }
        });

        await promise;

        const modelRepository = await getInjection('IModelRepository');

        const modeles = await modelRepository.readByBarcodes(['8171923962910', '8171923963016']);
        expect(modeles.length).toBe(2);
        expect(modeles[0]?.minStock).toBe(-10);
        expect(modeles[1]?.minStock).toBe(-5);
    });
})