
import { LangParams } from "~/app/utils";
import { dictionary, getDictionary } from "~/app/dictionaries";
import { notFound } from "next/navigation";
import { Category, ProductFilterTypeAdmin, ProductStatus, Store, SubCategory } from "@repo/core/models";
import { getStoreAction } from "@repo/actions/stores";
import { getCategoryAction } from "@repo/actions/categories";
import { getSubCategoryAction } from "@repo/actions/subcategories";
import { getIdFromSlug } from "~/lib/utils";
import StorePageClient from "~/components/store-page-client";


interface Props {
    params: Promise<LangParams & {
        storeSlug: string;
        categorySlug: string;
        subCategoryslug: string;
    }>;
    searchParams: Promise<{
        p: string;
    }>;
}

export default async function StorePage(props: Props) {
    const { storeSlug, categorySlug, subCategoryslug, lang } = await props.params;
    const { p } = await props.searchParams;

    const storeId = getIdFromSlug(storeSlug);
    let categoryId = "-";
    let sousCategoryId = "-";
    if (!storeId || isNaN(Number(storeId))) {
        return notFound();
    }

    const store = await getStoreAction(Number(storeId));

    let filters = [{ key: ProductFilterTypeAdmin.STORE, values: [storeId] }, { key: ProductFilterTypeAdmin.STATE, values: [ProductStatus.PUBLISHED] }];

    let category: Category | null = null;
    if (categorySlug) {
        categoryId = getIdFromSlug(categorySlug);
        if (!isNaN(Number(categoryId))) {
            filters.push({ key: ProductFilterTypeAdmin.CATEGORY, values: [categoryId] });
            category = await getCategoryAction(Number(categoryId));
        }
    }

    let sousCategory: SubCategory | null = null;
    if (subCategoryslug) {
        sousCategoryId = getIdFromSlug(subCategoryslug);
        if (!isNaN(Number(sousCategoryId))) {
            filters.push({ key: ProductFilterTypeAdmin.SUBCATEGORY, values: [sousCategoryId] });
            sousCategory = await getSubCategoryAction(Number(sousCategoryId));
        }
    }

    const translations: dictionary = await getDictionary(lang);

    return <StorePageClient 
        filters={filters} storeSlug={storeSlug} 
        store={store ? store : undefined as unknown as Store} 
        categorySlug={categorySlug} 
        category={category ? category : undefined as unknown as Category} 
        subCategoryslug={subCategoryslug} 
        sousCategory={sousCategory ? sousCategory : undefined as unknown as SubCategory} 
        title={translations.product.filter} 
        lang={lang} 
        translations={translations} 
        p={p} 
    />;
}
