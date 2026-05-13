"use client";

import { useEffect, useState } from "react";
import { Opinion } from "@repo/core/models";

import HeaderComponent from "./HeaderComponent";
import GeneralComponent from "./GeneralComponent";
import ProductComponent from "./ProductComponent";
import ClientComponent from "./ClientComponent";

import { updateOpinion } from "@repo/actions/opinions";

export interface ReviewDetailPageProps {
  opinion: Opinion;
}

export default function ReviewDetailPage({ opinion }: ReviewDetailPageProps) {
  const [currentOpinion, setOpinion] = useState<Opinion>(opinion);

  const handleSave = async () => {
    try {
      const updated = await updateOpinion({
        ...currentOpinion,
        validated: true,
      });
      setOpinion(updated);      
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
    }
  };

  return (
    <div className="container">
      <HeaderComponent opinion={currentOpinion} onSave={handleSave} />

      <div className="flex gap-5">
        <div className=" w-2/3 space-y-4">
          <GeneralComponent opinion={currentOpinion} onChange={setOpinion} />
        </div>

        <div className="space-y-4 w-1/3 mt-5">
          <ProductComponent opinion={opinion} />
          <ClientComponent opinion={opinion} />
        </div>
      </div>
    </div>
  );
}
