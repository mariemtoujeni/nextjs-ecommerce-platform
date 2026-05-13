type MegaMenuStore = {
  id: number
  name: string
  categories: {
    id: number
    name: string
    subcategories: {
      id: number
      name: string
    }[]
  }[]
}

export function buildMegaMenu(
  stores: { id: number; name: string }[],
  categories: { id: number; name: string; storeId: number }[],
  subcategories: { id: number; name: string; categoryId: number }[]
): MegaMenuStore[] {
  return stores.map((store) => ({
    id: store.id,
    name: store.name,
    categories: categories
      .filter((cat) => cat.storeId === store.id)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        subcategories: subcategories
          .filter((sub) => sub.categoryId === cat.id)
          .map((sub) => ({
            id: sub.id,
            name: sub.name,
          })),
      })),
  }))
}
