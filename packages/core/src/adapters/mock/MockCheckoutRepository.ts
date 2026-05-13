import { ICheckoutRepository } from "../../repositories";
import { Checkout, CheckoutFilterInput, CheckoutInput, CheckoutLine, CheckoutPresenter, CheckoutStatus, Client, CreateCheckoutRequest, DiscountType, PaymentMethod, Shop, ShopFilterInput, ShopLine, ShopOptionsSchema, ShopPresenter, ShopStatus } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { BadRequestError, NotFoundError } from "../../types/error";
import { ReturnAll } from '../../types/utils';

export class MockCheckoutRepository implements ICheckoutRepository {    

    async readCheckouts() : Promise<Checkout[]> {
        const checkouts = SharedMemory.checkouts;
        return checkouts;
    }

    async readCheckoutsByShopId(shopId: number) : Promise<ReturnAll<Checkout>> {
        const shop = SharedMemory.shops.find(shop => shop.id === shopId);
        if(!shop) {
            throw new NotFoundError('Shop not found');
        }
        const checkouts = SharedMemory.checkouts.filter(checkout => checkout.idShop === shopId);
        return {
            items: checkouts,
            total: checkouts.length,
            count: checkouts.length
        };
    }

    async readCheckoutsShopsUsers(options?: CheckoutFilterInput) : Promise<ReturnAll<CheckoutPresenter>> {
        const checkouts: Checkout[] = SharedMemory.checkouts;
        const shops : Shop[] = SharedMemory.shops;
        const clients : Client[] = SharedMemory.clients;

        const { limit, offset, sort, search, filters } = options || {};

        let filteredCheckouts = 'asc' == sort
            ? [...checkouts].sort((a, b) => a.id - b.id).slice(offset ?? 0, (offset ?? 0) + (limit ?? Number.MAX_SAFE_INTEGER))
            : [...checkouts].sort((a, b) => b.id - a.id).slice(offset ?? 0, (offset ?? 0) + (limit ?? Number.MAX_SAFE_INTEGER));

        let filteredClients = clients;

        if(search) {
            const idToFind = parseInt(search);
            if(!isNaN(idToFind)) {
                filteredCheckouts = filteredCheckouts.filter(checkout => checkout.id === idToFind);
            } else {
                filteredClients = filteredClients.filter(client => client.email.toLowerCase().includes(search.toLowerCase()) || client.firstName.toLowerCase().includes(search.toLowerCase()) || client.lastName.toLowerCase().includes(search.toLowerCase()));
            }
        }

        if(filters) {
            filters.forEach(filter => {
                if(filter.key === 'paymentMethod') {
                    const filterValue = filter.values[0] as PaymentMethod;
                    if (!Object.values(PaymentMethod).includes(filterValue)) {
                        throw new BadRequestError(`Invalid payment method: ${filterValue}`);
                    }
                    filteredCheckouts = filteredCheckouts.filter(checkout => checkout.paymentMethod === filterValue);
                } else if(filter.key === 'discountType') {
                    const filterValue = filter.values[0] as DiscountType;
                    if (!Object.values(DiscountType).includes(filterValue)) {
                        throw new BadRequestError(`Invalid discount type: ${filterValue}`);
                    }
                    filteredCheckouts = filteredCheckouts.filter(checkout => checkout.discountType === filterValue);
                } else if(filter.key === 'status') {
                    const filterValue = filter.values[0] as ShopStatus;
                    if (!Object.values(ShopStatus).includes(filterValue)) {
                        throw new BadRequestError(`Invalid shop status: ${filterValue}`);
                    }
                    filteredCheckouts = filteredCheckouts.filter(checkout => shops.find(shop => shop.id === checkout.idShop)?.status === filterValue);
                } else if(filter.key === 'shop') {
                    const filterValue = filter.values[0] as number | { key: string, values: string[] };
                    filteredCheckouts = filteredCheckouts.filter(checkout => checkout.idShop === filterValue);
                } else if(filter.key === 'NoVAT') {
                    const filterValue = filter.values[0] as string;
                    if (typeof filterValue === 'string') {
                        const isNoVAT = filterValue.toLowerCase() === 'true';
                        filteredCheckouts = filteredCheckouts.filter(checkout => checkout.NoVAT === isNoVAT);
                    }
                }
            });
        }
        const checkoutsShopsUsers = filteredCheckouts.map(checkout => {
            const shop = shops.find(shop => shop.id === checkout.idShop);
            const client = filteredClients.find(client => client.clientNumber === checkout.idClient);
            if(client) {
                return {
                    ...checkout,
                    shop: {
                        ...shop,
                        lines: []
                    },
                    client: client,
                    lines: []
                } as CheckoutPresenter    
            }            
        }).filter(checkout => checkout !== undefined) as CheckoutPresenter[];
        return {
            items: checkoutsShopsUsers,
            total: checkoutsShopsUsers.length,
            count: checkoutsShopsUsers.length
        };
    }

    async readCheckoutLinesByCheckoutId(checkoutId: number) : Promise<CheckoutLine[]> {
        const checkoutLines = SharedMemory.checkoutLines.filter(line => line.idCheckout === checkoutId);
        return checkoutLines;
    }

