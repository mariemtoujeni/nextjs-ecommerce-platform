'use client'

import { getSuppliersAction } from "@repo/actions/supplier";
import { createSupplierAction } from "@repo/actions/supplier";
import { ModelWithProduct, PaymentMode, PurchaseOrderLine, PurchaseOrderPresenter, 
    PurchaseOrderPresenterInput, PurchaseOrderStatus, Supplier, ShippingType, 
    ShippingDataForSupplierPresenter,
    SupplierInput} from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { ChevronsUpDown, Trash2, Calendar as CalendarIcon, CirclePlus } from "lucide-react";
import { useRef, useState, startTransition, useActionState, useEffect, useLayoutEffect } from "react";
import { ModelCell } from "~/components/ModelCell";
import { ProductSearchBar } from "~/components/ProductSearchBar";
import { Card, CardTitle, CardHeader, Heading, CardContent, Label, Button, Input, Select, 
    SelectTrigger, SelectValue, SelectContent, SelectItem, 
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter} from "~/components/ui";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "~/components/ui/command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Spinner } from "~/components/Spinner";
import noPicture from '~/public/no-picture.jpg';
import { getAllProductModels2Action } from "@repo/actions/product-models";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Textarea } from "~/components/ui/textarea";
import dynamic from "next/dynamic";
import { useToast } from "~/hooks/use-toast";

// Fonction utilitaire pour valider et convertir les types de livraison
const parseShippingType = (value: string): ShippingType => {
    const validTypes = Object.values(ShippingType);
    return validTypes.includes(value as ShippingType) ? (value as ShippingType) : ShippingType.EMPTY;
};

// Composant Calendar chargé dynamiquement pour éviter les problèmes d'hydratation
const DynamicCalendar = dynamic(() => import("~/components/ui/calendar").then(mod => ({ default: mod.Calendar })), {
    ssr: false,
    loading: () => <div className="w-full h-10 bg-gray-100 animate-pulse rounded" />
});

// Composant Popover chargé dynamiquement pour éviter les problèmes d'hydratation
const DynamicPopover = dynamic(() => import("~/components/ui/popover").then(mod => ({ 
    default: ({ children, ...props }: any) => (
        <mod.Popover {...props}>
            {children}
        </mod.Popover>
    )
})), {
    ssr: false,
    loading: () => <div className="w-full h-10 bg-gray-100 animate-pulse rounded" />
});

const DynamicPopoverTrigger = dynamic(() => import("~/components/ui/popover").then(mod => ({ 
    default: mod.PopoverTrigger 
})), {
    ssr: false
});

const DynamicPopoverContent = dynamic(() => import("~/components/ui/popover").then(mod => ({ 
    default: mod.PopoverContent 
})), {
    ssr: false
});

export interface PurchaseOrderDetailViewProps {
    stateMainComponent: 'new' | 'detail'
    purchaseOrder?: PurchaseOrderPresenter
    suppliers?: ReturnAll<Supplier>
    products?: ReturnAll<ModelWithProduct>
    onPurchaseOrderChange?: (purchaseOrder: PurchaseOrderPresenterInput) => void
}

