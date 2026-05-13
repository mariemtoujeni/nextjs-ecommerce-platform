'use client'

import { Card, CardContent, CardHeader, CardTitle, Heading, Input, Label, SelectItem, Select, SelectContent, SelectTrigger, SelectValue, Button } from "~/components/ui"
import { getFrenchDepartmentName, ReturnAll } from "@repo/core/types"
import { ProductSearchBar } from "~/components/ProductSearchBar"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { ModelCell } from "~/components/ModelCell"
import { ShopPresenterWithModels } from "@repo/actions/orders"
import { ModelWithProduct, ShopStatus, Department, ModelAttributValue, ShopLine } from "@repo/core/models"
import { Trash2, Pen } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { useToast } from "~/hooks/use-toast"

export interface ShopDetailComponentProps {
    shop: ShopPresenterWithModels
    initialProducts?: ReturnAll<ModelWithProduct>
    models?: ModelWithProduct[]
    isEditable: boolean
    onShopChange: (shop: ShopPresenterWithModels) => void
}

export const ShopDetailComponent: React.FunctionComponent<ShopDetailComponentProps> = ({shop : initialShop, initialProducts, models, isEditable, onShopChange}) => {
    const [shop, setShop] = useState<ShopPresenterWithModels>(initialShop);
    const [isOpen, setIsOpen] = useState(false);
    const [lineToEdit, setLineToEdit] = useState<ShopLine | null>(null);
    const { toast } = useToast();

    return <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="fixed top-[350px]">
                <DialogHeader>
                    <DialogTitle>Modifier la ligne</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-8 pt-9">
                    <div className="flex flex-col gap-2">
                        <Label>Quantité initiale</Label>
                        <Input
                            type="number"
                            value={lineToEdit?.initialQuantity ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setLineToEdit((prev) => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        initialQuantity: value === '' ? 0 : parseInt(value),
                                        finalQuantity: value === '' ? 0 : parseInt(value) - (prev.soldQuantity ?? 0),
                                    };
                                });
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Quantité vendue</Label>
                        <Input
                            type="number"
                            value={lineToEdit?.soldQuantity ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setLineToEdit((prev) => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        soldQuantity: value === '' ? 0 : parseInt(value),
                                    };
                                });
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Quantité finale</Label> 
                        <Input
                            type="number"
                            value={lineToEdit?.finalQuantity ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setLineToEdit((prev) => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        finalQuantity: value === '' ? 0 : parseInt(value),
                                    };
                                });
                            }}
                        />
                    </div>
                </div>
                <DialogFooter className="mt-5 flex flex-row justify-end gap-2">
                    <Button variant="outline" size="lg" onClick={() => {
                        setIsOpen(false);
                    }}>
                        Annuler
                    </Button>
                    <Button variant="default" size="lg" onClick={() => {
                        setIsOpen(false);
                        const newShop = {
                            ...shop,
                            lines: shop.lines.map((l) => l.idModel === lineToEdit?.idModel ? { ...l, initialQuantity: lineToEdit.initialQuantity, soldQuantity: lineToEdit.soldQuantity, finalQuantity: lineToEdit.finalQuantity } : l)
                        };
                        setShop(newShop);
                        onShopChange(newShop);
                        setLineToEdit(null);
                    }}>
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>
                    <Heading heading="3" className="text-gray-700 font-bold">Informations générales</Heading>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row gap-7">
                    <div className="flex flex-col gap-2 w-1/2">
                        <Label>Nom du point de vente</Label>
                        <Input 
                            value={shop?.name} 
                            disabled={!isEditable}                             
                            className="disabled:bg-muted focus:bg-white"
                            onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShop({...shop, name: e.target.value});
                                onShopChange(shop);
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                        <Label>Lieu du point de vente</Label>                                
                        <Select 
                            value={shop?.department ?? ''} 
                            onValueChange={(value) => {
                                setShop({...shop, department: value});
                                onShopChange(shop);
                            }}
                            disabled={!isEditable}
                        >
                            <SelectTrigger className="disabled:bg-muted focus:bg-white w-full">
                                <SelectValue placeholder="Sélectionner un lieu">
                                    {shop?.department ? getFrenchDepartmentName(parseInt(shop.department)) : ''}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                            {
                                Object.entries(Department).map(([key, value]) => (
                                    <SelectItem key={key} value={value}>{getFrenchDepartmentName(parseInt(value))}</SelectItem>
                                ))
                            }
                            </SelectContent>
                        </Select>
                    </div>
                </div>                    
            </CardContent>
        </Card>
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>
                    <Heading heading="3" className="text-gray-700 font-bold">Modèles du point de vente</Heading>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-7">
                    <ProductSearchBar          
                        purpose="sales-point"
                        initialProducts={initialProducts} 
                        isEditable={isEditable} 
                        models={models}
                        onModelSelected={(model) => {
                            const newShop = {
                                ...shop, 
                                lines: [
                                    ...shop.lines, {
                                        idModel: model.id,
                                        initialQuantity: 0,
                                        soldQuantity: 0,
                                        finalQuantity: 0,
                                        idShop: shop.id,
                                        totalPriceTTC: 0,
                                        model: {
                                            name: model.product.descriptions[0]?.title ?? '',
                                            attributs: model.attributValues.map((a : ModelAttributValue) => a.attributValue.nom) ?? [],
                                            price: (model.priceWithVat ?? 0) > 0 ? 
                                                (model.priceWithVat ?? 0) :                             
                                                (model.product.price ?? 0),
                                            image: model.product.images[0]?.url ?? '',
                                            stock: model.stock?.disponible ?? 0
                                        }
                                    }
                                ]
                            };
                            setShop(newShop);
                            onShopChange(newShop);
                        }}
                    />
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader className="bg-neutral-100">
                                <TableRow>
                                    <TableHead className="w-2/6">Produit</TableHead>
                                    <TableHead className="w-1/6">Stock initial</TableHead>
                                    <TableHead className="w-1/6">Stock vendu</TableHead>
                                    <TableHead className="w-1/6">Stock final</TableHead>
                                    <TableHead className="w-1/6"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    shop?.lines?.map((line, index) => (
                                        <TableRow key={line.idModel}>
                                            <TableCell>
                                                <ModelCell model={line.model} />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    disabled={!isEditable}
                                                    value={line.initialQuantity}
                                                    max={typeof line.model.stock === 'number' && line.model.stock > 0
                                                        ? line.model.stock
                                                        : (typeof line.model.minStock === 'number'
                                                            ? Math.abs(line.model.minStock)
                                                            : 0)
                                                    }
                                                    min={0}
                                                    onChange={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if((typeof line.model.stock === 'number' && line.model.stock > 0 && parseInt(e.target.value) > line.model.stock)) {
                                                            toast({
                                                                title: "Erreur",
                                                                description: "La quantité initiale ne peut pas être supérieure au stock disponible",
                                                                variant: "destructive",
                                                            });
                                                            return;
                                                        } else if((typeof line.model.minStock === 'number' && line.model.minStock > 0 && parseInt(e.target.value) > Math.abs(line.model.minStock))) {
                                                            toast({
                                                                title: "Erreur",
                                                                description: "La quantité initiale ne peut pas être supérieure au stock minimum",
                                                                variant: "destructive",
                                                            });
                                                            return;
                                                        }
                                                        const newShop = {
                                                            ...shop,
                                                            lines: [
                                                                ...shop.lines.map((l) => l.idModel === line.idModel ? { 
                                                                    ...l, 
                                                                    initialQuantity: parseInt(e.target.value) || 0,
                                                                    finalQuantity: parseInt(e.target.value) || 0 - (l.soldQuantity ?? 0)
                                                                } : l)
                                                            ]
                                                        };
                                                        setShop(newShop);
                                                        onShopChange(newShop);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    disabled={!isEditable || shop.status === ShopStatus.DRAFT}
                                                    value={line.soldQuantity} 
                                                    min={0}
                                                    onChange={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const newShop = {
                                                            ...shop,
                                                            lines: [
                                                                ...shop.lines.map((l) => l.idModel === line.idModel ? { 
                                                                    ...l, 
                                                                    soldQuantity: parseInt(e.target.value) || 0,
                                                                    finalQuantity: (l.initialQuantity ?? 0) - (parseInt(e.target.value) || 0) 
                                                                } : l)
                                                            ]
                                                        };
                                                        setShop(newShop);
                                                        onShopChange(newShop);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    disabled={true}
                                                    value={line.finalQuantity} 
                                                    min={0}
                                                    onChange={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const newShop = {
                                                            ...shop,
                                                            lines: [
                                                                ...shop.lines.map((l) => l.idModel === line.idModel ? { ...l, finalQuantity: parseInt(e.target.value) || 0 } : l)
                                                            ]
                                                        };
                                                        setShop(newShop);
                                                        onShopChange(newShop);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="w-1/6 text-right">
                                                {
                                                    isEditable ? (
                                                        <Button variant="outline" size="icon" onClick={() => {
                                                            const newShop = {
                                                                ...shop,
                                                                lines: shop.lines.filter((l) => l.idModel !== line.idModel)
                                                            };
                                                            setShop(newShop);
                                                            onShopChange(newShop);
                                                        }}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    ) : shop.status !== ShopStatus.CLOSED && (
                                                        <Button variant="outline" size="icon" onClick={() => {
                                                            // Enable modification of the line
                                                            setLineToEdit(line);
                                                            setIsOpen(true);
                                                        }}>
                                                            <Pen className="w-4 h-4" />
                                                        </Button>
                                                    )
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    </>
}