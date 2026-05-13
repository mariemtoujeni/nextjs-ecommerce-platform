import type { Metadata } from "next";
import { ProductCard } from "~/components/product-card";
import { getDictionary } from "../../dictionaries";
import { LangParams } from "../../utils";
import { Event, Product, ProductFilterTypeAdmin } from "@repo/core/models";
import { generateSlug } from "~/lib/slugs";
import { Button, Heading } from "~/components/ui";
import { ArrowRight, ArrowUpRight, Link } from "lucide-react";
import {
  getCollectionAction,
  getPublishedCollectionAction,
} from "@repo/actions/collections";
import { getPublishedEventsAction } from "@repo/actions/events";
import { getAllProductAction } from "@repo/actions/products";
import Image from "next/image";
import { EventCard } from "~/components/event-card";

type Props = {
  params: Promise<LangParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return {
    title: dict.home.title,
    description: dict.home.description,
  };
}

const homeContent = {
  banner: {
    title: "GAMME COMPETITION",
    image: "/api/assets/home/landscape/competition_11zon.webp",
    store: {
      id: 1,
      name: "Maillot & combi",
    },
    subCategory: {
      id: 1,
      name: "Competition",
    },
    category: {
      id: 1,
      name: "femme",
    },
  },
  showCase: [
    {
      title: "Combinaisons compétition",
      image: "/api/assets/home/combi.webp",
      store: {
        id: 1,
        name: "Maillot & combi",
      },
      category: {
        id: 32,
        name: "Junior Fille",
      },
      subCategory: {
        id: 1,
        name: "Competition",
      },
    },
    {
      title: "Short de plage",
      image: "/api/assets/home/shorts.webp",
      store: {
        id: 1,
        name: "Maillot & combi",
      },
      category: {
        id: 2,
        name: "Homme",
      },
      subCategory: {
        id: 3,
        name: "Plage",
      },
    },
    {
      title: "Short Compétition",
      image: "/api/assets/home/short-competition.webp",
      store: {
        id: 1,
        name: "Maillot & combi",
      },
      category: {
        id: 2,
        name: "Homme",
      },
      subCategory: {
        id: 1,
        name: "Compétition",
      },
    },
  ],
  collectionHighlight: {
    title: "Maillots de plage",
    image: "/api/assets/home/maillots-plage.webp",
    collection: {
      id: 1159,
      name: "Sélection tendance",
    },
  },
  news: {
    image: "/api/assets/home/swimmer-solo.webp",
    collection: {
      id: 1159,
      name: "Sélection tendance",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam porttitor venenatis interdum. Etiam nulla tortor, fringilla eget vulputate sit amet, tempus ac urna.<br>Quisque non nulla nec lectus vehicula pellentesque. Sed feugiat sit amet ante a viverra. ",
    },
  },
};

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  let trending = undefined;
  try {
    const trendingObject = await getPublishedCollectionAction(1159);
    trending = trendingObject.item;
  } catch (error) {
    console.log(error);
  }

  const bestSellers = await getAllProductAction({
    filters: [{ key: ProductFilterTypeAdmin.STORE, values: ["2"] }],
    limit: 4,
    offset: 13,
  });
   // Fetch published events
  let events: Event[] = [];
  try {
    const eventResult = await getPublishedEventsAction();
    events = eventResult.items;
  } catch (error) {
    console.log(error);
  }


  return (
    <>
      {/* Bannière GAMME COMPETITION */}
      <div className="relative w-full h-[80vh]">
        <div className="absolute inset-0 h-full w-full -z-10 bg-black">
          <img
            src={homeContent.banner.image}
            alt="Competition"
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        <div className="h-full flex justify-between p-8">
          <Heading
            heading="1"
            className="text-lime leading-none w-2/3 self-end"
          >
            {homeContent.banner.title}
          </Heading>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {homeContent.showCase.map((showCase, idx) => {
            const storeSlug = generateSlug(
              showCase.store.name,
              showCase.store.id
            );
            const categorySlug = generateSlug(
              showCase.category.name,
              showCase.category.id
            );
            const subCategorySlug = generateSlug(
              showCase.subCategory.name,
              showCase.subCategory.id
            );

            return (
              <a
                href={`${lang}/${storeSlug}/${categorySlug}/${subCategorySlug}`}
                key={`showcase-${idx}`}
                className="w-full block max-h-[95vh]"
                style={{ aspectRatio: "2/3" }}
              >
                <div
                  key={idx}
                  className={`h-full w-full bg-cover bg-center`}
                  style={{ backgroundImage: `url(${showCase.image})` }}
                >
                  <div className="bg-gradient-to-b from-black/0 to-black/75 w-full h-full p-4 flex flex-col justify-end">
                    <Heading heading="4" className="text-white uppercase">
                      {showCase.title}
                    </Heading>
                    <Button
                      variant="outline"
                      className="text-white border-white w-full mt-4"
                    >
                      <ArrowUpRight size={16} /> {dict.home.banner.cta}
                    </Button>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* NOTRE SÉLECTION TENDANCE */}
      <section className="py-12 px-4 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-1/4">
          <Heading heading="2" className="uppercase">
            {dict.home.trending.title}
          </Heading>
        </div>
        <div className="w-full lg:w-3/4 overflow-x-auto">
          <div className="flex gap-4 px-4">
            {trending?.products.items.map((product, idx) => (
              <ProductCard
                key={idx}
                product={product.product!}
                lang={lang}
                translations={dict}
                width={300}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bannière Maillots de plage */}
      <a
        href={`${lang}/collection/${generateSlug(homeContent.collectionHighlight.collection.name, homeContent.collectionHighlight.collection.id)}`}
      >
        <div
          className="relative w-full h-[80vh] bg-center bg-cover"
          style={{
            backgroundImage: `url(${homeContent.collectionHighlight.image})`,
          }}
        >
          <div className="inset-0 bg-gradient-to-b from-black/0 to-black/50 h-full flex flex-col justify-end p-12">
            <span className="text-white text-2xl uppercase">
              {dict.home.collectionHighlight.subTitle}
            </span>
            <Heading heading="2" className="text-lime uppercase">
              {homeContent.collectionHighlight.title}
            </Heading>
          </div>
        </div>
      </a>

      {/* LES MEILLEURES VENTES */}
      <section className="container mx-auto py-12">
        <Heading heading="3" className="uppercase text-center">
          {dict.home.bestsellers.title}
        </Heading>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.items.map((product, idx) => (
            <ProductCard
              key={idx}
              product={product}
              lang={lang}
              translations={dict}
            />
          ))}
        </div>
      </section>
      <section>
        <div
          className="bg-cover bg-center hidden lg:block h-[50vh]"
          style={{ backgroundImage: `url(/api/assets/home/swimmers.webp)` }}
        ></div>
        <div className="container mx-auto py-4 min-h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Heading
                heading="3"
                className="uppercase text-center lg:text-left"
              >
                {dict.home.news}
              </Heading>
            </div>
            <div className="relative">
              <div
                className="bg-cover w-full bg-center border-white border-[16px] 
               h-[50vh] md:h-[60vh] lg:h-[90vh] 
               lg:absolute lg:-translate-y-1/2"
                style={{ backgroundImage: `url(${homeContent.news.image})` }}
              ></div>
            </div>

            <div className="flex flex-col justify-start gap-4 px-4 lg:px-0">
              <Heading
                heading="4"
                className="uppercase"
              >
                {homeContent.news.collection.name}
              </Heading>
              <p
                className="text-neutral-500 text-sm sm:text-base"
                dangerouslySetInnerHTML={{
                  __html: homeContent.news.collection.description,
                }}
              ></p>
              <a
                href={`${lang}/collection/${generateSlug(
                  homeContent.news.collection.name,
                  homeContent.news.collection.id
                )}`}>
                <Button>
                  {dict.home.collection.cta} <ArrowRight size={16} />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Events */}
      {events && events.length > 0 && (
        <section className="container mx-auto py-12">        
          <div className="flex flex-col lg:items-center items-start gap-4 px-4 lg:px-0">
            <Heading heading="4" className="uppercase lg:text-center text-left">
            {dict.home.events.title}
          </Heading>
          </div>
          <div className="mx-auto mt-6 overflow-x-auto">
            <div
              className={`flex  sm:flex-row gap-4 px-2 sm:px-0 ${
                events.length <= 3 ? "justify-center" : "justify-start"
              }`}
            >
              {events.map((event, index) => (
                <div key={index} className="flex-shrink-0 w-[250px] lg:w-[400px]">
                  <EventCard event={event} lang={lang} dict={dict} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </>
  );
}
