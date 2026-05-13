"use client";

import { listAllOrdersActions } from "@repo/actions/orders"
import { OrderFilterInput, OrderStatus, OrderWithClient } from "@repo/core/models"
import { GenericFilter, ReturnAll } from "@repo/core/types"
import { startTransition, useActionState, useEffect, useState } from "react"
import { TableFilter } from "~/components/TableFilter"
import { Checkbox } from "~/components/ui";
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { OrderStateBadges } from "./state";


export type OrdersTableProps = {
    filters: GenericFilter[],
    defaultPage: number
}

const LIMIT = 100;

export const OrdersTable = ({ defaultPage, filters }: OrdersTableProps) => {
    const [orders, fetchOrders, pending] = useActionState(
        (state: ReturnAll<OrderWithClient>, payload: OrderFilterInput) => listAllOrdersActions(payload), 
        { total: 0, items: [], count: 0 }
    );

    const [page, setPage] = useState(defaultPage);
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

    useEffect(() => {
        startTransition(() => {
            fetchOrders({limit: LIMIT, offset: (page - 1)
            });
        });
    }, [page]);

    
    return (
        <Card>
            <CardHeader className="flex justify-end flex-row">
                <TableFilter items={{total: orders.total, count: LIMIT, defaultPage}} onPageChange={(page) => setPage(page)} />
            </CardHeader>
            <CardContent className="px-0">
                <Table>
                    <TableHeader className="bg-neutral-100">
                        <TableRow>
                            <TableHead className="w-[24px]">
                                <Checkbox className="bg-white" checked={selectedOrders.length > 0} 
                                onClick={() => {
                                    if (selectedOrders.length > 0) {
                                        setSelectedOrders([]);
                                    } else {
                                        const filteredOrders = orders.items.filter(order => order.status == OrderStatus.PAIMENT_ACCEPTE || order.status == OrderStatus.ATTENTE_PAIMENT);
                                        setSelectedOrders(filteredOrders.map(order => order.id));
                                    }
                                }}
                                />
                            </TableHead>
                            <TableHead className="w-1/12">Référence</TableHead>
                            <TableHead className="w-2/12">Date</TableHead>
                            <TableHead className="w-6/12">Client</TableHead>
                            <TableHead className="w-2/12">Statut</TableHead>
                            <TableHead className="text-end w-2/12">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            orders.items.map((order) => {
                                const date = new Date(order.createdAt);
                            
                                return <TableRow key={order.id}>
                                    <TableCell>
                                        {
                                            order.status == OrderStatus.PAIMENT_ACCEPTE ?
                                                <Checkbox checked={selectedOrders.includes(order.id)} 
                                                    onClick={() => {
                                                        if (selectedOrders.includes(order.id)) {
                                                            setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                                        } else {
                                                            setSelectedOrders([...selectedOrders, order.id]);
                                                        }
                                                    }} />
                                            :
                                                <></>
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <a href={`/orders/edit/${order.id}`} className="block relative h-full">{order.id}</a>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        <a href={`/orders/edit/${order.id}`} className="block relative h-full">{date.toLocaleString()}</a>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        <a href={`/orders/edit/${order.id}`} className="block relative h-full">{order.client.firstName} {order.client.lastName}</a>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        <a href={`/orders/edit/${order.id}`}>{OrderStateBadges[order.status]}</a>
                                    </TableCell>
                                    <TableCell className="text-gray-700 text-end text-lg text-bold">
                                        <a href={`/orders/edit/${order.id}`} className="block relative h-full">{order.amount.toFixed(2)} €</a>
                                    </TableCell>
                                </TableRow>
                            })
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}