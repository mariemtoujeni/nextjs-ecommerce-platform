import { Cart, CartDiscountType, CartInput, DeliveryCart
        , CreateAdminAlert, DeliveryCartInput,
        DiscountCart, DiscountCartInput} from "../../models/Cart";
import { ICartRepository } from "../../repositories/ICartRepository";
import { SharedMemory } from "./SharedMemory";
import { InternalServerError } from "../../types/error";
import { Stock } from "../../models/Product";
import { Country } from "../../models/ShipmentConf";
import { DiscountType } from "../../models/Checkout";
import { OrderDeliveryMode, ReductionType, ReductionValueType } from "../../models";

export class MockCartRepository implements ICartRepository {
    updateDiscountCart(discountCart: DiscountCart): Promise<DiscountCart> {
        throw new Error("Method not implemented.");
    }
    async deleteDiscountCart(userId: string): Promise<void> {
        const initialLength = SharedMemory.cart.length;
        SharedMemory.cart = SharedMemory.cart.filter(
            c => !(c.userId === userId)
        );
        if (SharedMemory.cart.length === initialLength) {
            throw new InternalServerError("Cart item not found");
        }
    }
    async updateDeliveryPriceForCart(deliveryCart: DeliveryCart): Promise<DeliveryCart> {
        if (!deliveryCart) {
            throw new InternalServerError("DeliveryCart object is required");
        }
        //find the delivery zone based on country and deliveryMode
        const zone = SharedMemory.shipmentsZonesCountries.find(
            z => z.code === deliveryCart.country && z.mode_livraison === deliveryCart.deliveryMode
        );
        if (!zone) {
            throw new InternalServerError(
                `No livraison zone found for country ${deliveryCart.country} and delivery mode ${deliveryCart.deliveryMode}`
            );
        }
        //find the corresponding delivery price for the weight
        const livraison = SharedMemory.shipmentConfs.find(
            l =>
                l.mode_livraison === deliveryCart.deliveryMode &&
                l.zone === zone.zone &&
                l.poids_min <= deliveryCart.weight &&
                l.poids_max > deliveryCart.weight
        );
        if (!livraison) {
            throw new InternalServerError(
                `No livraison price found for weight ${deliveryCart.weight} in zone ${zone.zone}`
            );
        }
        //update the price in SharedMemory.deliveryCarts
        const index = SharedMemory.deliveryCarts.findIndex(dc => dc.userId === deliveryCart.userId);
        if (index === -1) {
            throw new InternalServerError(`Delivery cart not found for user ${deliveryCart.userId}`);
        }
        SharedMemory.deliveryCarts[index] = {
            ...(SharedMemory.deliveryCarts[index] as DeliveryCart),
            prix: livraison.prix
        };
        return SharedMemory.deliveryCarts[index];
    }

    async addDiscountCart(discountCart: DiscountCartInput): Promise<DiscountCart> {
        const existingIndex = SharedMemory.discountCarts.findIndex( c => c.userId === discountCart.userId );

        if (existingIndex !== -1) {
            throw new InternalServerError("Item already exists in discount cart");
        }

        const newdiscountCartItem: DiscountCart = {
            userId: discountCart.userId,
            id: SharedMemory.discountCarts.length + 1,
            discountType: discountCart.discountType,
            discountTypeValue: discountCart.discountTypeValue,
            value: discountCart.value,
            info: discountCart.info
        };

        SharedMemory.discountCarts.push(newdiscountCartItem);
        return newdiscountCartItem;
    }

    async getUserDiscountCart(userId: string): Promise<DiscountCart[]> {
        return SharedMemory.discountCarts.filter(c => c.userId === userId);
    }

