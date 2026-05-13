import { Heading } from "~/components/ui";
import { getAdminStockFilters, getListAllStocksAction } from "@repo/actions/stocks";
import { SearchParams } from "@repo/core/types";
import { ListStocksView } from "./listStocks";

export default async function StockPage({ searchParams }: { searchParams: SearchParams }) {
    const { page } = await searchParams;
    const filters = await getAdminStockFilters();
    const stocks = await getListAllStocksAction();
    return (
        <div className="container">
            <Heading heading={"2"} className="text-gray-700">Stock</Heading>
            <div className="mt-8">
                <ListStocksView stocks={stocks} filters={filters} page={page ? parseInt(page) : 1} />
            </div>
        </div>
    )
}