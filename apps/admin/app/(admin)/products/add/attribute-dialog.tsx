'use client';
import { Plus } from "lucide-react";
import {
  Button, Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, Select, SelectTrigger,
  SelectContent, SelectItem, SelectValue, Checkbox, Input,
} from "~/components/ui";
import { AttributWithValues, ProductAttribute } from "@repo/core/models";
import { ScrollArea } from "~/components/ui/scrollarea";
import { useState } from "react";

interface AttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributes: AttributWithValues[];
  productAttributes: ProductAttribute[];
  selectedAttrId: number | null;
  setSelectedAttrId: (id: number | null) => void;
  selectedValues: number[];
  setSelectedValues: (values: number[]) => void;
  editingAttrProductId: number | null;
  setEditingAttrProductId: (id: number | null) => void;
  handleConfirmAddOrEdit: (attributeValues: any[]) => void;
}

export function AttributeDialog({
  open,
  onOpenChange,
  attributes,
  productAttributes,
  selectedAttrId,
  setSelectedAttrId,
  selectedValues,
  setSelectedValues,
  editingAttrProductId,
  setEditingAttrProductId,
  handleConfirmAddOrEdit
}: AttributeDialogProps) {

  const [searchQuery, setSearchQuery] = useState("");

  const getAvailableForDropdown = () => {
    const addedIds = productAttributes
      .map((a) => {
        const template = attributes.find((av) => av.nom === a.name);
        return template?.id;
      })
      .filter(Boolean) as number[];
    return attributes.filter(
      (a) => !addedIds.includes(a.id) || a.id === selectedAttrId
    );
  };

  const selectedAttribute = selectedAttrId
    ? attributes.find(attr => attr.id === selectedAttrId)
    : null;

  // Filter values based on search
  const filteredValues = selectedAttribute?.attribut_valeurs
    .filter(v => v.nom.toLowerCase().includes(searchQuery.toLowerCase())) ?? [];

  const handleConfirm = () => {
    if (selectedAttribute?.attribut_valeurs) {
      handleConfirmAddOrEdit(selectedAttribute.attribut_valeurs.filter(v => selectedValues.includes(v.id)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div
          className="flex items-center gap-2 mt-2 text-blue-600 cursor-pointer"
          onClick={() => {
            setEditingAttrProductId(null);
            setSelectedAttrId(null);
            setSelectedValues([]);
            setSearchQuery("");
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un attribut</span>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-xl w-full h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {editingAttrProductId ? "Modifier l'attribut" : "Sélectionner un attribut"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <div className="flex-shrink-0 space-y-2">
            {/* Attribute dropdown */}
            <Select
              value={selectedAttrId?.toString() ?? ""}
              onValueChange={(val) => {
                const id = val ? Number(val) : null;
                setSelectedAttrId(id);
                setSelectedValues([]);
                setSearchQuery("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un attribut" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {getAvailableForDropdown().map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search input */}
            {selectedAttrId && (
              <Input
                placeholder="Rechercher une valeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            )}
          </div>

          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full w-full rounded-md border">
              <div className="p-4">
                {filteredValues.length > 0 ? (
                  filteredValues
                    .sort((a, b) => a.nom.localeCompare(b.nom))
                    .map((v) => (
                      <div key={v.id} className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={selectedValues.includes(v.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedValues([...selectedValues, v.id]);
                            else setSelectedValues(selectedValues.filter((id) => id !== v.id));
                          }}
                        />
                        <span>{v.nom}</span>
                      </div>
                    ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {selectedAttrId ? "Aucune valeur correspondante" : "Choisissez un attribut pour voir les valeurs"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 justify-end">
          <Button
            onClick={handleConfirm}
            disabled={!selectedAttrId || selectedValues.length === 0}
          >
            {editingAttrProductId ? "Mettre à jour" : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
