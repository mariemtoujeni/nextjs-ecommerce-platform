import { getProductAdminAction, readPackAction } from "@repo/actions/products";
import { getCategoriesAction } from "@repo/actions/categories";
import { getBrandsAction } from "@repo/actions/brand";
import { getStoresAction } from "@repo/actions/stores";
import { listCollectionsAction } from "@repo/actions/collections";
import { getSubCategoriesAction } from "@repo/actions/subcategories";
import { getSuppliersAction } from "@repo/actions/supplier";
import { createThreadAction } from "@repo/actions/assistant-ai";
import Edit from "./edit";
import { Product, ProductPack } from "@repo/core/models";

export type Props = {
    params: Promise<{ id: string }>;
}


export default async function EditProductPage(props: Props) {
    const { id } = await props.params;
    const product = await getProductAdminAction(id);
    const description = (product.descriptions || []).find((description) => description.lang === "fr")

    const categories = await getCategoriesAction({ limit: 1000 });
    const subCategories = await getSubCategoriesAction({ limit: 1000 });
    const brands = await getBrandsAction({ limit: 1000, sort: "asc_name" });
    const stores = await getStoresAction({ limit: 1000 });
    const collections = await listCollectionsAction();
    const suppliers = await getSuppliersAction();

    const threadId = await createThreadAction();
    let pack: ProductPack[] = [];
    if (product.isPackage) {
        const myPack = await readPackAction(product.id);
        pack = myPack.items;
    }

    return (
        <Edit product={product}
            categories={categories.items || []} 
            subCategories={subCategories.items || []} 
            brands={brands.items || []} 
            stores={stores.items || []} 
            collections={collections.items || []} 
            suppliers={suppliers.items || []} 
            aiThreadId={threadId.item}
            pack={pack || []}
        />
    );
}

