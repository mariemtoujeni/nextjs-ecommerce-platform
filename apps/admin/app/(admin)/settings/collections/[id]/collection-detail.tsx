'use client'

import { Collection, CollectionProduct, ModelProductDetail, ProductWithAdmin } from "@repo/core/models";
import { CollectionDetail } from "@repo/core/usecases";
import { Plus, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Heading, Input, Label, Switch } from "~/components/ui";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "~/components/ui/table";
import { TableHead } from "~/components/ui/table";
import { ModalAddProductToCollection } from "./modal-add-product-component";
import { getAllProductAction } from "@repo/actions/products";
import { useToast } from "~/hooks/use-toast";
import { ModelCell } from "~/components/ModelCell";

export interface CollectionDetailViewProps {
    collection: CollectionDetail,
    products: ProductWithAdmin[],
    onCollectionGeneralInfoChange: (general: Collection) => void
    onCollectionProductListChange: (products: CollectionProduct[]) => void
}

export const CollectionDetailView : React.FunctionComponent<CollectionDetailViewProps> = ({collection, products : initialProducts, onCollectionGeneralInfoChange, onCollectionProductListChange}) => {
    const [open, setOpen] = useState(false);
    const {toast} = useToast();
    const [general, setGeneral] = useState<Collection>(collection.general);
    const [collectionProducts, setCollectionProducts] = useState<CollectionProduct[]>(collection.products.items);
    const [products, setProducts] = useState<ProductWithAdmin[]>(collection.products.items.map(product => product.product as ProductWithAdmin));
    const [productsNotInCollection, setProductsNotInCollection] = useState<ProductWithAdmin[]>(initialProducts.filter(product => !products.some(p => p.id === product.id)));
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handelGeneralInfoChange = (general: Collection) => {
        // Mettre à jour l'état local immédiatement pour un affichage fluide
        setGeneral(general);
        
        // Utiliser le timeout pour éviter de surcharger le serveur
        if(updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }
        updateTimeoutRef.current = setTimeout(() => {
            onCollectionGeneralInfoChange(general);
        }, 1000);
    }

    const handelDeleteProduct = (productId: number) => {
        // Mettre à jour l'état local immédiatement pour un affichage fluide
        setProducts(products.filter(p => p.id !== productId));
        setCollectionProducts(collectionProducts.filter(p => p.productId !== productId));
        
        // Utiliser le timeout pour éviter de surcharger le serveur
        if(deleteTimeoutRef.current) {  
            clearTimeout(deleteTimeoutRef.current);
        }
        deleteTimeoutRef.current = setTimeout(() => {
            onCollectionProductListChange(collectionProducts.filter(p => p.productId !== productId));
        }, 500);
    }
    
    return <div className="flex flex-col gap-5 mt-5">
        <Card className="mt-8">
            <CardHeader>
                <div className="flex flex-row justify-between">
                    <CardTitle>
                        <Heading heading="3" className="text-gray-700 font-bold">Général</Heading>
                    </CardTitle>
                    <div className="flex flex-row gap-2 items-center">
                        <Switch id="active" checked={general.active === 1} onCheckedChange={() => {
                            handelGeneralInfoChange({
                                ...general,
                                active: general.active === 1 ? 0 : 1
                            });
                        }} />
                        <Label htmlFor="active">{general.active === 1 ? 'Actif' : 'Inactif'}</Label>
                    </div>
                </div>
                <CardContent>
                    <div className="flex flex-col gap-5 mt-5">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input id="name" 
                                value={general.name} 
                                className="col-span-3 bg-neutral-100 p-2 rounded-lg" 
                                onChange={(e) => {
                                    handelGeneralInfoChange({
                                        ...general,
                                        name: e.target.value
                                    });
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </CardHeader>
        </Card>
        <Card className="mt-2">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row justify-between">
                        <Heading heading="3" className="text-gray-700 font-bold">Liste des produits</Heading>
                        <Dialog open={open} onOpenChange={(e) => {setOpen(e)}}>
                            <DialogTrigger className="text-blue-500 underline underline-offset-8 flex flex-row gap-2 items-center text-base">
                                <Plus />
                                <span>Ajouter un produit</span>
                            </DialogTrigger>
                            <ModalAddProductToCollection 
                                products={productsNotInCollection} 
                                open={open} 
                                onClose={() => {setOpen(false)}} 
                                onAdd={(product) => {
                                    const newProductList : CollectionProduct[] = [
                                        ...collectionProducts, 
                                        {
                                            collectionId: collection.general.id,
                                            productId: product.id,
                                            product: product
                                        }
                                    ]; 
                                    setCollectionProducts(newProductList);
                                    setProducts([...products, product]);
                                    setProductsNotInCollection(productsNotInCollection.filter(p => p.id !== product.id));                                    
                                    onCollectionProductListChange(newProductList);
                                    setOpen(false);
                                }} 
                                onSearchRequested={async (search) => {
                                    if(search.length > 0) {
                                        const searchProducts = await getAllProductAction({
                                            search: search,
                                            limit: 50,
                                            offset: 0
                                        });
                                        if((searchProducts && searchProducts.error) || !searchProducts) {
                                            toast({
                                                title: "Erreur lors de la récupération des produits",
                                                description: "Erreur lors de la récupération des produits " + searchProducts?.error,
                                                variant: "destructive"
                                            });
                                        }   else {
                                            const searchProductsNotInCollection = searchProducts.items.filter(p => !products.some(p2 => p2.id === p.id));                                        
                                            setProductsNotInCollection(searchProductsNotInCollection);
                                        }
                                    } else {
                                        setProductsNotInCollection(initialProducts.filter(p => !products.some(p2 => p2.id === p.id)));
                                    }
                                }}
                            />
                        </Dialog>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader  className="bg-neutral-100">
                            <TableRow>
                                <TableHead>Reférence fabricant</TableHead>
                                <TableHead>Produit</TableHead>
                                <TableHead className="text-right pr-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                products.map((product : ProductWithAdmin) => {
                                    const model : ModelProductDetail = {
                                        name: product.descriptions[0] && product.descriptions[0].title ? product.descriptions[0].title : product.descriptions[1] && product.descriptions[1].title ? product.descriptions[1].title : '',
                                        price: product.price,
                                        attributs: [],
                                        image: product.images && product.images.length > 0 ? `${product.images[0]?.url}` : ''
                                    }
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>{product.manufacturerReference}</TableCell>                                        
                                            <TableCell>
                                                <ModelCell model={model}/>
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <Button variant="outline" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => {
                                                    handelDeleteProduct(product.id);
                                                }}>
                                                    <Trash className="text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                )})
                            }
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
}