/*import { AttributValeur } from "@repo/core/models";

const ATTRIBUT_ID_TO_NAME: Record<number, string> = {
  26: "Couleur",
  27: "Taille",
};

export function groupAttributs(attributValeurs: AttributValeur[] = []) {
  return attributValeurs.reduce((acc: Record<string, AttributValeur[]>, val) => {
    const name = ATTRIBUT_ID_TO_NAME[val.attributId ?? 0] || val.attributName;
    if (!name) return acc;
    if (!acc[name]) acc[name] = [];
    if (!acc[name].some((v) => v.id === val.id)) {
      acc[name].push(val);
    }
    return acc;
  }, {});
}*/