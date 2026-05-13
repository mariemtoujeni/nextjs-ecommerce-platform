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
    title: dict.faq.title,
    description: "Questions fréquentes - Nataquashop - Aide et support client",
  }
}

export default async function FAQPage({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const { faq } = dict

  // Fonction pour formater le contenu avec les sauts de ligne et le markdown
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Vérifier si le paragraphe contient du markdown bold
      if (paragraph.includes('**')) {
        // Remplacer le markdown par des spans avec font-bold
        const formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');
        return (
          <p 
            key={index} 
            className="text-black leading-relaxed mb-4 last:mb-0"
            dangerouslySetInnerHTML={{ __html: formattedParagraph }}
          />
        );
      }
      
      return (
        <p key={index} className="text-black leading-relaxed mb-4 last:mb-0">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="w-full">
      {/* Bannière principale avec titre de la page */}
      <div className="w-full bg-black py-8">
        <div className="container mx-auto px-4">
          <Heading heading="4" className="text-center text-white">
            {faq.title}
          </Heading>
        </div>
      </div>
      
      {/* Section MON COMPTE */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal MON COMPTE - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {faq.myAccount.title}
            </Heading>
          </div>
          
          {/* COMMENT CRÉER MON ESPACE CLIENT CLUB? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.myAccount.createAccount.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.myAccount.createAccount.content)}
            </div>
          </div>

          {/* COMMENT M'IDENTIFIER SI J'AI PERDU MON MOT DE PASSE? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.myAccount.forgotPassword.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.myAccount.forgotPassword.content)}
            </div>
          </div>

          {/* PUIS-JE MODIFIER MON ADRESSE DE FACTURATION ET/OU MON ADRESSE DE LIVRAISON? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.myAccount.modifyAddress.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.myAccount.modifyAddress.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section MES COMMANDES */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal MES COMMANDES - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {faq.myOrders.title}
            </Heading>
          </div>
          
          {/* COMMENT PUIS-JE PASSER MA COMMANDE? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.myOrders.howToOrder.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.myOrders.howToOrder.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section EXPÉDITION ET LIVRAISON */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal EXPÉDITION ET LIVRAISON - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {faq.shippingDelivery.title}
            </Heading>
          </div>
          
          {/* QUELLE EST LA DIFFÉRENCE ENTRE UN DÉLAI DE LIVRAISON ET UN DÉLAI D'EXPÉDITION? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.shippingDelivery.deliveryDifference.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.shippingDelivery.deliveryDifference.content)}
            </div>
          </div>

          {/* QUEL EST LE DÉLAI MOYEN DE TRAITEMENT DE MA COMMANDE? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.shippingDelivery.processingTime.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.shippingDelivery.processingTime.content)}
            </div>
          </div>

          {/* QUELS SONT LES FRAIS DE LIVRAISON POUR MA COMMANDE? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.shippingDelivery.shippingCosts.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.shippingDelivery.shippingCosts.content)}
            </div>
          </div>

          {/* MON COLIS A ÉTÉ EXPÉDIÉ MAIS JE NE L'AI TOUJOURS PAS REÇU, QUE FAIRE? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.shippingDelivery.packageNotReceived.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.shippingDelivery.packageNotReceived.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section RETOUR */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal RETOUR - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {faq.return.title}
            </Heading>
          </div>
          
          {/* PUIS-JE RETOURNER DES PRODUITS COMMANDÉS? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.return.canReturn.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.return.canReturn.content)}
            </div>
          </div>

          {/* COMMENT PUIS-JE RETOURNER DES PRODUITS COMMANDÉS? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.return.howToReturn.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.return.howToReturn.content)}
            </div>
          </div>

          {/* OÙ EST-CE QUE JE PEUX TROUVER MON BON DE RETOUR? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.return.findReturnSlip.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.return.findReturnSlip.content)}
            </div>
          </div>

          {/* EN CAS DE RENVOI DE PRODUIT, QUI PREND EN CHARGE LES FRAIS DE RETOUR? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.return.returnCosts.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.return.returnCosts.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section ÉCHANGE */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal ÉCHANGE - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {faq.exchange.title}
            </Heading>
          </div>
          
          {/* COMMENT PROCÉDER À UN ÉCHANGE? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.exchange.howToExchange.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.exchange.howToExchange.content)}
            </div>
          </div>

          {/* QUI PREND EN CHARGE LES FRAIS DE RÉEXPÉDITION LORS D'UN ÉCHANGE? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.exchange.reshippingCosts.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.exchange.reshippingCosts.content)}
            </div>
          </div>

          {/* SOUS QUEL DÉLAI S'EFFECTUE MON ÉCHANGE? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.exchange.exchangeTimeframe.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.exchange.exchangeTimeframe.content)}
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
              {faq.creditRequest.title}
            </Heading>
          </div>
          
          {/* COMMENT PROCÉDER À UNE DEMANDE D'AVOIR? - fond noir, texte lime */}
          <div className="mb-6">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.creditRequest.howToCredit.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.creditRequest.howToCredit.content)}
            </div>
          </div>

          {/* SOUS QUEL DÉLAI SUIS-JE CRÉDITÉ SUR MON COMPTE CLIENT? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.creditRequest.creditTimeframe.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.creditRequest.creditTimeframe.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section PAIEMENT */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal PAIEMENT - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {faq.payment.title}
            </Heading>
          </div>
          
          {/* LES PAIEMENTS SUR NATAQUASHOP.COM SONT-ILS SÉCURISÉS? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.payment.security.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.payment.security.content)}
            </div>
          </div>

          {/* QUELS SONT LES MOYENS DE PAIEMENT PROPOSÉS? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.payment.paymentMethods.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.payment.paymentMethods.content)}
            </div>
          </div>

          {/* Carte bancaire en ligne - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime">
                {faq.payment.onlineCard.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.payment.onlineCard.content)}
            </div>
          </div>

          {/* Virement bancaire - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime">
                {faq.payment.bankTransfer.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.payment.bankTransfer.content)}
            </div>
          </div>

          {/* Chèque bancaire ou postal - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime">
                {faq.payment.check.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.payment.check.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section CHÈQUES CADEAUX */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal CHÈQUES CADEAUX - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {faq.giftVouchers.title}
            </Heading>
          </div>
          
          {/* QUELS SONT LES DIFFÉRENTS MONTANTS POUR LES CHÈQUES CADEAUX? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.giftVouchers.amounts.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.giftVouchers.amounts.content)}
            </div>
          </div>

          {/* QUELLE EST LA DATE DE VALIDITÉ POUR LES CHÈQUES CADEAUX? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.giftVouchers.validity.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.giftVouchers.validity.content)}
            </div>
          </div>

          {/* OÙ PUIS-JE PROFITER DE MON CHÈQUE CADEAU? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.giftVouchers.whereToUse.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.giftVouchers.whereToUse.content)}
            </div>
          </div>

          {/* QUELS SONT LES FRAIS DE LIVRAISON POUR MON CHÈQUE CADEAU? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.giftVouchers.shippingCosts.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.giftVouchers.shippingCosts.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section CARTE DE FIDÉLITÉ */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal CARTE DE FIDÉLITÉ - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {faq.loyaltyCard.title}
            </Heading>
          </div>
          
          {/* QUELS SONT LES CONDITIONS POUR BÉNÉFICIER DE POINTS DE FIDÉLITÉ? - fond noir, texte lime */}
          <div className="mb-8">
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.loyaltyCard.conditions.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.loyaltyCard.conditions.content)}
            </div>
          </div>

          {/* COMMENT UTILISER MES POINTS DE FIDÉLITÉS? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.loyaltyCard.howToUse.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.loyaltyCard.howToUse.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Section SERVICE RELATION CLIENTÈLE */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Titre principal SERVICE RELATION CLIENTÈLE - fond lime, texte noir */}
          <div className="bg-lime py-3 px-4 mb-6">
            <Heading heading="5" className="text-black uppercase">
              {faq.customerService.title}
            </Heading>
          </div>
          
          {/* J'AI BESOIN D'UN CONSEIL, PAR QUELS MOYENS PUIS-JE VOUS CONTACTER? - fond noir, texte lime */}
          <div>
            <div className="bg-black py-3 px-4 mb-4">
              <Heading heading="6" className="text-lime uppercase">
                {faq.customerService.contact.title}
              </Heading>
            </div>
            <div className="text-black">
              {formatContent(faq.customerService.contact.content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 