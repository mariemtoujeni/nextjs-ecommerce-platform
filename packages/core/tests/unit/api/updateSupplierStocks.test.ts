import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DELIVERY_DELAY_UPDATE_DAYS, updateSuppliserStockUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { BadRequestError, getInjection, NotFoundError } from "@repo/core/types";

describe('updateSupplierStocks', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('[ARENA] should update the supplier stocks', async () => {

        await updateSuppliserStockUseCase('api_key_arena', {
            records: {  
                nataquashop: [
                    {
                        material: 'meterial_sku_1',
                        eancode: '1111111111',
                        stockquantity: '10',
                        deliveryquantity: ''
                    }, 
                    {
                        material: 'meterial_sku_2',
                        eancode: '2222222222',
                        stockquantity: '5',
                        deliveryquantity: ''
                    }
                ]
            }
        });

        const modelRepository = await getInjection('IModelRepository');
        let model = await modelRepository.readByBarcode('1111111111');
        expect(model.minStock).toBe(-10);

        model = await modelRepository.readByBarcode('2222222222');
        expect(model.minStock).toBe(-5);
    });

    it('[ARENA] Shoud only update the stock if the delivery date is before the accepted delivery date', async () => {
        const validDeliveryDate = new Date(Date.now() + DELIVERY_DELAY_UPDATE_DAYS - (24 * 3600000));
        const invalidDeliveryDate = new Date(Date.now() + DELIVERY_DELAY_UPDATE_DAYS + (24 * 3600000));
        const validDeliveryDateStr = validDeliveryDate.toISOString().slice(0,10).replace(/-/g,'');
        const invalidDeliveryDateStr = invalidDeliveryDate.toISOString().slice(0,10).replace(/-/g,'');

        const record = {
                material: 'meterial_sku_1',
                eancode: '1111111111',
                stockquantity: '10',
                deliveryquantity: `${validDeliveryDateStr}-5,${invalidDeliveryDateStr}-10`
            }
        const { promise } = await updateSuppliserStockUseCase('api_key_arena', {records: { nataquashop: [record] } });
        await promise;

        const modelRepository = await getInjection('IModelRepository');
        let model = await modelRepository.readByBarcode('1111111111');
        expect(model.minStock).toBe(-15);
    });

    it('Should throw a NotFoundError if the api key is not valid', async () => {
        await expect(updateSuppliserStockUseCase('api_key_arena_invalid', {})).rejects.toThrow(NotFoundError);
    });
});