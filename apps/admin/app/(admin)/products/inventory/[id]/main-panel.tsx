"use client";
import { createInventoryLineAction, deleteInventoryLineAction, getInventoryLinesAction, updateInventoryAction, updateInventoryLineAction } from "@repo/actions/inventory";
import { Inventory, InventoryFilterInput, InventoryLine, InventoryStatus, ModelWithProduct } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { Trash2, Pen, ArrowLeft, RefreshCw, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { ModelCell } from "~/components/ModelCell";
import { ProductSearchBar } from "~/components/ProductSearchBar";
import { TableFilter } from "~/components/TableFilter";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Heading, Badge } from "~/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { toast } from "~/hooks/use-toast";

export interface MainPanelComponentProps {
  products: ReturnAll<ModelWithProduct>;
  inventory: Inventory;
  defaultPage: number;
}

const LIMIT = 100;

export const MainPanelComponent: React.FunctionComponent<MainPanelComponentProps> = ({ products: initialProducts, inventory, defaultPage }: MainPanelComponentProps) => {
  const [inventorieLines, fetchInventorieLines] = useActionState(
    (state: ReturnAll<InventoryLine>, payload: InventoryFilterInput) => 
      getInventoryLinesAction(inventory.id, payload),
    { total: 0, items: [], count: 0 }
  );

  const [page, setPage] = useState(defaultPage);
  const [search, setSearch] = useState('');
  const [lines, setLines] = useState<InventoryLine[]>([]);
  const [editingLineId, setEditingLineId] = useState<number | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<Record<number, number>>({});
  const pendingDeletionRef = useRef<Record<string, NodeJS.Timeout>>({});
  const router = useRouter();

  useEffect(() => {
    startTransition(() => {
      fetchInventorieLines({ limit: LIMIT, offset: (page - 1), search });
    });
  }, [page, search, lines]);

  const handleModelSelected = async (model: ModelWithProduct) => {
    const existingLine = lines.find(line => line.modelId === model.id);
    if (existingLine) {
      await handleQuantityChange(existingLine, existingLine.quantity + 1);
      return;
    }
    try {
      const newLine: InventoryLine = {
        inventoryId: inventory.id,
        modelId: model.id,
        quantity: 1,
        purchasePriceHT: model.priceWithoutVat,
      };
      setLines((prev) => [...prev, newLine]);
      const createdLine = await createInventoryLineAction(newLine);
      router.refresh();
      if (createdLine && createdLine !== newLine) {
        setLines((prev) => prev.map((line) => 
          line.modelId === model.id && line.inventoryId === inventory.id ? createdLine : line
        ));
      }
    } catch (error) {
      console.error("Error creating inventory line:", error);
      setLines((prev) => prev.filter((line) => !(line.modelId === model.id && line.inventoryId === inventory.id)));
      toast({
        title: "Erreur",
        description: "Impossible de créer la ligne d'inventaire.",
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = async (line: InventoryLine, newQuantity: number) => {
    if (newQuantity < 0) return;
    if (pendingDeletionRef.current[line.modelId]) {
      clearTimeout(pendingDeletionRef.current[line.modelId]);
      delete pendingDeletionRef.current[line.modelId];
    }
    try {
      if (newQuantity === 0) {
        setLines((prev) => prev.map((l) => l.modelId === line.modelId ? { ...l, quantity: 0 } : l));

        pendingDeletionRef.current[line.modelId] = setTimeout(async () => {
          setLines((prev) => prev.filter((l) => l.modelId !== line.modelId));
          await deleteInventoryLineAction(line.inventoryId, line.modelId);
          delete pendingDeletionRef.current[line.modelId];
          router.refresh();
        }, 10000);
      } else {
        const updatedLine = { ...line, quantity: newQuantity };
        setLines((prev) => prev.map((l) => l.modelId === line.modelId ? updatedLine : l));

        await updateInventoryLineAction({
          inventoryId: line.inventoryId,
          modelId: line.modelId,
          quantity: newQuantity,
          purchasePriceHT: line.purchasePriceHT,
        });
      }
      router.refresh();
    } catch (error) {
      console.error("Error updating quantity:", error);
      setLines((prev) => prev.map((l) => l.modelId === line.modelId ? line : l));
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLine = async (line: InventoryLine) => {
    try {
      setLines((prev) => prev.filter((l) => l.modelId !== line.modelId));
      await deleteInventoryLineAction(inventory.id, line.modelId);
      router.refresh();
    } catch (error) {
      console.error("Error deleting inventory line:", error);
      setLines((prev) => [...prev, line]);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la ligne d'inventaire.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (status: InventoryStatus) => {
    try {
      await updateInventoryAction({
        id: inventory.id,
        name: inventory.name,
        valorisation: lines.reduce((total, line) => total + (line.purchasePriceHT || 0), 0).toFixed(2).toString(),
        status: status
      });
      if (status === InventoryStatus.VALIDE) {
        toast({
          title: "Succès",
          description: "Succès de la mis à jour d'inventaire.",
        });
      }
      router.refresh();
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const isEditable = !(inventory.status === InventoryStatus.VALIDE || inventory.status === InventoryStatus.ARCHIVE);

  return (
    <div>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <Card 
            className="flex justify-center items-center bg-gray-100 cursor-pointer p-2"
            onClick={() => router.push('/products/inventory')}
          >
            <ArrowLeft size={16} />
          </Card>
          <div className="flex items-center gap-2 mt-1">
            <Heading heading="2" className="text-gray-700 leading-none mt-2">
              {inventory.name}
            </Heading>
            <span className="text-sm text-gray-500">#{inventory.id}</span> 
            <Badge
              size="md"
              variant={
                inventory.status === InventoryStatus.EN_ATTENTE ? "gray"
                : inventory.status === InventoryStatus.VALIDE ? "green"
                : inventory.status === InventoryStatus.ARCHIVE ? "red"
                : "orange"
              }
              className="px-2 py-1 mb-2"
            >
              {inventory.status === InventoryStatus.EN_ATTENTE ? "En attente"
                : inventory.status === InventoryStatus.VALIDE ? "Validé"
                : inventory.status === InventoryStatus.ARCHIVE ? "Archivé"
                : "Inconnu"
              }
            </Badge>
          </div>
        </div>
        {inventory.status === InventoryStatus.EN_ATTENTE ? (
          <div className="flex items-center gap-3">       
            <Button
              size="lg"
              variant="default"
              className="flex items-center px-4 py-1 rounded-md gap-2"
              onClick={() => handleStatusChange(InventoryStatus.VALIDE)}
            >
              Valider
            </Button>
            <Button
              size="lg"
              variant="destructive"
              className="flex items-center px-4 py-1 rounded-md gap-2"
              onClick={() => handleStatusChange(InventoryStatus.ARCHIVE)}
            >
              Archiver
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <Button
              size="lg"
              variant="outline"
              className="flex items-center px-4 py-1 rounded-md gap-2"
              onClick={() => handleStatusChange(InventoryStatus.EN_ATTENTE)}
            >
              <RefreshCw className="w-4 h-4" />
              Réouvrir pour édition
            </Button>              
          </div>
        )}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            <Heading heading="3" className="text-gray-700 font-bold">Ajouter des produits</Heading>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-7">
            <ProductSearchBar
              purpose="sales-point"
              isEditable={isEditable}
              initialProducts={initialProducts}
              onModelSelected={handleModelSelected}
            />
            <div className="flex justify-end">
              <TableFilter 
                search={{ 
                  show: true, 
                  placeholder: "Rechercher par id modele", 
                  onSearch: (search) => {
                    setPage(1);
                    setSearch(search);
                  } 
                }}
                items={{ total: inventorieLines.total, count: LIMIT, defaultPage }}
                onPageChange={(page) => setPage(page)}
              />
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader className="bg-neutral-100">
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Code barre</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventorieLines.items.length > 0 ? (
                    inventorieLines.items.map((line) => (
                      <TableRow key={`${line.inventoryId}-${line.modelId}`}>
                        <TableCell>
                          <ModelCell model={{
                            name: line.model?.name ?? "",
                            attributs: line.model?.attributs ?? [],
                            price: line.model?.price ?? 0,
                            image: line.model?.img?.find(img =>
                              line.model?.attributValues?.some(av => av.idAttributValue === img.attributeValueId)
                            )?.url ?? line.model?.img?.[0]?.url ?? "",
                          }} />
                        </TableCell>
                        <TableCell>
                          <span>{line.model?.codeBar || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            disabled={!isEditable && editingLineId !== line.modelId}
                            value={ editingQuantity[line.modelId] !== undefined ? String(editingQuantity[line.modelId]) : String(line.quantity) }
                            onChange={(e) => {
                              const value = e.target.value.trim();

                              if (value === "") {
                                setEditingQuantity((prev) => ({
                                  ...prev,
                                  [line.modelId]: 0, 
                                }));
                                return;
                              }

                              if (/^\d+$/.test(value)) {
                                const newQuantity = parseInt(value, 10);
                                setEditingQuantity((prev) => ({
                                  ...prev,
                                  [line.modelId]: newQuantity,
                                }));
                              }
                            }}
                            onBlur={() => {
                              const newQuantity = editingQuantity[line.modelId];
                              if (newQuantity !== undefined && newQuantity !== line.quantity) {
                                handleQuantityChange(line, newQuantity);
                              }
                              setEditingLineId(null);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {isEditable ? (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteLine(line)}
                              disabled={line.quantity <= 0}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            editingLineId === line.modelId ? (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => setEditingLineId(null)}
                              >
                                <Check className="w-4 h-4" />  
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => {
                                  setEditingLineId(line.modelId);
                                  setEditingQuantity((prev) => ({
                                    ...prev,
                                    [line.modelId]: line.quantity,
                                  }));
                                }} 
                                disabled={line.quantity <= 0}
                              >
                                <Pen className="w-4 h-4" />
                              </Button>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        Aucun produit
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
