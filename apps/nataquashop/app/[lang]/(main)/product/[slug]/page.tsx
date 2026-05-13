import { getProductBySousCategorieAction, readPackAction, readProductAction, } from "@repo/actions/products";
import { getDictionary } from "~/app/dictionaries";
import { redirect } from "next/navigation";
import { LangParams } from "~/app/utils";
import { ProductImages } from "./components/ProductImage";
import { ProductInfo } from "./components/ProductInfo";
import { Heading } from "~/components/ui";
import { ProductSelectionProvider } from "./components/ProductSelectionContext";
import { getOpinionByProductIdAction, getProductOpinionAction, } from "@repo/actions/opinions";
import { ProductCard } from "~/components/product-card";
import { parseEditorStateString, serializeEditorStateToHtml, } from "@repo/actions/_utils";
import { ProductPack } from "@repo/core/models";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";

export type Props = {
  params: Promise<LangParams & { slug: string }>;
};

export default async function ProductPage(props: Props) {
  const { slug, lang } = await props.params;
  const idFromSlug = slug.split("-").shift();

  const productId = parseInt(idFromSlug || "", 10);

  let product = null;
  try {
    product = await readProductAction(productId);
  } catch (error) {
    // TODO : notFound ?
    return redirect(`/${lang}/`);
  }

  if (!product) {
    // TODO : notFound ?
    return redirect(`/${lang}/`);
  }
  const translations = await getDictionary(lang);
  const similarProducts = await getProductBySousCategorieAction(productId);
  const avg_note = await getProductOpinionAction(productId);
  const reviews = await getOpinionByProductIdAction(productId);
  let pack: ProductPack[] = [];
  if (product.isPackage) {
    const myPack = await readPackAction(productId);
    pack = myPack.items;
  }
  const langProductDescription = product.descriptions.find((d) => d.lang === lang);
  const description = langProductDescription ? langProductDescription.description : product.descriptions[0]?.description ?? "";
  const title = product.descriptions.find((prd) => prd.lang === lang)?.title;
  return (
    <>
      <div className="grid gap-6 sm:gap-8 md:gap-10 p-4 sm:p-6 md:p-10 items-start grid-cols-1 md:grid-cols-[1fr_0.75fr]">
        <ProductSelectionProvider>
          <ProductImages
            product={product}
            translations={translations}
            avg_note={avg_note}
            reviews={reviews}
          />
          <div>
            <Heading heading={"3"}>
              {title}
            </Heading>
            <ProductInfo product={product} translations={translations} pack={pack} lang={lang} />
            <div className="w-full relative">
            <Accordion type="multiple">
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex justify-between items-center cursor-pointer font-bold text-base w-full">{translations.product.similarProducts.description}</AccordionTrigger>
                <AccordionContent>
                  <section className="mt-6">
                    <div
                      className="mt-[10px] text-gray "
                      dangerouslySetInnerHTML={{
                        __html: serializeEditorStateToHtml(
                          parseEditorStateString(description)
                        ),
                      }}
                    />
                  </section>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="flex justify-between items-center cursor-pointer font-bold text-base w-full">{translations.product.similarProducts.specification}</AccordionTrigger>
                <AccordionContent>
                  <section className="mt-6">
                    <div className="mt-2 text-gray text-[16px]">
                      <span className="block">Marque : {product.brand?.name}</span>
                      <span className="block">Style : {product.id}</span>
                    </div>
                  </section>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            </div>
          </div>
        </ProductSelectionProvider>
      </div>
      <div>
        <div className=" mx-auto px-4">
          <div className="text-[32px] font-bold mb-4">
            {translations.product.similarProducts.title}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <ProductCard
                product={product}
                lang={lang}
                translations={translations}
                key={product.id}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
