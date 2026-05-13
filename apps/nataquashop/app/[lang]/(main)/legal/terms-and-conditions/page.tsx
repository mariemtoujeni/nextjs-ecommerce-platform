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
  const { terms } = dict.legal
  return {
    title: terms.title,
    description: "Conditions générales de vente et informations juridiques de Nataquashop",
  }
}

export default async function TermsAndConditionsPage({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const { terms } = dict.legal

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
            {terms.title}
          </Heading>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Article 1 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["1"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["1"].content)}
            </div>
          </div>

          {/* Article 2 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["2"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["2"].content)}
            </div>
          </div>

          {/* Article 3 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["3"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["3"].content)}
            </div>
          </div>

          {/* Article 4 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["4"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["4"].content)}
            </div>
          </div>

          {/* Article 5 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["5"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["5"].content)}
            </div>
          </div>

          {/* Article 6 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["6"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["6"].content)}
            </div>
          </div>

          {/* Article 7 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["7"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["7"].content)}
            </div>
          </div>

          {/* Article 8 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["8"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["8"].content)}
            </div>
          </div>

          {/* Article 9 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["9"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["9"].content)}
            </div>
          </div>

          {/* Article 10 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["10"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["10"].content)}
            </div>
          </div>

          {/* Article 11 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["11"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["11"].content)}
            </div>
          </div>

          {/* Article 12 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["12"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["12"].content)}
            </div>
          </div>

          {/* Article 13 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["13"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["13"].content)}
            </div>
          </div>

          {/* Article 14 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["14"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["14"].content)}
            </div>
          </div>

          {/* Article 15 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["15"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["15"].content)}
            </div>
          </div>

          {/* Article 16 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["16"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["16"].content)}
            </div>
          </div>

          {/* Article 17 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["17"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["17"].content)}
            </div>
          </div>

          {/* Article 18 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["18"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["18"].content)}
            </div>
          </div>

          {/* Article 19 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["19"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["19"].content)}
            </div>
          </div>

          {/* Article 20 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["20"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["20"].content)}
            </div>
          </div>

          {/* Article 21 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["21"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["21"].content)}
            </div>
          </div>

          {/* Article 22 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["22"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["22"].content)}
            </div>
          </div>

          {/* Article 23 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["23"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["23"].content)}
            </div>
          </div>

          {/* Article 24 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["24"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["24"].content)}
            </div>
          </div>

          {/* Article 25 */}
          <div>
            <div className="bg-lime py-3 px-4 mb-4">
              <Heading heading="5" className="text-black uppercase">
                {terms.articles["25"].title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(terms.articles["25"].content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 