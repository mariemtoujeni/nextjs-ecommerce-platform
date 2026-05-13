import {  ModelWithAttributs, Product } from "@repo/core/models";

export function getSelectedModelId(
  selectedSizeId: number | null,
  selectedColorId: number | null,
  modeles: ModelWithAttributs[] 
): number | null {
  if (!modeles) return null;
  const matched = modeles.find((modele) => {
    const attrIds = modele.attributeValues.map((a) => a.id);
    return (
      (!selectedColorId || attrIds.includes(selectedColorId)) &&
      (!selectedSizeId || attrIds.includes(selectedSizeId))
    );
  });
  return matched?.id ?? null;
}