    getStockList(cart: Cart[]): Promise<Stock[]> {
        throw new Error("Method not implemented.");
    }
    updateStockList(stock: Stock[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deleteCart(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    createAdminAlert(data: CreateAdminAlert): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getCountryWithoutTVA(code: string): Promise<Country> {
        throw new Error("Method not implemented.");
    }
    deleteDeliveryCart(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async addDeliveryCart(deliveryCart: DeliveryCartInput): Promise<DeliveryCart> {
        const deliveryCartToAdd: DeliveryCart = {
            billingAddress: [],
            clientAddress: [],
            userId: deliveryCart.userId,
            deliveryMode: deliveryCart.deliveryMode,
            billingAddressId: deliveryCart.billingAddressId,
            relaisId: deliveryCart.relaisId,
            weight: deliveryCart.weight,
            prix: deliveryCart.prix,
            company: deliveryCart.company,
            lastName: deliveryCart.lastName,
            firstName: deliveryCart.firstName,
            adress: deliveryCart.adress,
            adress2: deliveryCart.adress2,
            adress3: deliveryCart.adress3,
            postCode: deliveryCart.postCode,
            city: deliveryCart.city,
            country: deliveryCart.country,
            clientAddressId: deliveryCart.clientAddressId,
            valid: deliveryCart.valid,
        }
        SharedMemory.deliveryCarts.push(deliveryCartToAdd);
        const addedDeliveryCart = SharedMemory.deliveryCarts.find(dc => dc.userId === deliveryCart.userId);
        if (!addedDeliveryCart) {
            throw new InternalServerError(`Error adding delivery cart for user : ${deliveryCart.userId}`);
        }
        return addedDeliveryCart;
    }

    async updateDeliveryCart(data: DeliveryCart): Promise<DeliveryCart> {
        const index = SharedMemory.deliveryCarts.findIndex(deliveryCart => deliveryCart.userId === data.userId);
        SharedMemory.deliveryCarts[index] = data;
        return data;
    }

    async getDeliveryCartbyId(userId: string): Promise<DeliveryCart | null> {
        const deliveryCart = SharedMemory.deliveryCarts.find(deliveryCart => deliveryCart.userId === userId);
        if (!deliveryCart) {
            return null;
        }
        return deliveryCart;
    }
    
    async modelStockAvailable(modelId: number, requestedQty: number): Promise<number> {
        const stock = SharedMemory.stocks.find(s => s.idModel === modelId);
        
        if (!stock) {
            throw new InternalServerError(`Stock not found for model: ${modelId}`);
        }

        const futureDisponible = stock.disponible - requestedQty;
        return futureDisponible;
    }

    async updateStock(stock: Stock): Promise<Stock> {
        const index = SharedMemory.stocks.findIndex(s => s.idModel === stock.idModel);
        if (index === -1) {
            throw new InternalServerError(`Stock not found for model: ${stock.idModel}`);
        }
        SharedMemory.stocks[index] = stock;
        return stock;
    }

    async getStockByModelId(modelId: number): Promise<Stock> {
        const stock = SharedMemory.stocks.find(s => s.idModel === modelId);
        if (!stock) {
            throw new InternalServerError(`Stock not found for model: ${modelId}`);
        }
        return stock;
    }
    
    async updateCartunit(cart: Cart): Promise<Cart> {
        const index = SharedMemory.cart.findIndex(c => c.userId === cart.userId && c.modelId === cart.modelId);
        if (index === -1) {
            throw new InternalServerError("Cart item not found");
        }
        SharedMemory.cart[index] = cart;
        return cart;
    }

    async addCartUnit(cart: CartInput): Promise<Cart> {
        const existingIndex = SharedMemory.cart.findIndex(
            c => c.userId === cart.userId && c.modelId === cart.modelId
        );

        if (existingIndex !== -1) {
            throw new InternalServerError("Item already exists in cart");
        }

        const newCartItem: Cart = {
            userId: cart.userId,
            modelId: cart.modelId,
            quantity: cart.quantity,
            shipping: '24h',
            customization: false,
            text: "",
            price: 0,
            discountType: ReductionType.ADHERENT_CLUB,
            discountValueType: ReductionValueType.MONTANT,
            discountValue: 0,
            discountInfo: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            model: {
                id: cart.modelId,
                productId: 0,
                priceWithVat: 0,
                priceWithoutVat: 0,
                weight: 0,
                published: true,
                minStock: 0,
                attributs: [],
                attributValeurs: [],
                productDetails: {
                    descriptions: [],
                    images: [],
                },
                attributValues: [],
            },
            textPersonalisation: "",
            typePersonalisation: ""
        };

        SharedMemory.cart.push(newCartItem);
        return newCartItem;
    }

    async getCartUnit(userId: string, modelId: number): Promise<Cart | null> {
        return SharedMemory.cart.find(
            c => c.userId === userId && c.modelId === modelId
        ) || null;
    }

    async deleteCartUnit(userId: string, modelId: number): Promise<void> {
        SharedMemory.cart = SharedMemory.cart.filter(
            c => !(c.userId === userId && c.modelId === modelId)
        );
    }


    async getCustomerCart(userId: string): Promise<Cart[]> {
        return SharedMemory.cart.filter(c => c.userId === userId);
    }
}