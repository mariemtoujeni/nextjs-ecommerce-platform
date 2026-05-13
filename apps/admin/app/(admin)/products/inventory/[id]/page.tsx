import { getAllProductModelsAction } from "@repo/actions/product-models";
import { MainPanelComponent } from "./main-panel";
import { getInventoryAction } from "@repo/actions/inventory";
import { SearchParams } from "@repo/core/types";

interface NewInventoryPageProps {
  params: Promise<{ id: string }>; 
  searchParams: SearchParams;
}

export default async function NewInventoryPage({ params, searchParams }: NewInventoryPageProps) {
  const { id } = await params;
  const products = await getAllProductModelsAction({ sort: "asc" });
  const inventory = await getInventoryAction(Number(id)); 
  const { page } = await searchParams;
  return <MainPanelComponent products={products} inventory={inventory} defaultPage={page ? parseInt(page) : 1}/>;
}
