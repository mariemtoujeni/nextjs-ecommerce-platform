export type Tab = "Magasins" | "Catégories" | "Sous-Catégories";

export interface TabConfig {
  titleAdd: string;
  titleEdit: string;
  imageUrl: string;
}

export const TAB_CONFIG: Record<Tab, TabConfig> = {
  Magasins: {
    titleAdd: "Ajouter magasin",
    titleEdit: "Éditer le magasin",
    imageUrl:
      "https://e237b522e5ca21a2ddd733ecbd1394a1.cdn.bubble.io/cdn-cgi/image/w=512,h=172,f=auto,dpr=1,fit=contain/f1719583505602x107871826812753870/Frame%201000003312-1.jpg",
  },
  Catégories: {
    titleAdd: "Ajouter catégorie",
    titleEdit: "Éditer la catégorie",
    imageUrl:
      "https://e237b522e5ca21a2ddd733ecbd1394a1.cdn.bubble.io/cdn-cgi/image/w=512,h=172,f=auto,dpr=1,fit=contain/f1719584538074x252274062906874500/Frame%201000003312.jpg",
  },
  "Sous-Catégories": {
    titleAdd: "Ajouter sous-catégorie",
    titleEdit: "Éditer la sous-catégorie",
    imageUrl:
      "https://e237b522e5ca21a2ddd733ecbd1394a1.cdn.bubble.io/cdn-cgi/image/w=512,h=172,f=auto,dpr=1,fit=contain/f1719584721442x226510849978167170/Frame%201000003312-2.jpg",
  },
};
