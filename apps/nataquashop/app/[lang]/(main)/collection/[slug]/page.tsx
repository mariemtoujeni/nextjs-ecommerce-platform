import { getCollectionAction } from "@repo/actions/collections";
import { Settings2 } from "lucide-react";
import { getDictionary } from "~/app/dictionaries";
import { LangParams } from "~/app/utils";
import { SelectPage } from "~/components/SelectPage";
import { ProductCard } from "~/components/product-card";
import { Button } from "~/components/ui";
import { getIdFromSlug } from "~/lib/utils";

interface Props {
    params: Promise<LangParams & {
        slug: string;
    }>;
    searchParams: Promise<{
        p: string;
    }>;
}


export default async function CollectionPage(props: Props) {
    const { slug, lang } = await props.params;
    const { p } = await props.searchParams;
    const translations = await getDictionary(lang);

    const collectionId = getIdFromSlug(slug);
    const collectionObject = await getCollectionAction(Number(collectionId));
    const collection = collectionObject.item;
    if(collectionObject.error) {
        console.log(collectionObject.error);
    }
    const nbPages = Math.ceil(collection?.products.total / 48);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex gap-3 py-8 text-sm text-neutral-500">
                    <a href={`/${lang}/${slug}`} className="hover:text-black">{collection?.general.name}</a>
                    
                    <span className="text-neutral-400">({collection.products.total})</span>
                </div>
                <div className="flex items-center gap-2">
                    <SelectPage p={p} nbPages={nbPages} />
                    <div>
                        <Button variant="outline" className="flex items-center gap-2">{translations.product.filter} <Settings2 className="w-4 h-4" /></Button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {collection.products.items.map((p) => (
                    <ProductCard key={p.product!.id} product={p.product!} lang={lang} translations={translations} />
                ))}
            </div>
        </div>
    );
}