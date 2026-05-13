import type { Metadata } from "next";
import { getDictionary } from "../../../../dictionaries";
import { LangParams } from "../../../../utils";
import { Heading } from "~/components/ui/heading";

type Props = {
  params: Promise<LangParams>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return {
    title: dict.legal.notices.title,
    description: "Mentions légales et informations juridiques de Nataquashop",
  }
}

export default async function LegalNoticesPage({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const { notices } = dict.legal

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
            {notices.title}
          </Heading>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* ÉDITEUR */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {notices.sections.publisher.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(notices.sections.publisher.content)}
            </div>
          </div>

          {/* CONCEPTION */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {notices.sections.conception.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(notices.sections.conception.content)}
            </div>
          </div>

          {/* HÉBERGEMENT */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {notices.sections.hosting.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(notices.sections.hosting.content)}
            </div>
          </div>

          {/* DONNÉES PERSONNELLES */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {notices.sections.personalData.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(notices.sections.personalData.content)}
            </div>
          </div>

          {/* CONTENU DU SITE */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {notices.sections.siteContent.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(notices.sections.siteContent.content)}
            </div>
          </div>

          {/* PROPRIÉTÉ INTELLECTUELLE */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {notices.sections.intellectualProperty.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(notices.sections.intellectualProperty.content)}
            </div>
          </div>

          {/* LIENS HYPERTEXTE */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {notices.sections.hyperlinks.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(notices.sections.hyperlinks.content)}
            </div>
          </div>

          {/* RESPONSABILITÉS */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {notices.sections.liability.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(notices.sections.liability.content)}
            </div>
          </div>

          {/* PROTECTION DES DONNÉES PERSONNELLES */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {notices.sections.dataProtection.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(notices.sections.dataProtection.content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 