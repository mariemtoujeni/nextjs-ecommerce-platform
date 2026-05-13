import { BadRequestError, getInjection } from "../../types";
import { DeliverySchedule, UpdateSupplierStock } from "../../models";

const dataTransform: Record<string, (data: any) => UpdateSupplierStock[]> = {
    'ARENA': (data: any) => {
        return data.records.nataquashop.map((item: any) => {
            const deliveries = item.deliveryquantity.split(',')
            .reduce((acc: DeliverySchedule[], delivery: string) => {
                const [date, quantity] = delivery.split('-');
                if (date && quantity) {
                    const year = parseInt(date.substring(0, 4));
                    const month = parseInt(date.substring(4, 6)) - 1;
                    const day = parseInt(date.substring(6, 8));
                    const dateParsed = new Date(Date.parse(`${year}-${month + 1}-${day}`));
                    
                    acc.push({
                        date: dateParsed,
                        quantity: parseInt(quantity) || 0
                    });
                }
                return acc;
            }, []);

            return {
                sku: item.material,
                barcode: item.eancode,
                stock: parseInt(item.stockquantity) || 0,
                deliveries
            }
        });
    }
};


// Delivery delay when the supplier will receive new stock
// ex : if supplier receive stock before 10 days, we update the stock available
// ex : if supplier receive stock after 10 days, we don't
export const DELIVERY_DELAY_UPDATE_DAYS = 10 * 60 * 60 * 24 * 1000;

export const updateSuppliserStockUseCase = async (apiKey: string, data: any ): Promise<{ promise: Promise<void> }> => {
    const apiKeyRepository = await getInjection('IApiKeyRepository');
    const modelRepository = await getInjection('IModelRepository');
    const apiKeySupplier = await apiKeyRepository.readByKey(apiKey);

    if(!(apiKeySupplier.supplier.name in dataTransform)) {
        throw new BadRequestError("Supplier not supported: " + apiKeySupplier.supplier.name);        
    }

    const promise = (async () => {
        console.log("Start update supplier stock for " + apiKeySupplier.supplier.name);
        const start = Date.now();
        const transform = dataTransform[apiKeySupplier.supplier.name]!;
        const dataTransformed = transform(data);
        const models = await modelRepository.readByBarcodes(dataTransformed.map(d => d.barcode));

        const beforeDeliveryDate = new Date(Date.now() + DELIVERY_DELAY_UPDATE_DAYS);
        beforeDeliveryDate.setHours(0, 0, 0, 0);

        models.forEach(m => {
            const data = dataTransformed.find(d => d.barcode === m.barcode);
            if(data) {
                let supplierStock = data.stock;
                
                data.deliveries.forEach(d => {
                    if(d.date < beforeDeliveryDate) {
                        supplierStock += d.quantity;
                    }
                });

                m.minStock = 0 - supplierStock;
            }
        });

        await modelRepository.bulkUpdateStock(models);
        console.log("End update supplier stock for " + models.length + " models in " + (Date.now() - start)/1000 + "s");
    })();

    return { promise };
}