import { getProductAdminAction } from "@repo/actions/products";
import { getCategoriesAction } from "@repo/actions/categories";
import { getBrandsAction } from "@repo/actions/brand";
import { getStoresAction } from "@repo/actions/stores";
import { listCollectionsAction } from "@repo/actions/collections";
import { getSubCategoriesAction } from "@repo/actions/subcategories";
import { getSuppliersAction } from "@repo/actions/supplier";
import { createThreadAction } from "@repo/actions/assistant-ai";
import Add from "./add";
import { getAllAttributesWithValuesAction } from "@repo/actions/attributes";


export default async function AddProductPage() {

    const categories = await getCategoriesAction({ limit: 1000 });
    const subCategories = await getSubCategoriesAction({ limit: 1000 });
    const brands = await getBrandsAction({ limit: 1000, sort: "asc_name" });
    const stores = await getStoresAction({ limit: 1000 });
    const collections = await listCollectionsAction();
    const suppliers = await getSuppliersAction();
    const allAttributesWithValues = await getAllAttributesWithValuesAction();
    const threadId = await createThreadAction();

    return (
        <Add 
            categories={categories.items || []} 
            subCategories={subCategories.items || []} 
            brands={brands.items || []} 
            stores={stores.items || []} 
            collections={collections.items || []} 
            suppliers={suppliers.items || []} 
            aiThreadId={threadId.item}
            allAttributesWithValues={allAttributesWithValues.items || []}
        />
    );
}

