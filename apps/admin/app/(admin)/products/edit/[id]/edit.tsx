"use client"
import { Brand, Category, Collection, Customization, OnlineShop, Product, ProductDescription, ProductPack, ProductState, ProductStatus, ProductUpdate, ProductWithAdmin, Store, SubCategory, Supplier } from "@repo/core/models";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { WYSIWYG } from "~/components/wysiwyg";
import Image from "next/image";
import { Badge, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "~/components/ui";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { RecursiveAttributes } from "./recursive-attributes";
import Description from "./description";
import Stores from "./stores";
import { useEffect, useState } from "react";
import { generateProductDescriptionAction, updateOnlineShopsAction, updateProductAction } from "@repo/actions/products";
import { useToast } from "~/hooks/use-toast";
import Collections from "./collections";
import CustomizationLine from "./customization";
import { useDebounce } from "~/hooks/use-debounce";
import { useDeferredEffect } from "~/hooks/use-deffered-effect";
import { ProductStateBadges } from "../../state";
import { addCustomizationAction } from "@repo/actions/products";
import Link from "next/link";
import { ChatGPTResponse } from "@repo/core/services";
import { SearchableProductsTable } from "../../add/product-searchbar";

const onlineShopsList = [{value: OnlineShop.NATAQUASHOP, key: "Nataquashop" }
    ,{ value: OnlineShop.CRAZYSWIM, key: "Crazy Swim" }
    ,{ value: OnlineShop.SWIMWEAR_DESTOCK, key: "Swimwear Destock" }
]


export default function Edit({ product, categories, subCategories, brands, stores, collections, suppliers, aiThreadId, pack }: 
    { product: ProductWithAdmin, categories: Category[], subCategories: SubCategory[], brands: Brand[], stores: Store[], 
        collections: Collection[], suppliers: Supplier[], aiThreadId: string, pack: ProductPack[] }) 
{
    const { toast } = useToast();
    const [prodDescription, setProdDescription] = useState<ProductDescription[]>(product.descriptions || []);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

    const description = (product.descriptions || []).find((description) => description.lang === "fr");

    const [onlineShops, setOnlineShops] = useState<OnlineShop[]>(product.onlineShops || []);
    const [productUpdate, setProductUpdate] = useState<ProductUpdate>(product);
    const [customizations, setCustomizations] = useState<Customization[]>(product.customizations || []);

    const [comment, setComment] = useDebounce(product.comment || "", 500);

    if(collections.length === 0) {
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la récupération des collections, veuillez réessayer plus tard",
            variant: "destructive",
        });
    }

    const packPrice = product.isPackage
        ? pack.reduce((sum, item) => sum + (item.product?.price ?? 0), 0)
        : product.price;

    useDeferredEffect(() => {
        updateOnlineShopsAction(product.id, onlineShops)
        .then(success => {
            if(success) {
                toast({
                    title: "Boutiques en ligne mis à jour",
                    description: "Les boutiques en ligne ont été mis à jour avec succès",
                });
            } else {
                toast({
                    title: "Erreur",
                    description: "Les boutiques en ligne n'ont pas été mis à jour",
                    variant: "destructive",
                });
            }
        });

    }, [onlineShops]);

    useDeferredEffect(() => {
        updateProductAction(product.id, {...productUpdate, comment})
        .then((success: boolean) => {
            if(success) {
                toast({
                    title: "Produit mis à jour",
                    description: "Le produit a été mis à jour avec succès",
                });
            } else {
                toast({
                    title: "Erreur",
                    description: "Le produit n'a pas été mis à jour",
                    variant: "destructive",
                });
            }
        });
    }, [productUpdate, comment]);

    return (
        <div className="container">
            <div className="flex gap-2 justify-start items-center mb-8">
                <Link href="/products">
                    <Button className="text-gray-700" variant="secondary" size="icon"><ArrowLeft /> </Button>
                </Link>
                <Heading heading={"2"} className="text-gray-700 m-0"># {product.id} - {description?.title}</Heading>      
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center gap-2 justify-between">
                            <Heading heading="3" className="text-gray-700 font-bold">Général</Heading>
                            <DropdownMenu >
                                <DropdownMenuTrigger asChild className="">
                                    <Button variant="outline" className=" py-2 font-normal flex items-center justify-between px-3 overflow-hidden border-none shadow-none">
                                        {ProductStateBadges[productUpdate.status]}
                                        <ChevronDown className="opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {
                                        Object.keys(ProductStateBadges).map((status) => {
                                            const statusEnum = status as ProductStatus;
                                            return (
                                                <DropdownMenuCheckboxItem className="cursor-pointer" key={status} checked={productUpdate.status === statusEnum}
                                                    onClick={() => {
                                                        setProductUpdate({...productUpdate, status: statusEnum});
                                                }}
                                            >
                                                {ProductStateBadges[statusEnum]}
                                            </DropdownMenuCheckboxItem> 
                                        )
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {     
                            prodDescription.map((d) => {
                                return <Description key={d.lang} {...d} productId={product.id} pending={isGeneratingDescription} />
                            })
                        }
                        <Button variant="outline" onClick={async () => {
                            setIsGeneratingDescription(true);
                            try {
                                const desc = await generateProductDescriptionAction(aiThreadId, product)
                                if(desc) {
                                    setProdDescription(desc.map((d, index) => {
                                        return {
                                            title: product.descriptions[index]?.title ?? "",
                                            description: d.content,
                                            lang: d.lang,
                                            productId: product.id
                                        }
                                    }));
                                }
                            } catch (error) {
                                toast({
                                    title: "Erreur",
                                    description: "Une erreur est survenue lors de la génération de la description",
                                    variant: "destructive",
                                });
                            } finally {
                                setIsGeneratingDescription(false);
                            }
                        }}>
                            {isGeneratingDescription ? <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Génération de la description en cours...</div> : "Générer une description"}
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle><Heading heading="3" className="text-gray-700 font-bold">Photos du produit</Heading></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-5 gap-4">
                            {
                                (product.images || []).map((image, index) => (
                                    <div key={index} className="relative aspect-square border-dashed rounded-md border-2 border-gray-200 flex items-center justify-center">
                                        <Image src={image.url} alt={product.id.toString()} width={100} height={100} className="w-full h-full object-contain " />
                                        <div className="absolute top-1 right-1 h-6 w-full flex items-center justify-between px-2">
                                            <Badge variant="blue" className="text-xs">{image.attribute?.name}</Badge>
                                            <Button variant="destructive" size="icon" className="h-6 w-6">
                                                &times;
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            }
                            <div className="bg-gray-100 py-4 rounded-md border text-center text-gray-400 flex flex-col items-center justify-center cursor-pointer">
                                <b>Ajouter une image</b>
                                <p className="text-sm text-gray-400">Accepte uniquement les .jpg, .png, .webp (5MB)</p>
                                <button className="hidden"></button>
                            </div>
                        </div>
                        
                         
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle><Heading heading="3" className="text-gray-700 font-bold">Classification</Heading></CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="catégorie">Catégorie</Label>
                            <Select defaultValue={(product.categoryId ?? 1194).toString()} onValueChange={(value) => setProductUpdate({...productUpdate, categoryId: parseInt(value)})}>
                                <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                                <SelectContent>
                                    {
                                        categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="sous-catégorie">Sous-catégorie</Label>
                            <Select defaultValue={(product.subCategoryId ?? 1206).toString()} onValueChange={(value) => setProductUpdate({...productUpdate, subCategoryId: parseInt(value)})}>
                                <SelectTrigger><SelectValue placeholder="Choisir une sous-catégorie" /></SelectTrigger>
                                <SelectContent>
                                    {
                                        subCategories.map((subCategory) => (
                                            <SelectItem key={subCategory.id} value={subCategory.id.toString()}>{subCategory.name}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="marque">Marque</Label>
                            <Select defaultValue={(product.brandId ?? 1).toString()} onValueChange={(value) => setProductUpdate({...productUpdate, brandId: parseInt(value)})}>
                                <SelectTrigger><SelectValue placeholder="Choisir une marque" /></SelectTrigger>
                                <SelectContent>
                                    {
                                        brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="magasin">Magasin</Label>
                            <Stores stores={stores} productStores={product.stores || []} productId={product.id} />
                        </div>
                        <div>
                            <Label htmlFor="collection">Collection</Label>
                            <Collections collections={collections} productCollections={product.collections || []} productId={product.id} />
                        </div>
                        <div>
                            <Label htmlFor="boutique">Boutique</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full font-normal flex items-center justify-between px-3 overflow-hidden">
                                        {onlineShops.length > 0 ? onlineShops.map((os) => onlineShopsList.find((osList) => osList.value === os)?.key).join(", ") : "Publier sur aucune boutique"}
                                        <ChevronDown className="opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full" align="start">
                                    {
                                        onlineShopsList.map((os) => (
                                            <DropdownMenuCheckboxItem key={os.value} checked={onlineShops.includes(os.value)}
                                                onCheckedChange={(checked) => {
                                                    if(checked) {
                                                        setOnlineShops([...onlineShops, os.value]);
                                                    } else {
                                                        setOnlineShops(onlineShops.filter((onlineShop) => onlineShop !== os.value));
                                                    }
                                                }}
                                            >
                                                {os.key}
                                            </DropdownMenuCheckboxItem>
                                        ))
                                    }
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle><Heading heading="3" className="text-gray-700 font-bold">Prix</Heading></CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="price-ht">Prix unitaire HT</Label>
                            <Input id="price-ht" type="number" value={packPrice} disabled={product.isPackage}
                            className={product.isPackage ? "bg-gray-100 cursor-not-allowed" : ""} onBlur={(e) => { if (!product.isPackage) { setProductUpdate({ ...productUpdate, price: parseFloat(e.target.value) }); } }} />
                        </div>
                         <div>
                            <Label htmlFor="pma-ht">PMA (HT)</Label>
                            <Input id="pma-ht" type="number" placeholder="15.50" defaultValue={product.buyPriceWithoutVat}
                            onBlur={(e) => setProductUpdate({...productUpdate, buyPriceWithoutVat: parseFloat(e.target.value)})}/>
                        </div>
                        <div>
                            <Label htmlFor="tva">TVA</Label>
                            <Select defaultValue={(product.vatRate ?? 20).toString()} onValueChange={(value) => setProductUpdate({...productUpdate, vatRate: parseFloat(value)})}>
                                <SelectTrigger id="tva"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="20">20%</SelectItem>
                                    <SelectItem value="10">10%</SelectItem>
                                    <SelectItem value="5.5">5.5%</SelectItem>
                                    <SelectItem value="0">0%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle><Heading heading="3" className="text-gray-700 font-bold">Fournisseur</Heading></CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                             <div className="md:col-span-1">
                                <Label htmlFor="supplier">Fournisseur</Label>
                                <Select defaultValue={(product.supplierId ?? 1).toString()} onValueChange={(value) => setProductUpdate({...productUpdate, supplierId: parseInt(value)})}>
                                    <SelectTrigger id="supplier"><SelectValue placeholder="ARENA" /></SelectTrigger>
                                    <SelectContent>
                                        {
                                            suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id.toString()}>{supplier.name}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="supplier-code">Code article fournisseur</Label>
                                <Input id="supplier-code" placeholder="7232308" defaultValue={product.manufacturerReference}
                                onBlur={(e) => setProductUpdate({...productUpdate, manufacturerReference: e.target.value})}/>
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="min-stock">Stock minimum</Label>
                                <Input id="min-stock" type="number" placeholder="10" defaultValue={product.minStock}
                                onBlur={(e) => setProductUpdate({...productUpdate, minStock: parseInt(e.target.value)})}/>
                            </div>
                            <div>
                                <Label htmlFor="weight">Poids (en grammes)</Label>
                                <Input id="weight" type="number" placeholder="1000.00" defaultValue={product.weight}
                                onBlur={(e) => setProductUpdate({...productUpdate, weight: parseFloat(e.target.value)})}/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {!product.isPackage && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle><Heading heading="3" className="text-gray-700 font-bold">Modèles</Heading></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Options de modèles</Label>
                            {
                                product.productAttributes && product.productAttributes.length > 0 ? (
                                <div className="flex flex-col border rounded-lg">
                                    {
                                        product.productAttributes?.map((attribute, index) => (
                                            <div key={attribute.id} className={`flex flex-row gap-4 items-center px-3 py-4 ${index !== (product.productAttributes?.length ?? 0) - 1 ? "border-b" : ""}`}>
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <ChevronUp className={`w-4 h-4 rounded-md p-1	${index > 0 ? "cursor-pointer bg-gray-300 " : "cursor-not-allowed bg-gray-100 text-gray-400"}`}  />
                                                    <ChevronDown className={`w-4 h-4 rounded-md p-1	${index < (product.productAttributes?.length ?? 0) - 1 ? "cursor-pointer bg-gray-300 " : "cursor-not-allowed bg-gray-100 text-gray-400"}`}  />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Label className="text-md font-medium text-gray-700">{attribute.name}</Label>
                                                    <div className="flex flex-row gap-2">
                                                        {
                                                            attribute.values.map((value) => (
                                                                <Badge variant="blue" key={value.id} className="text-sm">{value.name}</Badge>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <p>Aucune option de modèle trouvée</p>
                                    </div>
                                )
                            }
                        </div>
                        <div>
                            <Label>Liste des modèles</Label>
                            <div className="border rounded-md divide-y">
                                <Table>
                                    <TableHeader className="bg-neutral-100">
                                        <TableRow>
                                            <TableHead className="w-2/12">Modèle</TableHead>
                                            <TableHead className="w-1/12">Prix HT<span className="text-xs text-gray-400">(HT)</span></TableHead>
                                            <TableHead className="w-1/12">PMA (HT)</TableHead>
                                            <TableHead className="w-1/12">Stock min.</TableHead>
                                            <TableHead className="w-2/12">Ref. Fournisseur</TableHead>
                                            <TableHead className="w-2/12">Ref. Fabricant</TableHead>
                                            <TableHead className="w-2/12">Code barre</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>
                                <div className="flex items-center">
                                    {product.productAttributes && product.productAttributes.length > 0 ? (
                                        <RecursiveAttributes 
                                            attributes={product.productAttributes} 
                                            currentIndex={0}
                                            modeles={product.modeles || []}
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
                )}
                {product.isPackage && (
                    <SearchableProductsTable
                        selectedProducts={[
                            ...pack.map((item) => item.product ?? ({} as Product))
                                   .filter((product, index, self) => product.id && self.findIndex(p => p.id === product.id) === index ),
                        ]}
                        onSelectedProductsChange={() => {}}
                        disabled={true} 
                        productPackId={product.id}
                    />
                )}    
                
                <Card>
                    <CardHeader><CardTitle><Heading heading="3" className="text-gray-700 font-bold">État du produit</Heading></CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="product-state">État</Label>
                            <Select defaultValue={product.state} onValueChange={(value) => setProductUpdate({...productUpdate, state: value as ProductState})}>
                                <SelectTrigger id="product-state"><SelectValue placeholder="Normal" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="NOUVELLE_COLLECTION">Nouvelle collection</SelectItem>
                                    <SelectItem value="PLUS_FABRIQUE">Plus fabriqué</SelectItem>
                                    <SelectItem value="REASSORT">Reassort</SelectItem>
                                    <SelectItem value="ANCIENNE_COLLECTION">Ancienne collection</SelectItem>
                                    <SelectItem value="PRODUIT_CLUB">Produit club</SelectItem>
                                    <SelectItem value="CORBEILLE">Corbeille</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="comments">Commentaires</Label>
                            <WYSIWYG content={comment} placeholder="Ajouter un commentaire..."
                            onChange={(content) => setComment(content)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle><Heading heading="3" className="text-gray-700 font-bold">Personnalisation du produit</Heading></CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Switch id="personalization" checked={productUpdate.customization}
                            onCheckedChange={(checked) => setProductUpdate({...productUpdate, customization: checked})}/>
                            <Label htmlFor="personalization">Activer la personnalisation du produit ?</Label>
                        </div>
                        {
                            productUpdate.customization ? 
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Prix</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        customizations.map((customization) => (
                                            <CustomizationLine key={customization.id} customization={customization} onDelete={() => {
                                                setCustomizations(customizations.filter((c) => c.id !== customization.id));
                                            }} />
                                        ))
                                    }
                                </TableBody>
                            </Table>
                            : null
                        }


                        <div className="flex items-center justify-end">
                            <Button variant="link" className="text-blue-500" onClick={(e) => {
                                e.preventDefault();
                                addCustomizationAction(product.id)
                                .then((customization) => {
                                    setCustomizations([...customizations, customization]);
                                })
                                .catch((error) => {
                                    toast({
                                        title: "Erreur",
                                        description: "Une erreur est survenue lors de l'ajout de la personnalisation" + error.message,
                                        variant: "destructive",
                                    });
                                });
                            }}>
                                <Plus />
                                Ajouter une personnalisation
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}