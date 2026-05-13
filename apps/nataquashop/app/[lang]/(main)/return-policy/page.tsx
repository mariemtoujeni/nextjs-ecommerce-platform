import type { Metadata } from "next";
import { getDictionary } from "../../../dictionaries";
import { LangParams } from "../../../utils";
import { Heading } from "~/components/ui/heading";

type Props = {
  params: Promise<LangParams>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return {
    title: dict.returnPolicy.title,
    description: "Politique de retours et échanges de Nataquashop - Conditions et procédures",
  }
}

export default async function ReturnPolicyPage({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const { returnPolicy } = dict

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
      {/* Bannière principale avec titre de la page */}
      <div className="w-full bg-black py-8">
        <div className="container mx-auto px-4">
          <Heading heading="4" className="text-center text-white">
            {returnPolicy.title}
          </Heading>
        </div>
      </div>
      
      {/* Section SATISFAIT OU REMBOURSÉ */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {returnPolicy.satisfiedSection.title}
            </Heading>
          </div>
          <div className="text-black">
            {formatContent(returnPolicy.satisfiedSection.content)}
          </div>
        </div>
      </div>

      {/* Section RETOURS */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal RETOURS - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {returnPolicy.returns.title}
            </Heading>
          </div>
          
          {/* PUIS-JE RETOURNER DES PRODUITS COMMANDÉS ? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.returns.canReturn.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.returns.canReturn.content)}
            </div>
          </div>

          {/* COMMENT PUIS-JE RETOURNER DES PRODUITS COMMANDÉS ? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.returns.howToReturn.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.returns.howToReturn.content)}
            </div>
          </div>

          {/* OÙ JE PEUX RETROUVER MON BON DE RETOUR ? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.returns.whereToFind.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.returns.whereToFind.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section ÉCHANGES */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal ÉCHANGES - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {returnPolicy.exchanges.title}
            </Heading>
          </div>
          
          {/* COMMENT PROCÉDER À UN ÉCHANGE ? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.exchanges.howToExchange.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.exchanges.howToExchange.content)}
            </div>
          </div>

          {/* QUI PREND EN CHARGE LES FRAIS DE RÉEXPÉDITION LORS D'UN ÉCHANGE ? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.exchanges.shippingCosts.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.exchanges.shippingCosts.content)}
            </div>
          </div>

          {/* SOUS QUEL DÉLAI S'EFFECTUE MON ÉCHANGE ? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.exchanges.timeframe.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.exchanges.timeframe.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section DEMANDE D'AVOIR SUR SON COMPTE CLIENT */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {returnPolicy.creditRequest.title}
            </Heading>
          </div>
          
          {/* COMMENT PROCÉDER À UNE DEMANDE D'AVOIR ?  */}
          <div className="mb-6">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.creditRequest.howToCredit.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.creditRequest.howToCredit.content)}
            </div>
          </div>

          {/* ATTENTION - Boîte d'avertissement */}
          <div className="bg-lime-200 border-l-4 border-lime-500 p-4 mb-6">
            <p className="text-black font-semibold">
              {returnPolicy.creditRequest.warning}
            </p>
          </div>

          {/* SOUS QUEL DÉLAI SUIS-JE CRÉDITÉ SUR MON COMPTE CLIENT ? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.creditRequest.timeframe.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.creditRequest.timeframe.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section DEMANDE DE REMBOURSEMENT */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {returnPolicy.refundRequest.title}
            </Heading>
          </div>
          
          {/* COMMENT PROCÉDER À UNE DEMANDE DE REMBOURSEMENT ? - fond noir, texte lime */}
          <div className="mb-6">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.refundRequest.howToRefund.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.refundRequest.howToRefund.content)}
            </div>
          </div>

          {/* ATTENTION - Boîte d'avertissement */}
          <div className="bg-lime-200 border-l-4 border-lime-500 p-4 mb-6">
            <p className="text-black font-semibold">
              {returnPolicy.refundRequest.warning}
            </p>
          </div>

          {/* SOUS QUEL DÉLAI SUIS-JE REMBOURSÉ ? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.refundRequest.timeframe.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.refundRequest.timeframe.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section RETOUR PRODUIT DÉFECTUEUX, ERREUR DE PRODUIT OU PRODUIT MANQUANT */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {returnPolicy.defectiveProduct.title}
            </Heading>
          </div>
          
          {/* MON PRODUIT EST DÉFECTUEUX - fond noir, texte lime */}
          <div className="mb-6">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.defectiveProduct.defective.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.defectiveProduct.defective.content)}
            </div>
          </div>

          {/* JE N'AI PAS REÇU LE PRODUIT QUE J'AI COMMANDÉ - fond noir, texte lime */}
          <div className="mb-6">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.defectiveProduct.wrongProduct.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.defectiveProduct.wrongProduct.content)}
            </div>
          </div>

          {/* IL MANQUE UN PRODUIT DANS MA COMMANDE - fond noir, texte lime */}
          <div className="mb-6">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {returnPolicy.defectiveProduct.missingProduct.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(returnPolicy.defectiveProduct.missingProduct.content)}
            </div>
          </div>


        </div>
      </div>
    </div>
  )
} 