"use client"
import { AttributWithValues, Brand, Category, Collection, Customization, OnlineShop, Product, ProductAdd, ProductStatus, ProductWithAdmin, Store, SubCategory, Supplier } from "@repo/core/models";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { Badge, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "~/components/ui";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { addProductAction, generateProductDescriptionAction } from "@repo/actions/products";
import { useToast } from "~/hooks/use-toast";
import Link from "next/link";
import { ProductStateBadges } from "../state";
import Description from "../edit/[id]/description";
import Stores from "../edit/[id]/stores";
import Collections from "../edit/[id]/collections";
import { useRouter, useSearchParams } from "next/navigation"; 
import ModelCard from "./modele";
import CustomizationLine from "../edit/[id]/customization";
import { SearchableProductsTable } from "./product-searchbar";

const SUPPORTED_FORMATS = [ "image/jpeg", "image/png", "image/webp", ];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 

const onlineShopsList = [{value: OnlineShop.NATAQUASHOP, key: "Nataquashop" }
    ,{ value: OnlineShop.CRAZYSWIM, key: "Crazy Swim" }
    ,{ value: OnlineShop.SWIMWEAR_DESTOCK, key: "Swimwear Destock" }
]


export default function Add({ categories, subCategories, brands, stores, collections, suppliers, aiThreadId, allAttributesWithValues }: 
    { categories: Category[], subCategories: SubCategory[], brands: Brand[], stores: Store[],
      collections: Collection[], suppliers: Supplier[], aiThreadId: string, allAttributesWithValues: AttributWithValues[]}) 
{
    const searchParams = useSearchParams();
    const isPackage = searchParams.get("isPackage") === "true"; 
    const { toast } = useToast();
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [onlineShops, setOnlineShops] = useState<OnlineShop[]>([]);
    const [productAdd, setProductAdd] = useState<ProductAdd>({
        manufacturerReference: "",
        supplierReference: "",
        buyPriceWithoutVat: 0,
        barCode: "",
        categoryId: 1,
        subCategoryId: 1,
        brandId: 1,
        isPackage: isPackage,
        price: 0,
        vatRate: 20,
        productAttributes: [],
        onlineShops: [OnlineShop.NATAQUASHOP],
        stores: [],
        collections: [],
        minStock: 0,
        weight: 0,
        isGiftCard: false,
        giftCardDuration: 0,
        descriptions: [{
            title: "Nouveau produit",
            lang: "fr",
            description: "",
        }, {
            title: "New product",
            lang: "en",
            description: "",
        }],
        supplierId: 1,
        customizations: [],
        customizable: false,
        images: [],
        pack: []
    });
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [images, setImages] = useState<{ url: string; attribute?: any; file?: File }[]>([]);
    const description = productAdd.descriptions.find((description) => description.lang === "fr");
    const router = useRouter();
    const [savedProduct, setSavedProduct] = useState<ProductWithAdmin | null>(null);

    if(collections.length === 0) {
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la récupération des collections, veuillez réessayer plus tard",
            variant: "destructive",
        });
    }

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddClick = () => fileInputRef.current?.click();

    const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!SUPPORTED_FORMATS.includes(file.type)) {
            toast({ title: "Erreur", description: "Format non supporté, utilisez .jpg, .png ou .webp" });
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            toast({ title: "Erreur", description: "Image trop volumineux, max 5MB autorisé" });
            return;
        }

        const previewImage = { url: URL.createObjectURL(file), file };

        //add to preview
        setImages(prev => [...prev, previewImage]);

        //add to productAdd for backend update
        setProductAdd(prev => ({
            ...prev,
            images: [
                ...(prev.images || []),
                { file, url: '', attributeValueId: undefined, productId: 0 }
            ]
        }));
    };

    const handleImageAttributeChange = (imageIndex: number, attributeValueId: number, attributeName: string) => {
        setProductAdd(prev => {
            const updatedImages = [...(prev.images || [])];
            const currentImage = updatedImages[imageIndex];
            if (currentImage) {
                updatedImages[imageIndex] = {
                    ...currentImage,
                    attributeValueId  
                };
            }
            return { ...prev, images: updatedImages };
        });

        setImages(prev => {
            const updated = [...prev];
            if (updated[imageIndex]) {
                updated[imageIndex] = { ...updated[imageIndex], attribute: { id: attributeValueId, name: attributeName } };
            }
            return updated;
        });
    };

    const handleAddProduct = async () => {
        try {
            const addedProduct = await addProductAction(productAdd);
            toast({ title: "Succès", description: "Produit ajouté avec succès !"});
            const productId = Number(addedProduct.item.id);
            if (isNaN(productId)) {
                toast({ title: "Erreur", description: "ID produit invalide" });
                return;
            }
            router.push(`/products/edit/${productId}`);

        } catch (error) {
            toast({ title: "Erreur", description: "Erreur lors de l'enregistrement"});
        }
    };

    const totalUnitPriceHT = (selectedProducts.reduce((sum, p) => sum + (p.price || 0), 0) * 100 ) / 100;

    return (
        <div className="container">
            <div className="flex gap-2 justify-start items-center mb-8">
                <Link href="/products">
                    <Button className="text-gray-700" variant="secondary" size="icon"><ArrowLeft /> </Button>
                </Link>
                <Heading heading={"2"} className="text-gray-700 m-0">{description?.title || "Nouveau produit"}</Heading>    
                <div className="ml-auto flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => router.push("/products")}>
                        Annuler
                    </Button>
                    <Button variant="default" size="lg" onClick={handleAddProduct}>
                        Enregistrer
                    </Button>
                </div>  
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center gap-2 justify-between">
                            <Heading heading="3" className="text-gray-700 font-bold">Général</Heading>
                            <div className=" py-2 font-normal flex items-center justify-between px-3 overflow-hidden border-none shadow-none">
                                {ProductStateBadges[ProductStatus.DRAFT]}
                            </div>

                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {productAdd.descriptions.map((d) => (
                        <Description key={d.lang} {...d} pending={isGeneratingDescription}
                            onChange={(updated) => {
                                setProductAdd({
                                    ...productAdd,
                                    descriptions: productAdd.descriptions.map((desc) =>
                                    desc.lang === updated.lang ? updated : desc
                                    ),
                            });
                            }}
                        />
                        ))}
                        <Button
                        variant="outline"
                        disabled={!savedProduct || isGeneratingDescription}
                        onClick={async () => {
                            if (!savedProduct) return; 
                            setIsGeneratingDescription(true);
                            try {
                            const desc = await generateProductDescriptionAction(aiThreadId, savedProduct); 
                            if (desc) {
                                setProductAdd({
                                ...productAdd,
                                descriptions: desc.map((d, index) => ({
                                    title: productAdd.descriptions[index]?.title ?? "",
                                    description: d.content,
                                    lang: d.lang,
                                })),
                                });
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
                        }}
                        >
                        {isGeneratingDescription ? (
                            <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Génération de la description en cours...
                            </div>
                        ) : "Générer une description"}
                        </Button>

                    </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle><Heading heading="3" className="text-gray-700 font-bold">Photos du produit</Heading></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-5 gap-4">
                    {images.map((image, index) => {
                        const couleurAttr = productAdd.productAttributes.find(
                        (attr) => attr.name.toLowerCase() === "couleur"
                        );

                        return (
                        <div key={index} className="relative aspect-square border-dashed rounded-md border-2 border-gray-200 flex items-center justify-center" >
                            <Image src={image.url} alt={`product-photo-${index}`} width={100} height={100} className="w-full h-full object-contain" />

                            <div className="absolute top-1 right-1 flex gap-2">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                setImages((prev) => prev.filter((_, i) => i !== index))
                                }
                            >
                                &times;
                            </Button>
                            </div>

                            <div className="absolute top-1 left-1">
                            {couleurAttr && couleurAttr.values.length > 0 ? (
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Badge variant="blue" className="text-xs cursor-pointer flex items-center justify-between gap-1 px-2 py-0 w-full h-[30px] text-center" >
                                    {image.attribute?.name ?? "Couleur"}
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                    </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="flex flex-col gap-1 p-2">
                                    {couleurAttr.values.map((val) => (
                                        <DropdownMenuCheckboxItem
                                            key={val.id}
                                            checked={image.attribute?.id === val.id}
                                            onClick={() => handleImageAttributeChange(index, val.id, val.name)}
                                            className="p-0"
                                        >
                                            <Badge
                                                variant="blue"
                                                className={`w-full text-center text-xs ${image.attribute?.id === val.id ? "ring-2 ring-offset-1 ring-red-400" : ""}`}
                                            >
                                                {val.name}
                                            </Badge>
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Badge variant="blue" className="text-xs w-full text-center flex items-center justify-center" >
                                    Sans couleur
                                </Badge>
                            )}
                            </div>


                        </div>
                        );
                    })}

                    <div
                        className="bg-gray-100 py-4 rounded-md border text-center text-gray-400 flex flex-col items-center justify-center cursor-pointer"
                        onClick={handleAddClick}
                    >
                        <b>Ajouter une image</b>
                        <p className="text-sm text-gray-400">
                        Accepte uniquement les .jpg, .png, .webp (5MB)
                        </p>
                        <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={SUPPORTED_FORMATS.join(",")}
                        onChange={handleImageAdd}
                        />
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
                            <Select defaultValue={productAdd.categoryId.toString()} onValueChange={(value) => setProductAdd({...productAdd, categoryId: parseInt(value)})}>
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
                            <Select defaultValue={productAdd.subCategoryId.toString()} onValueChange={(value) => setProductAdd({...productAdd, subCategoryId: parseInt(value)})}>
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
                            <Select defaultValue={productAdd.brandId.toString()} onValueChange={(value) => setProductAdd({...productAdd, brandId: parseInt(value)})}>
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
                            <Stores stores={stores} productStores={[]} onChange={(ids) => setProductAdd({...productAdd, stores: ids})} />

                        </div>
                        <div>
                            <Label htmlFor="collection">Collection</Label>
                            <Collections collections={collections} productCollections={[]} onChange={(ids) => setProductAdd({ ...productAdd, collections: ids })} />
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
                            <Input id="price-ht" type="number" placeholder="0.00" value={isPackage ? totalUnitPriceHT : productAdd.price}
                            disabled={isPackage} onBlur={(e) => !isPackage && setProductAdd({ ...productAdd, price: parseFloat(e.target.value) })}
                        />
                        </div>

                        <div>
                        <Label htmlFor="pma-ht">PMA (HT)</Label>
                            <Input id="pma-ht" type="number" placeholder="15.50" value={productAdd.buyPriceWithoutVat}
                            disabled={isPackage} onBlur={(e) => !isPackage && setProductAdd({ ...productAdd, buyPriceWithoutVat: parseFloat(e.target.value) })} />
                        </div>
                        <div>
                            <Label htmlFor="tva">TVA</Label>
                            <Select defaultValue={productAdd.vatRate.toString()} onValueChange={(value) => setProductAdd({...productAdd, vatRate: parseFloat(value)})}>
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
                                <Select defaultValue={productAdd.supplierId.toString()} onValueChange={(value) => setProductAdd({...productAdd, supplierId: parseInt(value)})}>
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
                                <Input id="supplier-code" placeholder="7232308" defaultValue={productAdd.manufacturerReference}
                                onBlur={(e) => setProductAdd({...productAdd, manufacturerReference: e.target.value})}/>
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="min-stock">Stock minimum</Label>
                                <Input id="min-stock" type="number" placeholder="10" defaultValue={productAdd.minStock}
                                onBlur={(e) => setProductAdd({...productAdd, minStock: parseInt(e.target.value)})}/>
                            </div>
                            <div>
                                <Label htmlFor="weight">Poids (en grammes)</Label>
                                <Input id="weight" type="number" placeholder="1000.00" defaultValue={productAdd.weight}
                                onBlur={(e) => setProductAdd({...productAdd, weight: parseFloat(e.target.value)})}/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {!isPackage && (
                    <ModelCard allAttributes={allAttributesWithValues} productAttributes={productAdd.productAttributes ?? []} onChange={(savedAttrs) => setProductAdd({ ...productAdd, productAttributes: savedAttrs })} />
                )}

                {isPackage && (
                <SearchableProductsTable
                    selectedProducts={selectedProducts}
                    onSelectedProductsChange={(products) => {
                        setSelectedProducts(products);

                        setProductAdd((prev) => ({
                            ...prev,
                            pack: products.map((p) => p.id),
                        }));
                    }}
                />
                )}       
            </div>
        </div>
    )
}