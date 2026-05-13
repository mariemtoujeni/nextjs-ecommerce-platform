import { GenericFilter, getInjection } from "../../types";
import { ProductFilterTypeAdmin, ProductState } from "../../models";

const filterFetch: Record<ProductFilterTypeAdmin, () => Promise<GenericFilter>> = {
    [ProductFilterTypeAdmin.STORE]: async () => {
        const storeRepository = await getInjection('IStoreRepository');
        const stores = await storeRepository.readStoresList({ limit: 200, offset: 0, sort: "asc", search: "" });

        return {
            key: ProductFilterTypeAdmin.STORE
            , text: "Magasin"
            , values: stores.items.map(store => ({id: store.id, name: store.name}))
        }
    },
    [ProductFilterTypeAdmin.CATEGORY]: async () => {
        const categoryRepository = await getInjection('ICategoryRepository');
        const categories = await categoryRepository.readCategoriesList({limit: 200, offset: 0, sort: "asc", search: ""});

        return {key: ProductFilterTypeAdmin.CATEGORY, text: "Catégorie"
            , values: categories.items.map(category => ({id: category.id, name: category.name}))};
    },
    [ProductFilterTypeAdmin.SUBCATEGORY]: async () => {
        const subCategoryRepository = await getInjection('ISubCategoryRepository');
        const subCategories = await subCategoryRepository.readSubCategoriesList({limit: 200, offset: 0, sort: "asc", search: ""});

        return {key: ProductFilterTypeAdmin.SUBCATEGORY, text: "Sous-catégorie"
            , values: subCategories.items.map(subCategory => ({id: subCategory.id, name: subCategory.name}))};
    },
    [ProductFilterTypeAdmin.BRAND]: async () => {
        const brandRepository = await getInjection('IBrandRepository');
        const brands = await brandRepository.readAll({limit: 200, offset: 0, sort: "asc"});

        return {key: ProductFilterTypeAdmin.BRAND, text: "Marque"
            , values: brands.items.map(brand => ({id: brand.id, name: brand.name}))};
    },
    [ProductFilterTypeAdmin.ATTRIBUTE]: async () => {
        const attributeRepository = await getInjection('IAttributRepository');
        const attributes = await attributeRepository.readAllAttributesWithValues();

        return {key: ProductFilterTypeAdmin.ATTRIBUTE, text: "Attribut"
            , children: attributes.map(attribute => ({key: attribute.id.toString(), text: attribute.nom
                , values: attribute.attribut_valeurs.map(value => ({id: value.id, name: value.nom}))
            }))
        };
    },
    [ProductFilterTypeAdmin.SUPPLIER]: async () => {
        const supplierRepository = await getInjection('ISupplierRepository');
        const suppliers = await supplierRepository.readAll({
            limit: 200, offset: 0, sort: "asc",
            search: ""
        });

        return {key: ProductFilterTypeAdmin.SUPPLIER, text: "Fournisseur"
            , values: suppliers.items.map(supplier => ({id: supplier.id, name: supplier.name}))};
    },
    [ProductFilterTypeAdmin.STATE]: async () => ({key: ProductFilterTypeAdmin.STATE, text: "État"
        , values: [
            {id: ProductState.NORMAL, name: "Normal"},
            {id: ProductState.NEW_COLLECTION, name: "Nouvelle collection"},
            {id: ProductState.DISCONTINUED, name: "Plus fabriqué"},
            {id: ProductState.RESTOCK, name: "Reassort"},
            {id: ProductState.OLD_COLLECTION, name: "Ancienne collection"},
            {id: ProductState.CLUB, name: "Produit club"},
            {id: ProductState.TRASH, name: "Corbeille"},
        ]}),
}

export const getAdminProductFilters = async (): Promise<GenericFilter[]> => {
    const filter = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filter;
}