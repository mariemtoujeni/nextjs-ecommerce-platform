'use client';
import { useState } from "react";
import {  GripVertical, Pencil, Save } from "lucide-react";
import { Label, Badge, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableHead, TableRow, Heading, } from "~/components/ui";
import { useToast } from "~/hooks/use-toast";
import { RecursiveAttributes } from "../edit/[id]/recursive-attributes";
import { AttributWithValues, ModelWithProduct, Product, ProductAttribute } from "@repo/core/models";
import { cartesianProduct } from "~/lib/utils";
import { AttributeDialog } from "./attribute-dialog";


export interface ModelCardProps {
  allAttributes: AttributWithValues[], 
  productAttributes: ProductAttribute[],
  onChange?: (savedAttributes: ProductAttribute[]) => void
}
export default function ModelCard({ allAttributes: initialattributes, productAttributes: initialProductAttributes , onChange }: ModelCardProps) {
  const { toast } = useToast();

  const [attributes, setAttributes] = useState<AttributWithValues[]>(initialattributes); 
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>(initialProductAttributes);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAttrId, setSelectedAttrId] = useState<number | null>(null);
  const [selectedValues, setSelectedValues] = useState<number[]>([]);
  const [editingAttrProductId, setEditingAttrProductId] = useState<number | null>(null);

  const [inlineEditAttrIds, setInlineEditAttrIds] = useState<Set<number>>(new Set());


  //drag & drop
  const handleDrop = (id: number) => {
    if (draggedId === null || draggedId === id) return;

    const draggedIndex = productAttributes.findIndex((attr) => attr.id === draggedId);
    const targetIndex = productAttributes.findIndex((attr) => attr.id === id);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...productAttributes];
    const removed = reordered.splice(draggedIndex, 1)[0];
    if (!removed) return;

    reordered.splice(targetIndex, 0, removed);
    setProductAttributes(reordered);
    setDraggedId(null);
    setDragOverId(null);
  };

  const openEditDialog = (attr: ProductAttribute) => {
    //find the attribute template by matching names
    const attrTemplate = attributes.find((a) => a.nom === attr.name);
    if (!attrTemplate) return;
    setEditingAttrProductId(attr.id);
    setSelectedAttrId(attrTemplate.id);
    //pre-select the current values for editing
    const preSelectedValues = attr.values.map((v) => v.id);
    setSelectedValues(preSelectedValues);
    setDialogOpen(true);
  };

  const handleConfirmAddOrEdit = (attributeValues: any[]) => {
    if (!selectedAttrId || !attributeValues) return;
    
    const attrTemplate = attributes.find((a) => a.id === selectedAttrId);
    if (!attrTemplate) return;

    const values = attributeValues
      .filter((v) => selectedValues.includes(v.id))
      .map((v) => ({ 
        id: v.id, 
        name: v.nom,
        attribute: { name: attrTemplate.nom }
      }));
      
    if (values.length === 0) {
      toast({ title: "Aucune valeur sélectionnée", description: "Veuillez choisir au moins une valeur." });
      return;
    }

    if (editingAttrProductId) {
      setProductAttributes(
        productAttributes.map((a) =>
          a.id === editingAttrProductId ? { ...a, name: attrTemplate.nom, values } : a
        )
      );
      setInlineEditAttrIds((prev) => new Set(prev).add(editingAttrProductId));
    } else {
      const newAttr: ProductAttribute = { id: attrTemplate.id, name: attrTemplate.nom, values };
      setProductAttributes((prev) => [...prev, newAttr]);
      setInlineEditAttrIds((prev) => new Set(prev).add(newAttr.id));
    }

    setEditingAttrProductId(null);
    setSelectedAttrId(null);
    setSelectedValues([]);
    setDialogOpen(false);
  };

  const generateModels = (attributes: ProductAttribute[]): ModelWithProduct[] => {
    const validAttrs = attributes.filter((a) => a.values.length > 0);
    if (validAttrs.length === 0) return [];

    const attrValues = validAttrs.map((a) => a.values);
    const combinations = cartesianProduct(attrValues);
    const unique = new Map<string, ModelWithProduct>();

    for (const combo of combinations) {
      const key = combo.map((v) => v.id).join("-");
      if (!unique.has(key)) {
        unique.set(key, {
          id: key,
          priceWithoutVat: 0,
          purchasePrice: 0,
          minStock: 0,
          barcode: "",
          supplierReference: "",
          manufacturerReference: "",
          product: {} as Product,
          stock: undefined,
          attributValues: combo.map((v) => {
            const parentAttr = validAttrs.find((a) => a.values.some((val) => val.id === v.id));
            return { idAttributValue: v.id, attributValue: { id_attribut: parentAttr?.id ?? 0, nom: v.name } };
          }),
        } as unknown as ModelWithProduct);
      }
    }

    return Array.from(unique.values());
  };
  const [modeles, setModeles] = useState<ModelWithProduct[]>( generateModels(initialProductAttributes) );

  return (
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle><Heading heading="3" className="text-gray-700 font-bold">Modèles</Heading></CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Label>Options de modèles</Label>

          {/* Product Attributes */}
          {productAttributes.map((attr) => (
            <div
              key={attr.id}
              className={`mb-3 border rounded-lg p-3 bg-white shadow-sm ${
                dragOverId === attr.id ? "ring-2 ring-blue-400" : ""
              }`}
              draggable
              onDragStart={() => setDraggedId(attr.id)}
              onDragEnter={() => setDragOverId(attr.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(attr.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                <span className="font-medium flex-1">{attr.name}</span>
                <Save
                  className="w-5 h-5 cursor-pointer text-green-600"
                  onClick={() => {
                    if (inlineEditAttrIds.has(attr.id)) {
                      const copy = new Set(inlineEditAttrIds);
                      copy.delete(attr.id);
                      setInlineEditAttrIds(copy);

                      const filteredAttrs = productAttributes.filter((a) => !copy.has(a.id) && a.values.length > 0);
                      setModeles(generateModels(filteredAttrs));

                      //update parent
                      if (onChange) {
                        onChange(productAttributes.filter((a) => !copy.has(a.id)));
                      }

                      toast({ title: "Attribut enregistré et modèles mis à jour" });
                    }
                  }}
                />

                <Pencil className="w-5 h-5 cursor-pointer text-gray-600" onClick={() => openEditDialog(attr)} />
              </div>

              <div className="flex flex-wrap gap-2">
                {attr.values.map((v) => (
                  <div key={v.id} className="relative">
                    <Badge variant="blue">{v.name}</Badge>
                    {inlineEditAttrIds.has(attr.id) && (
                      <span
                        className="absolute -top-2 -right-2 text-red-600 font-bold cursor-pointer"
                        onClick={() => {
                          setProductAttributes((prev) => {
                            const updatedAttrs = prev
                              .map((a) =>
                                a.id === attr.id ? { ...a, values: a.values.filter((val) => val.id !== v.id) } : a
                              )
                              .filter((a) => a.values.length > 0); //remove attribute if no values left
                            setModeles(generateModels(updatedAttrs));
                            if (onChange) onChange(updatedAttrs);
                            setInlineEditAttrIds((prevInline) => {
                              const copy = new Set(prevInline);
                              if (!updatedAttrs.some((a) => a.id === attr.id)) copy.delete(attr.id);
                              return copy;
                            });

                            return updatedAttrs;
                          });
                        }}
                      >
                        ×
                      </span>
                    )}
                  </div>
                ))}

              </div>
            </div>
          ))}

          {/* Attribute Dialog */}
          <AttributeDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            attributes={attributes}
            productAttributes={productAttributes}
            selectedAttrId={selectedAttrId}
            setSelectedAttrId={setSelectedAttrId}
            selectedValues={selectedValues}
            setSelectedValues={setSelectedValues}
            editingAttrProductId={editingAttrProductId}
            setEditingAttrProductId={setEditingAttrProductId}
            handleConfirmAddOrEdit={handleConfirmAddOrEdit}
          />

          {/* Models Table */}
          <div>
            <Label>Liste des modèles</Label>
            <div className="border rounded-md divide-y">
              <Table>
                <TableHeader className="bg-neutral-100">
                  <TableRow>
                    <TableHead className="w-2/12">Modèle</TableHead>
                    <TableHead className="w-1/12">Prix HT</TableHead>
                    <TableHead className="w-1/12">PMA (HT)</TableHead>
                    <TableHead className="w-1/12">Stock min.</TableHead>
                    <TableHead className="w-2/12">Ref. Fournisseur</TableHead>
                    <TableHead className="w-2/12">Ref. Fabricant</TableHead>
                    <TableHead className="w-2/12">Code barre</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>

              <div className="flex items-center">
                {modeles.length > 0 ? (
                  <RecursiveAttributes
                    attributes={productAttributes.filter((a) => a.values.length > 0 && !inlineEditAttrIds.has(a.id))}
                    currentIndex={0}
                    modeles={modeles}
                  />
                ) : (
                  <div className="text-center text-gray-500 w-full">
                    <p>Aucun modèle trouvé</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}