import { getAllProductModelsAction } from "@repo/actions/product-models";
import { MainPanelComponent } from "./main-panel-component";

export default async function ReturnPage() {
    const products = await getAllProductModelsAction({ sort: "asc" });
    
    // Debug logging
    //console.log('Products from action:', products);
    
    // Ensure products is always defined with a fallback
    const safeProducts = products || { items: [], total: 0, count: 0 };
    
    return <MainPanelComponent products={safeProducts} />;
}