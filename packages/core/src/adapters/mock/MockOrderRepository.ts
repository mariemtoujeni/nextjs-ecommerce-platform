// Mock du repository des commandes pour les tests unitaires
import { IOrderRepository, ReadOrderProps } from "../../repositories";
import { AdminOrder, Order, OrderAddress, OrderInput, OrderLine, OrderLineInput, OrderPresenter, OrderSupplierLine, OrderWithAdmin, OrderWithClient } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { ReturnAll } from "../../types";
import { NotFoundError } from "../../types/error";

export class MockOrderRepository implements IOrderRepository {
    createOrderLine(orderLine: OrderLineInput[]): Promise<OrderLine[]> {
        throw new Error("Method not implemented.");
    }
   
    readAdmin(id: number): Promise<OrderWithAdmin> {
        throw new Error("Method not implemented.");
    }
    createOrderSupplierLine(orderSupplierLine: OrderSupplierLine): Promise<OrderSupplierLine> {
        throw new Error("Method not implemented.");
    }
    createOrder(order: OrderInput): Promise<Order> {
        throw new Error("Method not implemented.");
    }
    createOrderLines(orderLines: OrderLineInput[]): Promise<OrderLine[]> {
        throw new Error("Method not implemented.");
    }
    readOrderAddress(orderId: number): Promise<OrderAddress[]> {
        throw new Error("Method not implemented.");
    }
    createOrderAddress(orderAddress: OrderAddress): Promise<OrderAddress> {
        throw new Error("Method not implemented.");
    }
    createAdminOrder(adminOrder: AdminOrder): Promise<AdminOrder> {
        throw new Error("Method not implemented.");
    }
    
    async read(clientNumber: number): Promise<Order[]> {
        return SharedMemory.orders.filter(order => order.clientId === clientNumber);
    }

    async readById(id: number): Promise<Order> {
        return SharedMemory.orders.find(order => order.id === id) as Order;
    }

    async readAllOrderPresenter(props: ReadOrderProps): Promise<ReturnAll<OrderPresenter>> {
        throw new Error("Not implemented");
    }

    async readAll(props: ReadOrderProps): Promise<ReturnAll<OrderWithClient>> {
        return {
            items: SharedMemory.orders.map(order => {
                const client = SharedMemory.clients.find(client => client.clientNumber === order.clientId);
                if (!client) {
                    throw new NotFoundError(`Client with clientNumber ${order.clientId} not found`);
                }
                return {
                    ...order,
                    client
                };
            }),
            total: SharedMemory.orders.length,
            count: SharedMemory.orders.length
        };
    }

    async readAllOrderLines(orderId: number): Promise<ReturnAll<OrderLine>> {
        throw new Error("Not implemented");
    }

    async updateOrderLine(orderLine: OrderLineInput): Promise<OrderLine> {
        throw new Error("Not implemented");
    }

    async updateOrderLines(orderLines: OrderLineInput[]): Promise<OrderLine[]> {
        throw new Error("Not implemented");
    }
} 