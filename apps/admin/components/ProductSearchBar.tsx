'use client'

import { defaultCheckout } from "@repo/actions/orders";
import { getAllProductModelsAction, getAllProductModels2Action } from "@repo/actions/product-models";
import { CreateCheckoutRequest, DiscountType, ModelWithProduct } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { useEffect, useRef, useState, useCallback } from "react";
import { BarcodeReader } from "~/components/BarcodeReader";
import { Badge, Input } from "~/components/ui";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Spinner } from "~/components/Spinner";
import noPicture from '~/public/no-picture.jpg';

export interface ProductSearchBarProps {
    purpose: 'checkout' | 'sales-point' | 'purchase-order'
    checkoutToCreate?: CreateCheckoutRequest
    onCheckoutToCreateChange?: (checkoutToCreate: CreateCheckoutRequest) => void
    initialProducts?: ReturnAll<ModelWithProduct>
    isEditable: boolean,
    models?: ModelWithProduct[]
    onModelSelected?: (model: ModelWithProduct) => void
    brandId?: number
    pending?: boolean
}

export const ProductSearchBar: React.FunctionComponent<ProductSearchBarProps> = ({checkoutToCreate: initialCheckoutToCreate, onCheckoutToCreateChange, initialProducts, isEditable, models: initialModels, purpose, brandId, onModelSelected, pending}) => {
    const [checkoutToCreate, setCheckoutToCreate] = useState<CreateCheckoutRequest | undefined>(initialCheckoutToCreate ?? defaultCheckout);
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [models, setModels] = useState<ModelWithProduct[]>(initialModels ? initialModels : initialProducts ? initialProducts.items : []);
    const shouldMaintainFocusRef = useRef(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        setCheckoutToCreate(initialCheckoutToCreate);
    }, [initialCheckoutToCreate]);

    useEffect(() => {
        if(purpose === 'purchase-order' && brandId) {
            setModels(initialProducts?.items ?? []);
        } else {
            setModels(initialModels ?? initialProducts?.items ?? []);
        }
    }, [initialProducts, initialModels, brandId, purpose]);

    // Restaurer le focus après les re-renders si nécessaire
    useEffect(() => {
        if (shouldMaintainFocusRef.current && inputRef.current && isOpen) {
            const input = inputRef.current;
            // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
            requestAnimationFrame(() => {
                if (input && document.activeElement !== input) {
                    input.focus();
                    // Préserver la position du curseur
                    const cursorPosition = searchValue.length;
                    input.setSelectionRange(cursorPosition, cursorPosition);
                }
            });
            shouldMaintainFocusRef.current = false;
        }
    }, [models, isOpen, searchValue]);

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (open && inputRef.current) {
            shouldMaintainFocusRef.current = true;
            // Réduire le délai pour une meilleure réactivité
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 50);
        }
    }, []);

    const handleFocus = useCallback(() => {
        setIsOpen(true);
        shouldMaintainFocusRef.current = true;
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }, 50);
    }, []);

    const searchProducts = useCallback(async (searchRequest: string) => { 
        setIsSearching(true);
        try {
            let models: ReturnAll<ModelWithProduct>;
            if(purpose === 'purchase-order') {
                models = await getAllProductModels2Action({
                    options: {sort: 'asc', search: searchRequest},
                    modelIds: [],
                    brandId: brandId
                });
            } else {
                models = await getAllProductModelsAction({sort: 'asc', search: searchRequest});
            }
            shouldMaintainFocusRef.current = true;
            setModels(models.items);
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            setModels([]);
        } finally {
            setIsSearching(false);
        }
    }, [purpose, brandId]);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearchProductInputChange = useCallback(async (e : React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if(value) {
            setIsOpen(true);
            shouldMaintainFocusRef.current = true;
            searchTimeoutRef.current = setTimeout(async () => {
                await searchProducts(value);
            }, 500);
        } else {
            shouldMaintainFocusRef.current = true;
            setModels(initialProducts?.items ?? []);
        }
    }, [searchProducts, initialProducts]);

    return <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
            <div className="w-full relative">
                <Input 
                    ref={inputRef}
                    autoFocus
                    id="name" 
                    disabled={!isEditable} 
                    placeholder="Rechercher des produits..." 
                    className="w-full pr-10" // add right padding for the icon
                    value={searchValue}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                        handleSearchProductInputChange(e);
                    }}
                    onFocus={handleFocus}
                    onBlur={(e) => {
                        // Ne pas fermer le popover si on clique dans le contenu
                        if (!e.relatedTarget?.closest('[role="dialog"]') && !e.relatedTarget?.closest('[data-radix-popper-content-wrapper]')) {
                            setIsOpen(false);
                        }
                    }}
                />
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    <BarcodeReader 
                        tooltip 
                        icon 
                        onBarcode={(barcode) => {
                            setSearchValue(barcode);
                            shouldMaintainFocusRef.current = true;
                            handleSearchProductInputChange({target: {value: barcode}} as React.ChangeEvent<HTMLInputElement>);
                        }}
                    />
                </div>
            </div>
        </PopoverTrigger>
        <PopoverContent 
            className="w-[--radix-popover-trigger-width] p-4" 
            align="start" 
            sideOffset={5}
            style={{ maxHeight: '300px', overflow: 'auto' }}
            onOpenAutoFocus={(e) => {
                // Empêcher l'auto-focus du popover de voler le focus de l'input
                e.preventDefault();
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }}
        >
            {pending || isSearching ? (
                <div className="flex justify-center items-center py-4">
                    <div className="flex flex-col items-center gap-2">
                        <Spinner variant="circle" size={20} />
                        <p className="text-sm text-gray-500">Recherche en cours...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 w-full">
                    {models && models.length > 0 ? (
                        models.map((model: ModelWithProduct, index: number) => {
                            return <div key={`${model.id}-${index}`} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded w-full" onClick={(e) => {                        
                                e.stopPropagation();
                                console.log("id: ", model.id, " => ", model.product.descriptions?.[0]?.title);
                                if(purpose === 'checkout') {
                                    let p_checkoutToCreate: CreateCheckoutRequest = defaultCheckout;
                                    if(checkoutToCreate) {
                                        // check if selected product is already in the checkout
                                        const isProductAlreadyInCheckout = checkoutToCreate.lines?.some((line) => line.idModel === model.id);                                        
                                        if(isProductAlreadyInCheckout) {
                                            p_checkoutToCreate = {
                                                ...checkoutToCreate,
                                                lines: checkoutToCreate.lines?.map((line) => line.idModel === model.id ? {
                                                    ...line,
                                                    quantity: line.quantity + 1
                                                } : line)                                                        
                                            }                                                    
                                        } else { // add the product to the checkout                                            
                                            p_checkoutToCreate = {
                                                ...checkoutToCreate,
                                                lines: [
                                                    ...checkoutToCreate.lines ?? [],
                                                    {
                                                        idModel: model.id,
                                                        name: model.product.descriptions?.[0]?.title ?? 'Product',
                                                        codeBar: '1234567890',
                                                        price: model.priceWithoutVat > 0 ? model.priceWithoutVat : model.product.price,
                                                        quantity: 1,
                                                        discount: '0',
                                                        VAT: model.product.vatRate,
                                                        comment: '',
                                                        discountType: DiscountType.PERCENTAGE,
                                                        modelProduct: {
                                                            name: model.product.descriptions?.[0]?.title ?? 'Product',
                                                            attributs: model.attributValues?.map((attribut) => attribut.attributValue.nom) ?? [],
                                                            image: model.product.images?.[0]?.url ?? noPicture.src,
                                                            price: model.priceWithoutVat > 0 ? model.priceWithoutVat : model.product.price,
                                                        }
                                                    }
                                                ],                                                        
                                            }                                                                                                
                                        }
                                        p_checkoutToCreate.totalTTC = (p_checkoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity + line.price * line.quantity * line.VAT / 100, 0) ?? 0).toString();
                                        p_checkoutToCreate.totalHT = (p_checkoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0).toString();
                                        setCheckoutToCreate(p_checkoutToCreate);
                                        onCheckoutToCreateChange?.(p_checkoutToCreate);
                                        setIsOpen(false);
                                        setSearchValue('');
                                    } else {
                                        setCheckoutToCreate(defaultCheckout);
                                        onCheckoutToCreateChange?.(defaultCheckout);
                                    }
                                } else if(purpose === 'sales-point' || purpose === 'purchase-order') {
                                    onModelSelected?.(model);
                                    setIsOpen(false);
                                    setSearchValue('');
                                }
                            }}>
                                <img 
                                    src={model.product.images?.find(img =>
                                        model.attributValues?.some(av => av.idAttributValue === img.attributeValueId)
                                        )?.url ?? model.product.images?.length > 0 ? model.product.images[0]?.url : noPicture.src} 
                                    alt={model.product.descriptions?.[0]?.title ?? 'Product'} 
                                    className="w-10 h-10 object-cover rounded"
                                />
                                <div className="flex flex-col gap-1">
                                    <p className="font-medium">{model.product.descriptions?.[0]?.title}</p>
                                    <div className="flex flex-row gap-1">
                                        {model.attributValues?.map((attribut, attrIndex) => (
                                            <Badge key={`${attribut.attributValue.id}-${attrIndex}`} variant="blue" size="sm">{attribut.attributValue.nom}</Badge>
                                        ))}
                                        <Badge variant={model.published ? 'green' : 'red'} size="sm">{model.published ? 'Publié' : 'Non publié'}</Badge>
                                        <Badge variant={model.stock && model.stock.disponible > 0 ? 'green' : 'red'} size="sm">{model.stock && model.stock.disponible > 0 ? 'En stock' : 'Stock épuisé'}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">{model.priceWithoutVat > 0 ? model.priceWithoutVat : model.product.price} €</p>
                                </div>
                            </div>
                    })
                    ) : searchValue ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 font-medium mb-1">Aucun produit trouvé</p>
                            <p className="text-sm text-gray-500">Essayez avec d'autres termes de recherche</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 font-medium mb-1">Recherchez un produit</p>
                            <p className="text-sm text-gray-500">Tapez le nom ou scannez un code-barres</p>
                        </div>
                    )}
                </div>
            )}
        </PopoverContent>
    </Popover>
}