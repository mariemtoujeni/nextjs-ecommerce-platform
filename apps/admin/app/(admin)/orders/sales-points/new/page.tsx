import { getAllProductModelsAction } from "@repo/actions/product-models";
import { MainPanelComponent } from "./main-panel-component";

export default async function NewSalesPointsPage() {
    const products = await getAllProductModelsAction({ sort: "asc" });
    return <MainPanelComponent products={products} />;
}