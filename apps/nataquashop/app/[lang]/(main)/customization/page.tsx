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
    title: dict.customization.title,
    description: "Services de personnalisation de textiles et équipements sportifs par Nataquashop",
  }
}

export default async function CustomizationPage({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const { customization } = dict

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
            {customization.title}
          </Heading>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Introduction */}
          <div className="text-black">
            {formatContent(customization.intro)}
          </div>

          {/* Services avec icônes */}
          <div className="flex justify-center">
            <Image
              src="/images/legal/customization-1.webp"
              alt="Services de personnalisation"
              width={800}
              height={600}
              className="w-full max-w-4xl h-auto"
              priority
            />
          </div>

          {/* Processus de personnalisation */}
          <div>
            <div className="text-black">
              {formatContent(customization.process.content)}
            </div>
          </div>

          {/* Délais de fabrication */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {customization.deadlines.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(customization.deadlines.content)}
            </div>
          </div>

          {/* Entretien des textiles */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {customization.care.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(customization.care.content)}
            </div>
          </div>

          {/* Comment personnaliser */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {customization.howTo.title}
              </Heading>
            </div>

            {/* Particulier */}
            <div className="mb-6 col-span-2">
              <div className="bg-black py-3 px-4 mb-4">
                <Heading heading="6" className="text-lime uppercase">
                  {customization.howTo.individual.title}
                </Heading>
              </div>
              <div className="text-black">
                {formatContent(customization.howTo.individual.content)}
              </div>
              
              {/* Image de l'interface de commande */}
              <div className="flex justify-center mt-6">
                <Image
                  src="/images/legal/customization-2.webp"
                  alt="Interface de commande personnalisation"
                  width={800}
                  height={600}
                  className="w-full max-w-4xl h-auto"
                  priority
                />
              </div>
            </div>

            {/* Club/Entreprise */}
            <div className="mb-6 col-span-1">
              <div className="bg-lime py-3 px-4 mb-4">
                <Heading heading="6" className="text-black uppercase">
                  {customization.howTo.business.title}
                </Heading>
              </div>
              <div className="text-black">
                {formatContent(customization.howTo.business.content)}
              </div>
            </div>

            {/* Bonnets personnalisés */}
            <div className="mb-6 col-span-1">
              <div className="bg-lime py-3 px-4 mb-4">
                <Heading heading="6" className="text-black uppercase">
                  {customization.howTo.caps.title}
                </Heading>
              </div>
              <div className="text-black">
                {formatContent(customization.howTo.caps.content)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 