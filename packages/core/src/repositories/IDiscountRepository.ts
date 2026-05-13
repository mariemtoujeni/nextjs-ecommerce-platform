// Interface du repository pour la récupération des réductions d'un utilisateur
import { ReturnAll } from "../types/utils";
import { Discount, DiscountFilter, DiscountInput, DiscountLine, DiscountLineInput, OrderDiscount, OrderDiscountInput } from "../models/Discount";

export interface IDiscountRepository {
    read(userId: string): Promise<Discount[]>;
    readAll(options: DiscountFilter): Promise<ReturnAll<Discount>>;
    readClubDiscount(id: number): Promise<DiscountLine[]>;
    readCampagneDiscount(): Promise<DiscountLine[]>;
    readCodeDiscount(code: string): Promise<DiscountLine[]>;
    
    readDiscountById(id: number): Promise<Discount>;
    addDiscount(discount: DiscountInput): Promise<Discount>;
    updateDiscount(discount: Discount): Promise<Discount>;
    deleteDiscount(id: number): Promise<void>;

    readDiscountLineById(id: number): Promise<DiscountLine>;
    addDiscountLine(discountLine: DiscountLineInput): Promise<DiscountLine>;
    deleteDiscountLine(id: number): Promise<void>;
    updateDiscountLine(discountLine: DiscountLine): Promise<DiscountLine>;

    createOrderDiscount(orderDiscount: OrderDiscountInput): Promise<OrderDiscount>;
} 