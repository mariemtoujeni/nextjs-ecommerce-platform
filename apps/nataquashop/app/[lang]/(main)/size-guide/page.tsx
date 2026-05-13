import type { Metadata } from "next";
import { getDictionary } from "../../../dictionaries";
import { LangParams } from "../../../utils";
import { Heading } from "~/components/ui/heading";
import Image from "next/image";

type Props = {
  params: Promise<LangParams>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return {
    title: dict.sizeGuide.title,
    description: "Guide des tailles et conseils pour choisir la bonne taille de maillot de bain",
  }
}

export default async function SizeGuidePage({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const { sizeGuide } = dict

  // Fonction pour formater le contenu avec les sauts de ligne
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="text-black leading-relaxed mb-4 last:mb-0">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="w-full">
      {/* Bannière principale avec titre */}
      <div className="w-full bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <Heading heading="4" className="text-center text-white">
            {sizeGuide.title}
          </Heading>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
        <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {sizeGuide.subtitle}
              </Heading>
            </div>
          {/* Texte explicatif */}
          <div className="text-black">
            {formatContent(sizeGuide.content)}
          </div>

          {/* Image du guide des tailles */}
          <div className="flex justify-center">
            <Image
              src="/images/legal/size-guide-1.webp"
              alt="Guide des tailles"
              width={800}
              height={600}
              className="w-full max-w-4xl h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
} 