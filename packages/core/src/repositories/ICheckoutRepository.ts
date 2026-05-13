import { Checkout, CheckoutFilterInput, CheckoutInput, CheckoutLine, CheckoutPresenter, CreateCheckoutRequest } from "../models";
import { ReturnAll } from "../types";

export interface ICheckoutRepository {
    readCheckouts() : Promise<Checkout[]>;
    readCheckoutsByShopId(shopId: number) : Promise<ReturnAll<Checkout>>;
    readCheckoutsShopsUsers(options?: CheckoutFilterInput) : Promise<ReturnAll<CheckoutPresenter>>;
    readCheckoutById(id: number) : Promise<CheckoutPresenter>;
    readCheckoutByDateInterval(startDate: Date, endDate: Date) : Promise<CheckoutPresenter[]>;
    createCheckout(checkout: CreateCheckoutRequest) : Promise<Checkout>;
    updateCheckout(id: number, checkout: CheckoutInput) : Promise<Checkout>;
    deleteCheckout(id: number) : Promise<void>;
    readCheckoutLinesByCheckoutId(checkoutId: number) : Promise<CheckoutLine[]>;
}