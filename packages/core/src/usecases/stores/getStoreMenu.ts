import { getInjection } from "../../types/di";
import { CategoryWithSubCategories, StoreMenu } from "../../models";

export const getStoreMenu = async (lang: string): Promise<StoreMenu[]> => {
    const storeRepository = await getInjection("IStoreRepository")
    let storeMenuLines = await storeRepository.readMenu(lang);

    const storeMenu: StoreMenu[] = [];

    while(storeMenuLines.length > 0) {
        const storeMenuLine = storeMenuLines[0]!;
        const newStoreMenu: StoreMenu = {
            id: storeMenuLine.store.id,
            name: storeMenuLine.store.name,
            categories: [],
            order: storeMenuLine.store.order,
            active: storeMenuLine.store.active
        }

        let allCategoriesOnStore = storeMenuLines.filter(line => line.store.id === storeMenuLine.store.id);

        while(allCategoriesOnStore.length > 0) {
            const currentCategory = allCategoriesOnStore[0]!;

            const newCategory: CategoryWithSubCategories = {
                id: currentCategory.category.id,
                name: currentCategory.category.name,
                subCategories: [],
                order: currentCategory.category.order,
                active: 1,
            }


            newCategory.subCategories = allCategoriesOnStore.filter(line => line.category.id === currentCategory.category.id)
                .map(line => {
                    return {
                        id: line.subCategory.id,
                        name: line.subCategory.name,
                        order: line.subCategory.order,
                        active: line.subCategory.active,
                    }
                });

            newStoreMenu.categories.push(newCategory);

            allCategoriesOnStore = allCategoriesOnStore.filter(line => line.category.id !== currentCategory.category.id);
        }

        storeMenu.push(newStoreMenu);

        storeMenuLines = storeMenuLines.filter(line => line.store.id !== storeMenuLine.store.id);
    }


    return storeMenu.filter(store => store.active !== 0).sort((a, b) => a.order - b.order);
}