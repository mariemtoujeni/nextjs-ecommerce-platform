import { Heading } from "~/components/ui/heading";
import { getAdminFilters } from "@repo/actions/products";
import { ProductsTable } from "./table";
import { SearchParams } from "@repo/core/types";
import Link from "next/link";
import NewProductButton from "./add/new-product-button";


export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
    const { page } = await searchParams;
    const filters = await getAdminFilters();

    return (
        <div className="container">
            <div className="flex justify-between">
                <Heading heading={"2"} className="text-gray-700">Catalogue des produits</Heading>
                <NewProductButton />             
            </div>
            <div className="mt-8">
                <ProductsTable filters={filters} defaultPage={page ? parseInt(page) : 1} /> 
            </div>
        </div>
    )
}