    async createCheckout(checkout: CreateCheckoutRequest) : Promise<Checkout> {
        const shop = SharedMemory.shops.find(shop => shop.id === checkout.idShop);
        if (!shop) {
            throw new NotFoundError('Shop not found');
        }
        const client = SharedMemory.clients.find(client => client.clientNumber === checkout.idClient);
        if (!client) {
            throw new NotFoundError('Client not found');
        }
        const newCheckout = {
            id: SharedMemory.checkouts.length + 1,
            createdAt: new Date(),
            idClient: checkout.idClient,
            idShop: checkout.idShop,
            paymentMethod: checkout.paymentMethod,
            discountType: checkout.discountType,
            discountAmount: checkout.discountAmount,
            totalHT: checkout.totalHT,
            totalTTC: checkout.totalTTC,
            cbAmount: checkout.cbAmount,
            cashAmount: checkout.cashAmount,
            checkAmount: checkout.checkAmount,
            NoVAT: checkout.NoVAT,
            status: checkout.status ?? CheckoutStatus.OPEN
        };        

        if(checkout.lines && checkout.lines.length > 0) {
            const checkoutLines = checkout.lines.map(line => {
                const model = SharedMemory.models.find(model => model.id === line.idModel);
                if (!model) {
                    throw new NotFoundError('Model not found');
                }                

                const newCheckoutLine = {
                    id: SharedMemory.checkoutLines.length + 1,
                    idCheckout: newCheckout.id,
                    idModel: line.idModel,
                    name: line.name,
                    codeBar: line.codeBar,
                    price: line.price,
                    quantity: line.quantity,
                    discount: line.discount.toString(),
                    discountType: line.discountType,
                    VAT: line.VAT,
                    comment: line.comment
                };                
                return newCheckoutLine;
            });

            checkout.lines.forEach(line => {
                const lineShop = SharedMemory.shopLines.find(lineShop => lineShop.idModel === line.idModel);
                if (!lineShop) {
                    throw new NotFoundError('Line shop not found');
                }
                const lineShopToUpdate = {
                    ...lineShop,
                    soldQuantity: lineShop.soldQuantity + line.quantity,
                    finalQuantity: lineShop.initialQuantity - line.quantity,
                    totalPriceTTC: lineShop.totalPriceTTC + (line.price * line.quantity * (1 + line.VAT / 100))
                };
                SharedMemory.shopLines = SharedMemory.shopLines.filter(lineShop => lineShop.idModel !== line.idModel && lineShop.idShop === newCheckout.idShop);
                SharedMemory.shopLines.push(lineShopToUpdate);
            });
            SharedMemory.checkouts.push(newCheckout);
            SharedMemory.checkoutLines.push(...checkoutLines);            
        } else {
            SharedMemory.checkouts.push(newCheckout);
        }   
        return newCheckout;     
    }

    async readCheckoutByDateInterval(startDate: Date, endDate: Date) : Promise<CheckoutPresenter[]> {
        throw new Error('Not implemented');
    }

    async readCheckoutById(id: number) : Promise<CheckoutPresenter> {
        const checkout = SharedMemory.checkouts.find(checkout => checkout.id === id);
        if (!checkout) {
            throw new NotFoundError('Checkout not found');
        }

        const checkoutLines = SharedMemory.checkoutLines.filter(line => line.idCheckout === id);
        const shopLines = SharedMemory.shopLines.filter(line => line.idShop === checkout.idShop);
        const client = SharedMemory.clients.find(client => client.clientNumber === checkout.idClient);
        const shop = SharedMemory.shops.find(shop => shop.id === checkout.idShop);
        if (!shop) {
            throw new NotFoundError('Shop not found');
        }
        if (!client) {
            throw new NotFoundError('Client not found');
        }
        const checkoutPresenter : CheckoutPresenter = {
            ...checkout,
            lines: checkoutLines,
            shop: {
                ...shop,
                lines: shopLines
            },
            client: client
        };
        return checkoutPresenter;
    }

    async deleteCheckout(id: number) : Promise<void> {
        const checkout = SharedMemory.checkouts.find(checkout => checkout.id === id);
        if (!checkout) {
            throw new NotFoundError('Checkout not found');
        }
        // Get sold quantity of each model to update shop lines
        const checkoutLines = SharedMemory.checkoutLines.filter(line => line.idCheckout === id);
        const shopLines = SharedMemory.shopLines.filter(line => line.idShop === checkout.idShop);
        checkoutLines.forEach(line => {
            const shopLine = shopLines.find(shopLine => shopLine.idModel === line.idModel);
            if (shopLine) {
                shopLine.soldQuantity -= line.quantity;
                shopLine.finalQuantity += line.quantity;
                shopLine.totalPriceTTC -= line.quantity * line.price * (1 + line.VAT / 100);
            }
        });
        // Update shop lines
        SharedMemory.shopLines = shopLines;
        // Delete checkout
        SharedMemory.checkouts = SharedMemory.checkouts.filter(checkout => checkout.id !== id);
        SharedMemory.checkoutLines = SharedMemory.checkoutLines.filter(line => line.idCheckout !== id);
    }    

    async updateCheckout(id: number, checkout: CheckoutInput) : Promise<Checkout> {
        const checkoutToUpdate = SharedMemory.checkouts.find(checkout => checkout.id === id);
        if (!checkoutToUpdate) {
            throw new NotFoundError('Checkout not found');
        }
        const updatedCheckout = {
            ...checkoutToUpdate,
            ...checkout,
            createdAt: checkout.createdAt ? new Date(checkout.createdAt) : checkoutToUpdate.createdAt
        };
        SharedMemory.checkouts = SharedMemory.checkouts.map(checkout => checkout.id === id ? updatedCheckout : checkout);
        return updatedCheckout;
    }
}