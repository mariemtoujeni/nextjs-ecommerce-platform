import { Cart, CartInput, Country, CreateAdminAlert, DeliveryCart, DeliveryCartInput, DiscountCart, DiscountCartInput, Stock } from "../models";


export interface ICartRepository {
    updateCartunit(cart: Cart, hasCustomization: boolean): Promise<Cart>;
    addCartUnit(cart: CartInput, hasCustomization: boolean): Promise<Cart>;
    getCartUnit(userId: string, modelId: number): Promise<Cart | null> 
    deleteCartUnit(userId: string, modelId: number): Promise<void>;
    deleteCart(userId: string): Promise<void>;
    getCustomerCart(userId: string): Promise<Cart[]>;

    addDeliveryCart(deliveryCart: DeliveryCartInput): Promise<DeliveryCart>;
    updateDeliveryCart(deliveryCart: DeliveryCartInput): Promise<DeliveryCart>;
    getDeliveryCartbyId(userId: string): Promise<DeliveryCart | null>;
    deleteDeliveryCart(userId: string): Promise<void>;
    updateDeliveryPriceForCart(deliveryCart: DeliveryCart): Promise<DeliveryCart>;

    addDiscountCart(discountCart: DiscountCartInput): Promise<DiscountCart>;
    updateDiscountCart(discountCart: DiscountCart): Promise<DiscountCart>;
    getUserDiscountCart(userId: string): Promise<DiscountCart[]>;
    deleteDiscountCart(userId: string): Promise<void>;

    createAdminAlert(data: CreateAdminAlert): Promise<void>;
    getCountryWithoutTVA(code: string): Promise<Country>;
    getStockList(cart : Cart[]): Promise<Stock[]>;
    updateStockList(stock: Stock[]): Promise<void>;
    updateStock(stock: Stock): Promise<Stock>;
    modelStockAvailable(modelId: number, requestedQty: number): Promise<number>;
    getStockByModelId(modelId: number): Promise<Stock>;
}