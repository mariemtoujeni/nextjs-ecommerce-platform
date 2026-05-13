import { SearchParams } from "@repo/core/types";
import { Heading } from "~/components/ui/heading";
import { OrdersTable } from "./table";

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
    const { page } = await searchParams;
    
 
    return (
        <div className="container">
            <Heading heading={"2"} className="text-gray-700">Commandes</Heading>
            <div className="mt-8">
                <OrdersTable defaultPage={page ? parseInt(page) : 1} filters={[]} />
            </div>
        </div>
    )
}