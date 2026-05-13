"use client";
import { Discount, ReductionType, DiscountState, DiscountCombination } from "@repo/core/models";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Heading } from "~/components/ui";
import { DiscountStatus } from "../table";

interface Props {
  discount: Discount;
}

const typeLabels: Record<ReductionType, string> = {
  CLUB: "Club",
  AVOIR: "Avoir",
  CHEQUE_CADEAU: "Chèque Cadeau",
  EXPEDITION: "Expédition",
  COMMANDE: "Commande",
  X_POUR_Y: "X pour Y",
  CAMPAGNE: "Campagne",
  CODE_PROMO: "Code Promo",
  ADHERENT_CLUB: "Adhérent Club",
  NONE: "Aucune réduction"
};

function DiscountStatusText({ discount }: { discount: Discount }) {
  const now = new Date();
  const start = new Date(discount.date_debut);
  const end = discount.date_fin ? new Date(discount.date_fin) : null;

  const isActive = now >= start && (!end || now <= end);

  return isActive ? "actif" : "inactif";
}


const combinaisonLabels: Record<DiscountCombination, string> = {
  PRODUIT: "Cumulable au niveau produit",
  COMMANDE: "Cumulable au niveau commande",
  EXPEDITION: "Cumulable au niveau expédition",
};

export const SummaryCard: React.FC<Props> = ({ discount }: Props) => {
  return (
    <Card className="flex-[1] self-start">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={20} className="text-blue-600 shrink-0" />
          <span className="text-lg font-bold text-gray-700">Résumé</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <section>
          <Heading heading="4" className="mb-2 text-gray-700 font-semibold">
            Code de réduction
          </Heading>
          <p className="text-gray-600">
            {discount.code ? discount.code : "Aucun code de réduction pour l'instant"}
          </p>
        </section>

        <section>
          <Heading heading="4" className="mb-2 text-gray-700 font-semibold">
            Type et méthode
          </Heading>
          <p className="text-gray-600">
            {typeLabels[discount.type] ?? "Type inconnu"}{" "}
            {discount.code ? "par code" : "automatique"}
          </p>
        </section>

        <section>
          <Heading heading="4" className="mb-2 text-gray-700 font-semibold">
            Détails
          </Heading>
          <p className="text-gray-600">
            {discount.combinaison != null ? combinaisonLabels[discount.combinaison] : "Non cumulable avec d’autres réductions"}
          </p>
        </section>

        <section>
          <Heading heading="4" className="mb-2 text-gray-700 font-semibold">
            État
          </Heading>
          <p className="text-gray-600">
            {"La réduction est "}<DiscountStatusText discount={discount}/>
          </p>
        </section>
      </CardContent>
    </Card>
  );
};