export const PurchaseOrderDetailView: React.FunctionComponent<PurchaseOrderDetailViewProps> = ({purchaseOrder : initialPurchaseOrder, suppliers, products, stateMainComponent, onPurchaseOrderChange}) => {
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const savePurchaseOrderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();
    
    const unitHtPriceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const quantityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const vatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const latestPurchaseOrderRef = useRef<PurchaseOrderPresenter | undefined>(initialPurchaseOrder);
    const [openClientPopover, setOpenClientPopover] = useState<boolean>(false);
    const [isEditable, setIsEditable] = useState<boolean>(PurchaseOrderStatus.BROUILLON === initialPurchaseOrder?.status);
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderPresenter | undefined>(initialPurchaseOrder);    
    const [supplierToCreate, setSupplierToCreate] = useState<SupplierInput>({ name: '' });
    const [createSupplierPending, setCreateSupplierPending] = useState<boolean>(false);
    const [openCreateSupplierDialog, setOpenCreateSupplierDialog] = useState<boolean>(false);
    
    const [productsToDisplay, fetchProducts, productsPending] = useActionState(
        (state: ReturnAll<ModelWithProduct>, payload: { search: string; limit: number; offset: number; sort: "asc" | "desc" }) => getAllProductModels2Action({
            options: {sort: payload.sort},
            modelIds: [],
            brandId: purchaseOrder?.supplier?.id ?? undefined,
            flag: 'purchase-order'
        }),
        products ?? { items: [], total: 0, count: 0 }
    );
    
    // État de pending pour la recherche de fournisseurs
    const [suppliersToDisplay, fetchSuppliers, suppliersPending] = useActionState(
        (state: ReturnAll<Supplier>, payload: { search: string; limit: number; offset: number; sort: "asc" | "desc" }) => getSuppliersAction(payload),
        suppliers ?? { items: [], total: 0, count: 0 }
    );

    // État de pending pour la sauvegarde
    const [savePending, setSavePending] = useState<boolean>(false);

    // Déclencher une nouvelle recherche de produits quand le fournisseur change
    useEffect(() => {
        if (purchaseOrder?.supplier?.id) {
            startTransition(() => {
                fetchProducts({
                    search: '',
                    limit: 10,
                    offset: 0,
                    sort: 'asc'
                });
            });

        }
    }, [purchaseOrder?.supplier?.id, fetchProducts]);

    const handleSupplierSearch = async (value: string) => {
        if(searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(async () => {
            if(value.length > 0) {
                startTransition(() => {
                    fetchSuppliers({
                        search: value,
                        limit: 10,
                        offset: 0,
                        sort: 'asc'
                    });
                });
            } else {
                startTransition(() => {
                    fetchSuppliers({
                        search: '',
                        limit: 10,
                        offset: 0,
                        sort: 'asc'
                    });
                });
            }
        }, 500);
    }

    const handleSavePurchaseOrderChange = () => {
        if(savePurchaseOrderTimeoutRef.current) {
            clearTimeout(savePurchaseOrderTimeoutRef.current);
        }
        setSavePending(true);
        
        savePurchaseOrderTimeoutRef.current = setTimeout(() => {
            onPurchaseOrderChange?.({
                ...latestPurchaseOrderRef.current,
                supplierId: latestPurchaseOrderRef.current?.supplier?.id ?? 0,
                paymentMode: latestPurchaseOrderRef.current?.paymentMode ?? PaymentMode.CHEQUE,
                status: latestPurchaseOrderRef.current?.status ?? PurchaseOrderStatus.BROUILLON,
                createdAt: latestPurchaseOrderRef.current?.createdAt ?? new Date(),
                clubId: latestPurchaseOrderRef.current?.clubId,
                orderDate: latestPurchaseOrderRef.current?.orderDate,
                deliveryDate: latestPurchaseOrderRef.current?.deliveryDate,
                totalHT: latestPurchaseOrderRef.current?.lines ? latestPurchaseOrderRef.current.lines.reduce((acc, line) => acc + line.quantity * line.unitHtPrice, 0) : 0,
                lines: latestPurchaseOrderRef.current?.lines ?? [],
                expeditions: latestPurchaseOrderRef.current?.expeditions ?? undefined
            });
            setSavePending(false);
        }, 1000);
    }

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return format(dateObj, 'dd/MM/yyyy', { locale: fr });
    };

    return <div className="flex flex-col gap-7 w-full">
        <Card className="mt-8 w-full">
            <CardContent>
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-4 border-b">
                        <div className="flex flex-col gap-2 border-r px-5 py-8">
                            <div className="flex flex-row justify-between">
                                <Label>Fournisseur</Label>
                                <Dialog open={openCreateSupplierDialog} onOpenChange={setOpenCreateSupplierDialog}>
                                    <DialogTrigger asChild>
                                        <div className="flex flex-row gap-2 items-center cursor-pointer" onClick={() => {
                                            setOpenClientPopover(true);
                                        }}>
                                            <CirclePlus className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm text-blue-500 text-nowrap font-bold">Ajouter un fournisseur</span>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogTitle>
                                            Créer un fournisseur
                                        </DialogTitle>
                                        <DialogDescription>
                                            <span className="text-xs text-gray-500">Pour ajouter des produits au fournisseur, vous devez utiliser la page "Catalogue".</span>
                                        </DialogDescription>
                                        <div className="flex flex-col gap-4 py-8">
                                            <div className="flex flex-col gap-2">
                                                <Label>Entreprise <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    type="text" 
                                                    placeholder="Nom de l'entreprise" 
                                                     value={supplierToCreate.name} 
                                                     onChange={(e) => setSupplierToCreate({...supplierToCreate, name: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label>Pays / région</Label>
                                                <Select 
                                                     value={supplierToCreate.country ?? ''} 
                                                     onValueChange={(value) => setSupplierToCreate({...supplierToCreate, country: value})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner un pays" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="France">France</SelectItem>
                                                        <SelectItem value="Allemagne">Allemagne</SelectItem>
                                                        <SelectItem value="Belgique">Belgique</SelectItem>
                                                        <SelectItem value="Italie">Italie</SelectItem>
                                                        <SelectItem value="Australie">Australie</SelectItem>
                                                        <SelectItem value="Canada">Canada</SelectItem>
                                                        <SelectItem value="États-Unis">États-Unis</SelectItem>
                                                        <SelectItem value="Espagne">Espagne</SelectItem>
                                                        <SelectItem value="Suisse">Suisse</SelectItem>
                                                        <SelectItem value="Royaume-Uni">Royaume-Uni</SelectItem>
                                                        <SelectItem value="Irlande">Irlande</SelectItem>
                                                        <SelectItem value="Pays-Bas">Pays-Bas</SelectItem>
                                                        <SelectItem value="Autriche">Autriche</SelectItem>
                                                        <SelectItem value="Grèce">Grèce</SelectItem>
                                                        <SelectItem value="Portugal">Portugal</SelectItem>
                                                        <SelectItem value="Irlande">Irlande</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label>Adresse</Label>
                                                 <Input 
                                                     type="text" 
                                                     placeholder="Adresse" 
                                                     value={supplierToCreate.address ?? ''} 
                                                     onChange={(e) => setSupplierToCreate({...supplierToCreate, address: e.target.value})} 
                                                 />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">                                                
                                                <div className="flex flex-col gap-2">
                                                    <Label>Code postal</Label>
                                                     <Input 
                                                         type="text" 
                                                         placeholder="Code postal" 
                                                         value={supplierToCreate.zipCode ?? ''} 
                                                         onChange={(e) => setSupplierToCreate({...supplierToCreate, zipCode: e.target.value})} 
                                                     />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Label>Ville</Label>
                                                     <Input 
                                                         type="text" 
                                                         placeholder="Ville" 
                                                         value={supplierToCreate.city ?? ''} 
                                                         onChange={(e) => setSupplierToCreate({...supplierToCreate, city: e.target.value})} 
                                                     />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <Label>Téléphone</Label>
                                                     <Input 
                                                         type="text" 
                                                         placeholder="Téléphone" 
                                                         value={supplierToCreate.phone ?? ''} 
                                                         onChange={(e) => setSupplierToCreate({...supplierToCreate, phone: e.target.value})} 
                                                     />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Label>Adresse email</Label>
                                                     <Input 
                                                         type="email" 
                                                         placeholder="Adresse email" 
                                                         value={supplierToCreate.email ?? ''} 
                                                         onChange={(e) => setSupplierToCreate({...supplierToCreate, email: e.target.value})} 
                                                     />
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setOpenCreateSupplierDialog(false)}>
                                                Annuler
                                            </Button>
                                            <Button variant="default" disabled={createSupplierPending} onClick={async () => {
                                                setCreateSupplierPending(true);
                                                 if(!supplierToCreate.name) {
                                                     toast({
                                                         title: "Erreur lors de la création du fournisseur",
                                                         description: "Le nom de l'entreprise est obligatoire",
                                                         variant: "destructive",
                                                     });
                                                     setCreateSupplierPending(false);
                                                     return;
                                                 }

                                                const result = await createSupplierAction(supplierToCreate);
                                                if(result.error) {
                                                    toast({
                                                        title: "Erreur lors de la création du fournisseur",
                                                        description: "Une erreur est survenue lors de la création du fournisseur: " + result.error,
                                                        variant: "destructive",
                                                    });
                                                } else {
                                                    toast({
                                                        title: "Fournisseur créé avec succès",
                                                        description: "Le fournisseur a été créé avec succès",
                                                        variant: "default",
                                                    });
                                                     setSupplierToCreate({ name: '' });
                                                    setOpenCreateSupplierDialog(false);
                                                }
                                                setCreateSupplierPending(false);
                                            }}>
                                                {createSupplierPending ? 'Création...' : 'Créer'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            {
                                stateMainComponent === 'new' ? (
                                    <DynamicPopover open={openClientPopover} onOpenChange={setOpenClientPopover}>
                                        <DynamicPopoverTrigger asChild>   
                                            <Button 
                                                variant="outline" 
                                                role="combobox"
                                                aria-expanded={openClientPopover ? true : false}
                                                className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500"
                                            >
                                                {purchaseOrder?.supplier?.name ?? ''}
                                                {suppliersPending ? (
                                                    <Spinner variant="circle" size={16} />
                                                ) : (
                                                    <ChevronsUpDown className="opacity-50" />
                                                )}
                                            </Button>
                                        </DynamicPopoverTrigger>
                                        <DynamicPopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[200px] overflow-y-auto">
                                            <Command className="w-full">
                                                <CommandInput 
                                                    placeholder="Rechercher un fournisseur..." 
                                                    className="h-9" 
                                                    onValueChange={async (value) => {
                                                        await handleSupplierSearch(value);
                                                    }}
                                                />
                                                {suppliersPending ? (
                                                    <div className="flex justify-center items-center py-4">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Spinner variant="circle" size={20} />
                                                            <p className="text-sm text-gray-500">Recherche en cours...</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <CommandEmpty>Aucun fournisseur trouvé</CommandEmpty>
                                                        <CommandGroup>
                                                            {
                                                                suppliersToDisplay.items.map((supplier) => (
                                                                    <CommandItem
                                                                        key={supplier.id}
                                                                        onSelect={() => {
                                                                            setOpenClientPopover(false);
                                                                            if (purchaseOrder) {
                                                                                const updatedPurchaseOrder = {
                                                                                    ...purchaseOrder,
                                                                                    supplier: supplier,
                                                                                    supplierId: supplier.id,
                                                                                    lines: [] // reset les lignes
                                                                                };
                                                                                setPurchaseOrder(updatedPurchaseOrder);
                                                                                latestPurchaseOrderRef.current = updatedPurchaseOrder;
                                                                                handleSavePurchaseOrderChange();
                                                                            }
                                                                        }}
                                                                    >
                                                                        {supplier.name}
                                                                    </CommandItem>
                                                                ))
                                                            }
                                                        </CommandGroup>
                                                    </>
                                                )}
                                            </Command>                                
                                        </DynamicPopoverContent>
                                    </DynamicPopover>
                                ) : (
                                    <Input type="text" disabled={true} value={purchaseOrder?.supplier?.name ?? ''}/>
                                )
                            }                        
                        </div>
                        <div className="flex flex-col gap-2 px-5 py-8">
                            <Label>Destination</Label>
                            <Select value={purchaseOrder?.clubId ? 'Club' : 'Boutique'} disabled={!isEditable} onValueChange={(value) => {
                                if(purchaseOrder) {
                                    setPurchaseOrder({...purchaseOrder, clubId: value === 'Club' ? 1 : 0});
                                    latestPurchaseOrderRef.current = {...purchaseOrder, clubId: value === 'Club' ? 1 : 0};
                                    handleSavePurchaseOrderChange();
                                }
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une destination" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Boutique">Boutique</SelectItem>
                                    <SelectItem value="Club">Club</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2 px-5 py-5">
                            <Label>Mode de paiement</Label>
                            <Select value={purchaseOrder?.paymentMode as string ?? ''} disabled={!isEditable} onValueChange={(value) => {
                                if(purchaseOrder) {
                                    setPurchaseOrder({...purchaseOrder, paymentMode: value as PaymentMode});
                                    latestPurchaseOrderRef.current = {...purchaseOrder, paymentMode: value as PaymentMode};
                                    handleSavePurchaseOrderChange();
                                }
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Aucune" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CHEQUE">Chèque</SelectItem>
                                    <SelectItem value="VIREMENT">Virement</SelectItem>
                                    <SelectItem value="CARTE_BANCAIRE">Carte bancaire</SelectItem>
                                    <SelectItem value="PAYPAL">Paypal</SelectItem>
                                    <SelectItem value="ESPECE">Espèce</SelectItem>
                                    <SelectItem value="AUTRE">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2 px-5 py-5">
                            <Label>Modalités de paiement (Jours)</Label>
                            <Input type="number" min={0} placeholder="Modalités de paiement" value={purchaseOrder?.paymentDelay ?? 0} disabled={!isEditable} onChange={(e) => {
                                if(purchaseOrder) {
                                    setPurchaseOrder({...purchaseOrder, paymentDelay: parseInt(e.target.value)});
                                    latestPurchaseOrderRef.current = {...purchaseOrder, paymentDelay: parseInt(e.target.value)};
                                    handleSavePurchaseOrderChange();
                                }
                            }} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Information sur l'envoi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <Label>Arrivée prévue</Label>
                            <DynamicPopover>
                                <DynamicPopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start font-normal h-10 px-3 py-2 ${purchaseOrder?.deliveryDate ? 'text-black' : 'text-gray-500'}`}
                                        disabled={!isEditable}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {purchaseOrder?.deliveryDate ? formatDate(purchaseOrder.deliveryDate) : "JJ-MM-AAAA"}
                                    </Button>
                                </DynamicPopoverTrigger>
                                <DynamicPopoverContent className="w-auto p-0" align="start">
                                    <DynamicCalendar
                                        mode="single"
                                        selected={purchaseOrder?.deliveryDate ? (typeof purchaseOrder.deliveryDate === 'string' ? new Date(purchaseOrder.deliveryDate) : purchaseOrder.deliveryDate) : undefined}
                                        onSelect={(date) => {
                                            if (date && isEditable && purchaseOrder) {
                                                const updatedPurchaseOrder: PurchaseOrderPresenter = {
                                                    ...purchaseOrder, 
                                                    deliveryDate: date,
                                                    lines: purchaseOrder.lines.map((line) => ({...line, deliveryDate: date}))
                                                };
                                                setPurchaseOrder(updatedPurchaseOrder);
                                                latestPurchaseOrderRef.current = updatedPurchaseOrder;
                                                handleSavePurchaseOrderChange();
                                            }
                                        }}
                                        initialFocus
                                        locale={fr}
                                    />
                                </DynamicPopoverContent>
                            </DynamicPopover>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Service d'expédition</Label>
                            <Select value={purchaseOrder?.expeditions?.type ?? ''} disabled={!isEditable} onValueChange={(value) => {
                                if(purchaseOrder) {
                                    if(purchaseOrder.expeditions) {
                                        setPurchaseOrder({...purchaseOrder, expeditions: {...purchaseOrder.expeditions, type: parseShippingType(value)} as any});                                    
                                        latestPurchaseOrderRef.current = {...purchaseOrder, expeditions: {...purchaseOrder.expeditions, type: parseShippingType(value)} as any};
                                    } else {
                                        const newExpeditions: ShippingDataForSupplierPresenter = {
                                            purchaseOrderId: purchaseOrder.id,
                                            createdAt: new Date(),
                                            type: parseShippingType(value),
                                            lines: purchaseOrder.lines.map((line) => ({
                                                ...line,
                                                expeditionId: purchaseOrder.expeditions?.id ?? 0,
                                                checkoutQuantity: line.quantity
                                            }))
                                        };
                                        const updatedPurchaseOrder = {
                                            ...purchaseOrder, 
                                            expeditions: newExpeditions
                                        };
                                        setPurchaseOrder(updatedPurchaseOrder);
                                        latestPurchaseOrderRef.current = updatedPurchaseOrder;
                                    }
                                    handleSavePurchaseOrderChange();
                                }
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Colissimo">Colissimo</SelectItem>
                                    <SelectItem value="Chronopost">Chronopost</SelectItem>
                                    <SelectItem value="Mondial Relay">Mondial Relay</SelectItem>
                                    <SelectItem value="Exapaq">Exapaq</SelectItem>
                                    <SelectItem value="Ici Relais">Ici Relais</SelectItem>
                                    <SelectItem value="So Colissimo">So Colissimo</SelectItem>
                                    <SelectItem value="Lettre Max">Lettre Max</SelectItem>
                                    <SelectItem value="AccessF">AccessF</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Numéro de suivi</Label>
                            <Input type="text" placeholder="Numéro de suivi" value={purchaseOrder?.expeditions?.trackingNumber ?? ''} disabled={!isEditable} onChange={(e) => {
                                if(purchaseOrder) {
                                    if(purchaseOrder.expeditions) {
                                        const updatedExpeditions = {
                                            ...purchaseOrder.expeditions,
                                            trackingNumber: e.target.value
                                        };
                                        setPurchaseOrder({...purchaseOrder, expeditions: updatedExpeditions});
                                        latestPurchaseOrderRef.current = {...purchaseOrder, expeditions: updatedExpeditions};
                                    } else {
                                        setPurchaseOrder({...purchaseOrder, expeditions: {trackingNumber: e.target.value} as any});
                                        latestPurchaseOrderRef.current = {...purchaseOrder, expeditions: {trackingNumber: e.target.value} as any};
                                    }
                                    handleSavePurchaseOrderChange();
                                }
                            }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Détails supplémentaires</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Numéro de référence</Label>
                            <Input type="text" placeholder="Numéro de référence" disabled={true} value={purchaseOrder?.id ?? ''}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Commentaire</Label>
                            <Textarea placeholder="Commentaire" className="min-h-24" value={purchaseOrder?.comment ?? ''} onChange={(e) => {
                                if(purchaseOrder) {
                                    setPurchaseOrder({...purchaseOrder, comment: e.target.value});
                                    latestPurchaseOrderRef.current = {...purchaseOrder, comment: e.target.value};
                                    handleSavePurchaseOrderChange();
                                }
                            }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    <Heading heading="3" className="text-gray-700 font-bold">Ajouter des produits</Heading>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6 w-full">
                    <div className="w-full flex justify-between items-center">
                        <div className="flex-1 flex justify-end">
                            <span className="text-base text-gray-500 font-bold">
                                Total TTC : {
                                    purchaseOrder?.lines
                                        .reduce((acc, line) => acc + (line.quantity * line.unitHtPrice * (1 + line.vat / 100)), 0)
                                        .toFixed(2)
                                } €
                            </span>
                        </div>
                        {savePending && (
                            <div className="flex items-center gap-2">
                                <Spinner variant="circle" size={16} />
                                <span className="text-sm text-gray-500">Sauvegarde en cours...</span>
                            </div>
                        )}
                    </div>
                    <ProductSearchBar 
                        purpose="purchase-order"
                        brandId={purchaseOrder?.supplier?.id ?? undefined}
                        isEditable={isEditable} 
                        initialProducts={productsToDisplay}
                        pending={productsPending}
                        onModelSelected={(model : ModelWithProduct) => {
                            if (!purchaseOrder) return;                            
                            const newItemToAdd = {
                                id: purchaseOrder.lines.length > 0 ? Math.max(...purchaseOrder.lines.map((line) => line.id)) + 1 : 1,
                                orderSupplierId: purchaseOrder.id,
                                modelId: model.id,
                                modelProduct: {
                                    name: model.product.descriptions?.[0]?.title ?? 'Product',
                                    attributs: model.attributValues?.map((attribut) => attribut.attributValue.nom) ?? [],
                                    image: model.product.images?.[0]?.url ?? noPicture.src,
                                    price: model.priceWithVat > 0 ? model.priceWithVat.toFixed(2) as unknown as number : (model.product.price * (1 + (model.product.vatRate > 0 ? model.product.vatRate : 20) / 100)).toFixed(2) as unknown as number,
                                },
                                validationDate: new Date(),
                                quantity: 1,
                                receivedQuantity: 0,
                                unitHtPrice: model.priceWithoutVat > 0 ? model.priceWithoutVat : model.product.price,
                                discount: 0,
                                vat: model.product.vatRate > 0 ? model.product.vatRate : 20,
                                valid: false,
                                comment: '',
                                ttcPrice: model.priceWithVat > 0 ? model.priceWithVat.toFixed(2) as unknown as number : (model.product.price * (1 + (model.product.vatRate ?? 20) / 100)).toFixed(2) as unknown as number,
                            };                            
                            const newLines : PurchaseOrderLine[] = [
                                ...purchaseOrder.lines, 
                                newItemToAdd
                            ];

                            const updatedPurchaseOrder : PurchaseOrderPresenter = {
                                ...purchaseOrder,
                                lines: newLines,
                                expeditions: purchaseOrder.expeditions ? {
                                    ...purchaseOrder.expeditions,
                                    lines: [
                                        ...(purchaseOrder.expeditions.lines ?? []),
                                        {
                                            modelId: model.id,
                                            quantity: 0,
                                            checkoutQuantity: 1,
                                            expeditionId: purchaseOrder.expeditions.id ?? 0,
                                        }
                                    ],
                                } : undefined
                            };
                            setPurchaseOrder(updatedPurchaseOrder);
                            latestPurchaseOrderRef.current = updatedPurchaseOrder;
                            handleSavePurchaseOrderChange();
                        }}
                    />
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead className="w-[30%]">Produit</TableHead>
                                    <TableHead className="w-[20%]">Commande fournisseur</TableHead>
                                    <TableHead className="w-[10%]">Quantité</TableHead>
                                    <TableHead className="w-[10%]">Prix unitaire HT</TableHead>
                                    <TableHead className="w-[10%]">Taxe</TableHead>
                                    <TableHead className="w-[10%]">Total TTC</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    purchaseOrder?.lines.map((line) => {
                                        return (
                                            <TableRow key={line.modelId}>
                                                <TableCell>
                                                    <ModelCell
                                                        model={
                                                            line.modelProduct
                                                                ? line.modelProduct
                                                                : {
                                                                    name: '',
                                                                    attributs: [],
                                                                    price: 0,
                                                                    image: noPicture.src,
                                                                }
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-500">#{purchaseOrder.id}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Input type="number" min={0} value={line.quantity} disabled={!isEditable || savePending} onChange={(e) => {                                                    
                                                        const updatedPurchaseOrder = {
                                                            ...purchaseOrder,
                                                            lines: purchaseOrder?.lines.map((l) => l.modelId === line.modelId ? { ...l, quantity: parseInt(e.target.value) } : l) ?? []
                                                        };

                                                        if(purchaseOrder.expeditions) {
                                                            updatedPurchaseOrder.expeditions = {
                                                                ...purchaseOrder.expeditions,
                                                                lines: purchaseOrder.expeditions.lines.map((l) => l.modelId === line.modelId ? { ...l, checkoutQuantity: parseInt(e.target.value) } : l) ?? []
                                                            };
                                                        }

                                                        setPurchaseOrder(updatedPurchaseOrder);
                                                        latestPurchaseOrderRef.current = updatedPurchaseOrder;
                                                        if(quantityTimeoutRef.current) {
                                                            clearTimeout(quantityTimeoutRef.current);
                                                        }
                                                        quantityTimeoutRef.current = setTimeout(() => {
                                                            handleSavePurchaseOrderChange();
                                                        }, 1000);
                                                    }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Input type="number" min={0} value={line.unitHtPrice} disabled={!isEditable || savePending} onChange={(e) => {
                                                        const updatedPurchaseOrder = {
                                                            ...purchaseOrder,
                                                            lines: purchaseOrder?.lines.map((l) => l.modelId === line.modelId ? { ...l, unitHtPrice: parseFloat(e.target.value) } : l) ?? []
                                                        };
                                                        setPurchaseOrder(updatedPurchaseOrder);
                                                        latestPurchaseOrderRef.current = updatedPurchaseOrder;
                                                        if(unitHtPriceTimeoutRef.current) {
                                                            clearTimeout(unitHtPriceTimeoutRef.current);
                                                        }
                                                        unitHtPriceTimeoutRef.current = setTimeout(() => {
                                                            handleSavePurchaseOrderChange();
                                                        }, 1000);
                                                    }} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <Input type="number" min={0} value={line.vat} disabled={!isEditable || savePending} onChange={(e) => {
                                                            const updatedPurchaseOrder = {
                                                                ...purchaseOrder,
                                                                lines: purchaseOrder?.lines.map((l) => l.modelId === line.modelId ? { ...l, vat: parseInt(e.target.value) } : l) ?? []
                                                            };
                                                            setPurchaseOrder(updatedPurchaseOrder);
                                                            latestPurchaseOrderRef.current = updatedPurchaseOrder;
                                                            if(vatTimeoutRef.current) {
                                                                clearTimeout(vatTimeoutRef.current);
                                                            }
                                                            vatTimeoutRef.current = setTimeout(() => {
                                                                handleSavePurchaseOrderChange();
                                                            }, 1000);
                                                        }} />
                                                        <span className="text-sm text-gray-500">%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-500">{(line.quantity * (line.unitHtPrice * (1 + line.vat / 100))).toFixed(2)} €</span>
                                                </TableCell>
                                                <TableCell className="w-[5%]">
                                                    <Button variant="outline" size="icon" disabled={savePending} onClick={() => {
                                                        const updatedPurchaseOrder = {
                                                            ...purchaseOrder,
                                                            lines: purchaseOrder?.lines.filter((l) => l.modelId !== line.modelId) ?? []
                                                        };
                                                        setPurchaseOrder(updatedPurchaseOrder);
                                                        latestPurchaseOrderRef.current = updatedPurchaseOrder;
                                                        handleSavePurchaseOrderChange();
                                                    }}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                )
                                }
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
}