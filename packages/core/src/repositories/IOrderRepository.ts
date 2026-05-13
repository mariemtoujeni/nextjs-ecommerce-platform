// Interface du repository pour la récupération des commandes d'un client
import { AdminOrder, Order, OrderAddress, OrderFilterInput, OrderInput, OrderLine, OrderLineInput
    , OrderPresenter, OrderSupplierLine, OrderWithAdmin, OrderWithClient} from "../models";
import { ReturnAll } from "../types/utils";


export type ReadOrderProps = {
    clientNumber?: number;
    orderNumber?: number;
    startDate?: Date;
    endDate?: Date;
    options?: OrderFilterInput
}

export interface IOrderRepository {
    read(clientNumber: number): Promise<Order[]>;
    readById(id: number): Promise<Order>;
    readOrderAddress(orderId: number): Promise<OrderAddress[]>;
    readAll(props: ReadOrderProps): Promise<ReturnAll<OrderWithClient>>;
    readAllOrderPresenter(props: ReadOrderProps): Promise<ReturnAll<OrderPresenter>>;
    readAllOrderLines(orderId: number): Promise<ReturnAll<OrderLine>>;
    updateOrderLine(orderLine: OrderLineInput): Promise<OrderLine>;
    updateOrderLines(orderLines: OrderLineInput[]): Promise<OrderLine[]>;
    readAdmin(id: number): Promise<OrderWithAdmin>;

    createOrder(order: OrderInput): Promise<Order>;
    createOrderLines(orderLines: OrderLineInput[]): Promise<OrderLine[]>;
    createOrderAddress(orderAddress: OrderAddress): Promise<OrderAddress>;
    createAdminOrder(adminOrder: AdminOrder): Promise<AdminOrder>;
    createOrderSupplierLine(orderSupplierLine: OrderSupplierLine): Promise<OrderSupplierLine>;       

    createOrderLine(orderLine: OrderLineInput[]): Promise<OrderLine[]>;
    
} 