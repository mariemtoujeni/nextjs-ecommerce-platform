"use client";
import { updateDiscountLineAction } from "@repo/actions/discounts";
import { Discount, DiscountLine, DiscountTypeProduct, ReductionValueType } from "@repo/core/models";
import { Check, ChevronsUpDown, Loader2, TicketPercent } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "~/components/ui/command";
import { useToast } from "~/hooks/use-toast";
import { getAllProductAction } from "@repo/actions/products";
import { useDebounce } from "~/hooks/use-debounce";
import { getAllProductModelsAction } from "@repo/actions/product-models";

type SingleLine = {
  serverId: number;
  uiType: ReductionValueType;
  value: string;
  applicable: DiscountTypeProduct;
  specificItems: number[];
};

interface Props {
  discount: Discount;
  options: Record<DiscountTypeProduct, { id: number; label: string }[]>;
}

export const DiscountDetailCard: React.FC<Props> = ({ discount, options }: Props) => {
  const [line, setLine] = useState<SingleLine | null>(null);
  const [openPopover, setOpenPopover] = useState(false);
  const [productOptions, setProductOptions] = useState<{ id: number; label: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [debouncedSearchTerm, setSearchTerm] = useDebounce('', 300);

  useEffect(() => {
    if (!discount.discountLines || discount.discountLines.length <= 0) return;

    const firstDiscountLine = discount.discountLines[0];
    if (!firstDiscountLine) return;    
    const uiType: ReductionValueType =
      firstDiscountLine.type_valeur === ReductionValueType.PERCENTAGE
        ? ReductionValueType.PERCENTAGE
        : ReductionValueType.MONTANT;

    setLine({
      serverId: firstDiscountLine.id,
      uiType,
      value: firstDiscountLine.valeur.toString(),
      applicable: firstDiscountLine.type,
      specificItems: firstDiscountLine.id_type ? [firstDiscountLine.id_type] : [],
    });
  }, [discount]);

  useEffect(() => {
    if (line && debouncedSearchTerm && openPopover) {
      if (line.applicable === DiscountTypeProduct.PRODUIT || 
          line.applicable === DiscountTypeProduct.MODELE) {
        handleProductSearch(debouncedSearchTerm);
      }
    }
  }, [debouncedSearchTerm, line?.applicable, openPopover]);

  const handleProductSearch = async (query: string) => {
    if (!line) return;
    
    setIsSearching(true);
    setProductOptions([]); 

    try {
      let result;
      if (line.applicable === DiscountTypeProduct.PRODUIT) {
        result = await getAllProductAction({ limit: 10, search: query });
        
        const mapped = result.items.map((p) => ({
          id: p.id,
          label: p.descriptions[0]?.title || `Produit ${p.id}`,
        }));
        setProductOptions(mapped);

      } else if (line.applicable === DiscountTypeProduct.MODELE) {
        result = await getAllProductModelsAction({ limit: 10, search: query });
        const mapped = result.items.map((m) => ({
          id: m.id,
          label: `${m.product?.descriptions?.[0]?.title || ''}${m.attributValues?.length ? ' - ' + m.attributValues
            .map(attr => attr.attributValue?.nom)
            .filter(Boolean)
            .join(' / ') : ''}` || `Modèle ${m.id}`,
        }));
        setProductOptions(mapped);

      } else {
        setProductOptions([]);
      }
    } catch (err) {
      console.error("Failed to load items:", err);
      setProductOptions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const updateLine = (patch: Partial<SingleLine>) => {
    if (!line) return;
    setLine({ ...line, ...patch });
  };

  const togglePopover = (isOpen: boolean) => {
    setOpenPopover(isOpen);
    
    if (!isOpen) {
      setSearchTerm('');
      setProductOptions([]);
    }
  };

  const labelMap: Record<DiscountTypeProduct, string> = {
    [DiscountTypeProduct.CONDITION_PROMO]: "",
    [DiscountTypeProduct.EN_PROMO]: "Sélectionner",
    [DiscountTypeProduct.PRODUIT]: "Produit",
    [DiscountTypeProduct.MODELE]: "Modèle",
    [DiscountTypeProduct.MARQUE]: "Marque",
    [DiscountTypeProduct.CATEGORIE]: "Catégorie",
    [DiscountTypeProduct.SOUS_CATEGORIE]: "Sous-catégorie",
    [DiscountTypeProduct.EXPEDITION]: "",
    [DiscountTypeProduct.COLLECTION]: "Collection",
  };

  const excludedApplicables: DiscountTypeProduct[] = [
    DiscountTypeProduct.CONDITION_PROMO,
    DiscountTypeProduct.EXPEDITION,
    DiscountTypeProduct.MODELE,
  ];

  const availableApplicableOptions = Object.keys(labelMap)
    .filter((key) => !excludedApplicables.includes(key as DiscountTypeProduct));

  const changeApplicable = async (newApplicable: DiscountTypeProduct) => {
    if (!line) return;

    const prevApplicable = line.applicable;
    const prevSpecificItems = line.specificItems;
    
    updateLine({ 
      applicable: newApplicable, 
      specificItems: []
    });

    try {
      // Updated payload structure to match new DiscountLine partial
      const payload: Partial<DiscountLine> & { id: number } = {
        id: line.serverId,
        type: newApplicable,
        valeur: Number(line.value) || 0,
        id_type: 0, // Reset to 0 when changing applicable type
        type_valeur: line.uiType,
        // Note: removed country_code and id_reduction as they might not be part of DiscountLine model
        // or might be handled differently in the use case
      };

      const result = await updateDiscountLineAction(payload);
      
      if (result.error) {
        throw new Error(result.error || 'Update failed');
      }

      startTransition(() => router.refresh());
      toast({ title: "Type modifié", description: "Veuillez maintenant sélectionner des éléments" });
    } catch (err) {
      console.error("Failed to change applicable:", err);
      updateLine({ 
        applicable: prevApplicable, 
        specificItems: prevSpecificItems
      });
      toast({ title: "Erreur", description: "Impossible de changer le type applicable" });
    }
  };

  const updateDiscountValue = async (newValue: string, newType: ReductionValueType) => {
    if (!line) return;

    try {
      // Updated payload structure to match new DiscountLine partial
      const payload: Partial<DiscountLine> & { id: number } = {
        id: line.serverId,
        valeur: Number(newValue) || 0,
        type_valeur: newType,
        // Keep existing values for other fields
        type: line.applicable,
        id_type: line.specificItems[0] ?? 0,
      };

      const result = await updateDiscountLineAction(payload);
      
      if (result.error) {
        throw new Error(result.error || 'Update failed');
      }

      startTransition(() => router.refresh());
      toast({ title: "Modifications enregistrées", description: "Les valeurs de réduction ont été mises à jour." });
    } catch (err) {
      console.error("Failed to update discount values:", err);
      toast({ title: "Erreur", description: "Impossible de mettre à jour les valeurs." });
    }
  };

  const handleItemSelection = async (itemId: number) => {
    if (!line) return;

    const isSelected = line.specificItems.includes(itemId);
    const newSelected = isSelected
      ? line.specificItems.filter(id => id !== itemId)
      : [itemId]; // For single selection, replace the array

    updateLine({ specificItems: newSelected });

    try {
      // Updated payload structure to match new DiscountLine partial
      const payload: Partial<DiscountLine> & { id: number } = {
        id: line.serverId,
        id_type: isSelected ? 0 : itemId, // Set to 0 if removing, itemId if selecting
        // Keep existing values for other fields
        type: line.applicable,
        valeur: Number(line.value) || 0,
        type_valeur: line.uiType,
      };

      const result = await updateDiscountLineAction(payload);
      
      if (result.error) {
        throw new Error(result.error || 'Update failed');
      }

      startTransition(() => router.refresh());
      toast({
        title: isSelected ? "Élément supprimé" : "Élément sélectionné",
        description: `L'élément a été ${isSelected ? "retiré" : "sélectionné"}`,
      });
    } catch (err) {
      console.error("Failed to update item selection:", err);
      updateLine({ specificItems: line.specificItems }); // Revert on error
      toast({ title: "Erreur", description: "Impossible de mettre à jour l'élément." });
    }
  };

  if (!line) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketPercent size={20} className="text-blue-600 shrink-0" />
            <span className="text-lg font-bold text-gray-700">Détails de la réduction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucune ligne de réduction trouvée.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TicketPercent size={20} className="text-blue-600 shrink-0" />
          <span className="text-lg font-bold text-gray-700">Détails de la réduction</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-end gap-3">
          <div className="space-y-1 w-[30%]">
            <Label>Applicable sur</Label>
            <Select
              value={line.applicable}
              onValueChange={(val) =>
                startTransition(() => changeApplicable(val as DiscountTypeProduct))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {availableApplicableOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {labelMap[opt as DiscountTypeProduct]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 w-[45%]">
            <Popover
              open={openPopover}
              onOpenChange={togglePopover}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPopover}
                  className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500"
                  disabled={line.applicable === DiscountTypeProduct.EN_PROMO}
                >
                  {line.specificItems.length > 0
                    ? productOptions.find((o) => o.id === line.specificItems[0])?.label ||
                      options[line.applicable]?.find((o) => o.id === line.specificItems[0])?.label ||
                      "1 sélectionné"
                    : "Sélectionner"}

                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0 max-h-[300px] overflow-hidden">
                <Command>
                  <CommandInput 
                    placeholder="Rechercher..." 
                    className="h-9" 
                    onInput={(e) => {
                      const query = (e.target as HTMLInputElement).value;
                      if (line.applicable === DiscountTypeProduct.PRODUIT || 
                          line.applicable === DiscountTypeProduct.MODELE) {
                        setSearchTerm(query);
                      }
                    }}
                  />
                  <CommandEmpty>Aucun élément trouvé</CommandEmpty>
                  {[
                    DiscountTypeProduct.PRODUIT,
                    DiscountTypeProduct.MODELE,
                  ].includes(line.applicable) ? (
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      {isSearching ? (
                        <CommandItem disabled>
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Recherche...
                          </span>
                        </CommandItem>
                      ) : productOptions.length > 0 ? (
                        productOptions.map((item) => {
                          const isSelected = line.specificItems.includes(item.id);
                          return (
                            <CommandItem
                              key={item.id}
                              value={item.label}
                              onSelect={() => handleItemSelection(item.id)}
                              className="flex items-center justify-between"
                            >
                              <span>{item.label}</span>
                              {isSelected && <Check className="h-4 w-4 text-primary" />}
                            </CommandItem>
                          );
                        })
                      ) : (
                        <CommandItem disabled>
                          {line.applicable === DiscountTypeProduct.PRODUIT 
                            ? "Aucun produit trouvé" 
                            : "Aucun modèle trouvé"}
                        </CommandItem>
                      )}
                    </CommandGroup>
                  ) : (
                    // For other types: Marque, Categorie, etc.
                    options[line.applicable]?.length > 0 && (
                      <CommandGroup className="max-h-[200px] overflow-y-auto">
                        {options[line.applicable].map((item) => {
                          const isSelected = line.specificItems.includes(item.id);
                          return (
                            <CommandItem
                              key={item.id}
                              value={item.label}
                              onSelect={() => handleItemSelection(item.id)}
                              className="flex items-center justify-between"
                            >
                              <span>{item.label}</span>
                              {isSelected && <Check className="h-4 w-4 text-primary" />}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1 w-[15%]">
            <Label>Réduction</Label>
            <div className="relative">
              <Input
                value={line.value}
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) {
                    updateLine({ value: e.target.value });
                  }
                }}
                onBlur={() => updateDiscountValue(line.value, line.uiType)}
                placeholder="Ex: 20"
                className="bg-gray-50 pr-10"
              />
            </div>
          </div>

          <div className="space-y-1 w-[10%]">
            <Select
              value={line.uiType}
              onValueChange={(val) => {
                const newType = val as ReductionValueType;
                if (newType !== line.uiType) {
                  updateLine({ uiType: newType });
                  updateDiscountValue(line.value, newType);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReductionValueType.MONTANT}>€</SelectItem>
                <SelectItem value={ReductionValueType.PERCENTAGE}>%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};