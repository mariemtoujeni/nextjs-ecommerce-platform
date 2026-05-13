"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Quotation } from "@repo/core/models";

interface QuotationPreviewProps {
  quotation: Quotation;
}

export default function QuotationPreview({quotation} :QuotationPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    const el = ref.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("devis.pdf");
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleDownload}
          className="bg-black text-white px-4 py-2 rounded mb-6"
        >
          Télécharger
        </button>
      </div>
      <div
        ref={ref}
        className="bg-white max-w-4xl mx-auto p-10 text-[12px] text-black"
      >


        <div className="mb-6">
          <h1 className="font-bold text-2xl">Devis</h1>
        </div>

        {/* Meta Info */}
        <div className="mb-4 space-y-3">
          <p>
            <strong>Numéro de devis:</strong>{" "}
            <span className="text-gray-600">{quotation.id}</span>
          </p>
          <p>
            <strong>Date d’émission:{" "}</strong>
            <span>{new Date(quotation.createdAt).toLocaleDateString("fr-FR")}</span>
          </p>
          <p>
            <strong>Date expiration:{" "}</strong>
            <span>{new Date(new Date(quotation.createdAt).setDate(new Date(quotation.createdAt).getDate() + 1)
              ).toLocaleDateString("fr-FR")}</span>
          </p>
        </div>

        <div className="flex justify-between gap-4">
          <div className="w-3/5">
            <h2 className="font-bold text-lg">MLCN SPORTS (NATAQUASHOP)</h2>
            <p className="text-sm text-gray-600">
              ROUTE D'AUBUSSON
              <br />
              23140 JARNAGES
              <br />
              email 
              <br />
              SIREN: 512934381
              <br />
              RCS : 512 934 381 R.C.S. Gueret
              <br />
              Capital social : 120 000,00 €
            </p>
          </div>
          <div className="w-2/5 pr-4">
            <p className="font-bold text-lg">Client: Jean Dupont</p>
            <p className="text-gray-600">
              Adresse complète
              <br />
              Code postal Ville
              <br />
              {quotation.club?.email ?? ""}
            </p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border mt-6">
          <thead>
            <tr className="bg-black text-left">
              <th className="text-white w-1/3 p-2">Description</th>
              <th className="text-white w-1/6 p-2">Qté</th>
              <th className="text-white w-1/6 p-2">Prix unitaire</th>
              <th className="text-white w-1/6 p-2">TVA (%)</th>
              <th className="text-white w-1/6 p-2 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className=" p-2">Produit 1</td>
              <td className=" p-2">2</td>
              <td className=" p-2">50 €</td>
              <td className=" p-2">20%</td>
              <td className="text-right p-2">100 €</td>
            </tr>
            {/* Add more rows dynamically */}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-6 text-sm">
          <div className="ml-auto w-1/3 space-y-3">
            <div className="flex justify-between">
              <span>Total HT</span>
              <span className="text-gray-600"></span>
            </div>
            <div className="flex justify-between">
              <span>Montant de la TVA</span>
              <span className="text-gray-600">20 €</span>
            </div>
            <div className="flex justify-between">
              <span>Réduction</span>
              <span className="text-gray-600">0 €</span>
            </div>
            <div className="flex justify-between">
              <span>Frais de livraison</span>
              <span className="text-gray-600">{quotation.shippingFees} €</span>
            </div>
            <div className="flex justify-between bg-neutral-50">
              <span>Total TTC</span>
              <span className="text-gray-600 ">120 €</span>
            </div>
          </div>
        </div>


        {/* Footer note */}
        <p className="text-[10px] text-center mt-10 text-gray-600">
          Remarque : Vous disposez d'un droit de rétractation de 7 jours après la réception de votre commande.
          En cas de retard de paiement, Nataquashop se réserve le droit d'appliquer une pénalité égale à 3 fois le taux d'intérêt légal selon
          le décret 2009-138 du 9 février 2009. Pour les professionnels, une indemnité minimum forfaitaire de 40 euros pour les frais de
          recouvrement sera exigible (Décret 2012-1115 du 9 octobre 2012). Escompte pour paiement anticipé : néant
        </p>
      </div>
    </div>
  );
}
