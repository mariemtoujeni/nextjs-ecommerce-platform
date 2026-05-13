'use client'

import { useToast } from "~/hooks/use-toast";
import { WYSIWYG } from "~/components/wysiwyg";
import { ProductSearchBar } from "~/components/ProductSearchBar";
import { startTransition, useActionState, useEffect, useRef, useState, useCallback } from "react";
import { AdminOrderFilterType, ModelProductDetail, ModelWithProduct, OrderBoutique, OrderDeliveryMode, OrderDevis, OrderFilterInput, OrderPresenter, OrderStatus, ReturnLineInput, ReturnLinePresenter, ReturnPresenter, ReturnPresenterInput, ReturnStatus, ReturnType } from "@repo/core/models";
import { Badge, Button, Calendar, Card, CardContent, CardHeader, CardTitle, Heading, Input, Label, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "~/components/ui";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Spinner } from "~/components/Spinner";
import { ArrowLeft, Box, PlusIcon, SaveIcon, Search, ShoppingCart, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ReturnAll } from "@repo/core/types";
import { createReturnAction, getOrdersAdminAction } from "@repo/actions/orders";
import { getModelProductDetailByIdAction } from "@repo/actions/modele";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ModelCell } from "~/components/ModelCell";

const LIMIT = 50;

type ReturnPresenterInput2 = ReturnPresenterInput & {
    linePresenters: (ReturnLinePresenter & { price: number, vat: number, barCode: string })[];
    replacementLines?: (ReturnLinePresenter & { price: number, vat: number, barCode: string })[];
}

export interface MainPanelComponentProps {
    products?: ReturnAll<ModelWithProduct>
}

export const MainPanelComponent: React.FunctionComponent<MainPanelComponentProps> = ({ products: initialProducts }) => {
    const [products, setProducts] = useState<ModelWithProduct[]>(initialProducts?.items || []);
    const { toast } = useToast();
    const [searchOrder, setSearchOrder] = useState("");
    const [ordersList, setOrdersList] = useState<OrderPresenter[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderPresenter | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const shouldMaintainFocusRef = useRef(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [retour, setRetour] = useState<ReturnPresenterInput2 | null>(null);

    // Helper function to create return lines from order lines
    const createReturnLines = (orderLines: any[]) => {
        return orderLines.map(line => ({
            returnId: 0, // Will be set when the return is created
            modelId: line.modelId,
            quantity: 0,
            name: line.name,
            exchangeModelId: null,
            returnReason: undefined
        }));
    };

    const handleReturnQuantityChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, modelId: number, quantity: number, barCode: string, unitPriceExclTax: number, vat: number) => {        
        if (!retour) {
            console.warn('Return not initialized. Cannot add line.');
            return;
        }
        
        const modelProductDetail = await getModelProductDetailByIdAction(modelId);
        if(modelProductDetail.error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération du produit, erreur : " + (modelProductDetail.error || "Aucun produit trouvé"),
                variant: "destructive",
            });
            return;
        }
        
        const returnLine : ReturnLinePresenter = {
            returnId: 0,
            model: modelProductDetail.item,
            modelId: modelId,
            quantity: quantity,
            name: modelProductDetail.item.name,
            exchangeModelId: null,
            returnReason: undefined
        }

        const newRetour : ReturnPresenterInput2 = {
            ...retour,
            lines: [...retour.lines || [], returnLine],
            linePresenters: [...retour.linePresenters || [], { ...returnLine, price: unitPriceExclTax, vat: vat, barCode: barCode }]
        };

        setRetour(newRetour);
            
    }, [retour]);

    const [orders, fetchOrders, pending] = useActionState(
        async (_: ReturnAll<OrderPresenter> | null, options: OrderFilterInput) => await getOrdersAdminAction({
            ...options,
            filters: [
                {
                    key: AdminOrderFilterType.STATUS,
                    values: [OrderStatus.EXPEDIEE, OrderStatus.EXPEDIEE_PARTIELLEMENT]
                }, 
                {
                    key: AdminOrderFilterType.DEVIS,
                    values: [OrderDevis.NON]
                }
            ]
        }),
        null
    );

    // Restaurer le focus après les re-renders si nécessaire
    useEffect(() => {
        if (shouldMaintainFocusRef.current && inputRef.current && isOpen) {
            const input = inputRef.current;
            requestAnimationFrame(() => {
                if (input && document.activeElement !== input) {
                    input.focus();
                    const cursorPosition = searchOrder.length;
                    input.setSelectionRange(cursorPosition, cursorPosition);
                }
            });
            shouldMaintainFocusRef.current = false;
        }
    }, [ordersList, isOpen, searchOrder]);

    const handleSearchOrderChange = useCallback(async (searchRequest: string) => {
        shouldMaintainFocusRef.current = true;
        startTransition(() => {
            fetchOrders({limit: LIMIT, offset: (0), search: searchRequest});
        });
    }, [fetchOrders]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if(searchOrder) {
            searchTimeoutRef.current = setTimeout(async () => {
                await handleSearchOrderChange(searchOrder);
            }, 500);
        } else {
            shouldMaintainFocusRef.current = true;
            startTransition(() => {
                fetchOrders({limit: LIMIT, offset: (0), search: ""});
            });
        }
    }, [searchOrder, handleSearchOrderChange, fetchOrders]);

    useEffect(() => {
        if(orders && (orders.error || !orders.items)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération des commandes, erreur : " + (orders.error || "Aucune commande trouvée"),
                variant: "destructive",
            });
        } else {
            setOrdersList(orders?.items || []);
        }
    }, [orders]);

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (open && inputRef.current) {
            shouldMaintainFocusRef.current = true;
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

    const formatDate = (date: Date | undefined) => {
        if (!date) return '';
        return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
    };
    
    return (
        <div className="container flex flex-col gap-4">
            <div className="flex flex-row justify-between w-full">
                <div className="flex flex-row gap-3 items-center h-[26px]">              
                    <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                        window.location.href = `/orders/returns`;
                    }}>                        
                        <ArrowLeft style={{ width: '16px', height: '16px' }}/>
                    </Card>                    
                    <Heading key='page-title' heading={"2"} className="text-gray-700 mt-3">Nouvelle demande de retour</Heading>
                </div>
                <div className="flex flex-row gap-3 items-center h-[26px]">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="default" size="lg">
                                <SaveIcon className="w-4 h-4"/>Enregistrer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl">
                            <DialogTitle>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <SaveIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <Heading heading="4" className="text-gray-700 font-bold">Confirmer la demande de retour</Heading>
                                </div>
                            </DialogTitle>
                            <div className="space-y-6">
                                {/* Résumé du retour */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Box className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <Heading heading="5" className="text-gray-700 font-bold">Résumé du retour</Heading>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-sm text-gray-700 font-bold">Type de retour</Label>
                                                <div className="flex items-center">
                                                    {retour?.type === ReturnType.CREDIT ? (
                                                        <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                            Avoir
                                                        </Badge>
                                                    ) : retour?.type === ReturnType.REPAYMENT ? (
                                                        <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                                                            Remboursement
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="orange" className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
                                                            Échange
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-sm text-gray-700 font-bold">Nombre de produits</Label>
                                                <div className="flex items-center">
                                                    <Badge variant="gray" className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">
                                                        {retour?.linePresenters?.length || 0} produit(s)
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-sm text-gray-700 font-bold">Valeur des produits à retourner</Label>
                                                <div className="flex items-center">
                                                    <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1 font-bold">
                                                        {retour?.linePresenters?.reduce((total, line) => 
                                                            total + (line.price * (1 + line.vat / 100) * line.quantity), 0
                                                        ).toFixed(2) || '0.00'} €
                                                    </Badge>
                                                </div>
                                            </div>
                                            {
                                                retour?.type === ReturnType.EXCHANGE && (
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-sm text-gray-700 font-bold">Valeur des produits échangés</Label>
                                                        <div className="flex items-center">
                                                            <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1 font-bold">
                                                                {retour?.linePresenters?.reduce((total, line) => 
                                                                    total + ((line.exchangeModel?.price || 0) * line.quantity), 0
                                                                ).toFixed(2) || '0.00'} €
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Détails de la commande */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <ShoppingCart className="w-5 h-5 text-green-600" />
                                                </div>
                                                <Heading heading="5" className="text-gray-700 font-bold">Détails de la commande</Heading>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-sm text-gray-600">Numéro de commande</Label>
                                                <span className="font-medium">#{selectedOrder?.id}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-sm text-gray-600">Client</Label>
                                                <span className="font-medium">{selectedOrder?.client?.firstName} {selectedOrder?.client?.lastName}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-sm text-gray-600">Date de commande</Label>
                                                <span className="font-medium">{selectedOrder?.createdAt.toLocaleDateString('fr-FR')}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-sm text-gray-600">Montant total</Label>
                                                <span className="font-medium">{selectedOrder?.amount.toFixed(2)} €</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button onClick={async () => {
                                    const returnData : ReturnPresenterInput = {
                                        orderId: retour?.orderId || 0,
                                        type: retour?.type || ReturnType.CREDIT,
                                        status: retour?.status || ReturnStatus.PENDING,
                                        requestDate: retour?.requestDate || new Date(),
                                        routingDebitCard: retour?.routingDebitCard || "",
                                        lines: retour?.linePresenters?.map((line) => ({
                                            returnId: 0,
                                            modelId: line.modelId,
                                            quantity: line.quantity,
                                            name: line.name,
                                            exchangeModelId: line.exchangeModelId,
                                            returnReason: line.returnReason
                                        })) || []
                                    }                                    
                                    const returnOne = await createReturnAction(returnData);
                                    if(returnOne.error) {
                                        toast({
                                            title: "Erreur",
                                            description: "Une erreur est survenue lors de la création du retour, erreur : " + (returnOne.error || "Aucun retour trouvé"),
                                            variant: "destructive",
                                        });
                                        return;
                                    }
                                    if(returnOne.item) {
                                        toast({
                                            title: "Succès",
                                            description: "La demande de retour a été enregistrée avec succès",
                                            variant: "default",
                                        });
                                        window.location.href = `/orders/returns/${returnOne.item.id}`;
                                    }
                                }}>
                                    Confirmer la demande
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>
                            <Heading heading="3" className="text-gray-700 font-bold">Informations de la commande</Heading>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm text-gray-700 font-bold">Sélectionner la commande</Label>
                            <Popover open={isOpen} onOpenChange={handleOpenChange}>
                                <PopoverTrigger asChild>
                                    <div className="w-full">
                                        <Input 
                                            ref={inputRef}
                                            autoFocus
                                            id="order-search" 
                                            placeholder="Rechercher une commande..." 
                                            className="w-full"
                                            value={searchOrder}
                                            onFocus={handleFocus}
                                            onBlur={(e) => {
                                                // Ne pas fermer le popover si on clique dans le contenu
                                                if (!e.relatedTarget?.closest('[role="dialog"]') && !e.relatedTarget?.closest('[data-radix-popper-content-wrapper]')) {
                                                    setIsOpen(false);
                                                }
                                            }}
                                            onChange={(e) => {
                                                setSearchOrder(e.target.value);
                                                setIsOpen(true);
                                            }}
                                        />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent 
                                    className="w-[--radix-popover-trigger-width] p-4 bg-white z-50 shadow-md rounded-md" 
                                    align="start" 
                                    sideOffset={5}
                                    onOpenAutoFocus={(e) => {
                                        // Empêcher l'auto-focus du popover de voler le focus de l'input
                                        e.preventDefault();
                                        if (inputRef.current) {
                                            inputRef.current.focus();
                                        }
                                    }}
                                >
                                    <div className="space-y-3 w-full max-h-80 overflow-y-auto">
                                        {pending ? (
                                            <div className="flex justify-center items-center py-4">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Spinner variant="circle" size={20} />
                                                    <p className="text-sm text-gray-500">Recherche en cours...</p>
                                                </div>
                                            </div>
                                        ) : ordersList?.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p>Aucune commande trouvée</p>
                                            </div>
                                        ) : (
                                            ordersList?.filter((command: OrderPresenter) => command.client).map((command: OrderPresenter) => (
                                                <div 
                                                    key={command.id} 
                                                    className="group relative bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsOpen(false);
                                                        setSelectedOrder(command);
                                                        setRetour({
                                                            orderId: command.id,
                                                            status: ReturnStatus.PENDING,
                                                            type: ReturnType.CREDIT,
                                                            requestDate: new Date(),
                                                            routingDebitCard: command.authorisation,
                                                            lines: [],
                                                            linePresenters: [],
                                                            replacementLines: []
                                                        });
                                                    }}
                                                >                                            
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="flex-shrink-0 min-w-[3rem] h-8 bg-blue-100 rounded-full flex items-center justify-center px-2">
                                                                    <span className="text-blue-600 font-semibold text-xs whitespace-nowrap">#{command.id}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-semibold text-gray-900 truncate">
                                                                        {command.client?.firstName || 'Prénom'} {command.client?.lastName || 'Nom'}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500">
                                                                        {command.createdAt.toLocaleDateString('fr-FR', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-lg font-bold text-gray-900">
                                                                        {command.amount.toLocaleString('fr-FR', {
                                                                            minimumFractionDigits: 2,
                                                                            maximumFractionDigits: 2
                                                                        })} €
                                                                    </span>
                                                                </div>
                                                                
                                                                <p className="text-sm text-gray-600 truncate">
                                                                    {command.client?.email || 'Email non disponible'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col gap-2 ml-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                <Badge 
                                                                    variant="blue" 
                                                                    className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1"
                                                                >
                                                                    {command.deliveryMode}
                                                                </Badge>
                                                                {command.boutique && (
                                                                    command.boutique === OrderBoutique.NATAQUASHOP ? (
                                                                        <Badge 
                                                                            variant="blue" 
                                                                            className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-1"
                                                                        >
                                                                            {command.boutique}
                                                                        </Badge>
                                                                    ) : command.boutique === OrderBoutique.SWIMWEAR ? (
                                                                        <Badge 
                                                                            variant="orange" 
                                                                            className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-2 py-1"
                                                                        >
                                                                            {command.boutique}
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge 
                                                                            variant="red" 
                                                                            className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-1"
                                                                        >
                                                                            {command.boutique}
                                                                        </Badge>
                                                                    ) 
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <div className={`w-2 h-2 rounded-full ${
                                                                    command.status === OrderStatus.EXPEDIEE ? 'bg-green-500' :
                                                                    command.status === OrderStatus.PREPARATION ? 'bg-yellow-500' :
                                                                    command.status === OrderStatus.ATTENTE_PAIMENT ? 'bg-orange-500' :
                                                                    'bg-gray-400'
                                                                }`}></div>
                                                                <span className="capitalize">{command.status.toLowerCase().replace('_', ' ')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-lg"></div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {
                            selectedOrder && (
                                <Card className="mt-8">
                                    <CardHeader>
                                        <CardTitle>
                                            <div className="flex flex-row justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <Heading heading="3" className="text-gray-700 font-bold">Commande sélectionnée</Heading>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Button variant="outline" size="icon" onClick={() => {  
                                                        setSelectedOrder(null);
                                                        setRetour(null);
                                                    }}>
                                                        <Trash className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-2 mt-8">
                                        {
                                            selectedOrder && (
                                                <div className="grid grid-cols-2 gap-6">                                    
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-sm text-gray-700 font-bold">ID de la commande</Label>
                                                        <Input 
                                                            value={selectedOrder?.id || ''} 
                                                            readOnly 
                                                            className="text-sm text-gray-700" 
                                                            disabled={true} 
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-sm text-gray-700 font-bold">Statut de la commande</Label>
                                                        <div className="flex items-center">
                                                            {
                                                                selectedOrder?.status === OrderStatus.EXPEDIEE ?
                                                                    <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                                                                        Expédié
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.status === OrderStatus.ATTENTE_PAIMENT ?
                                                                    <Badge variant="orange" className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
                                                                        En attente de paiement
                                                                    </Badge>
                                                                :                            
                                                                selectedOrder?.status === OrderStatus.PREPARATION ?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        En préparation
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.status === OrderStatus.PAIMENT_ACCEPTE ?
                                                                    <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                                                                        Payée
                                                                    </Badge>
                                                                :                                                
                                                                    <Badge variant="gray" className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">
                                                                        Autre
                                                                    </Badge>                                                
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-sm text-gray-700 font-bold">Date de création</Label>
                                                        <Input 
                                                            value={formatDate(selectedOrder?.createdAt)} 
                                                            readOnly 
                                                            className="text-sm text-gray-700" 
                                                            disabled={true} 
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-sm text-gray-700 font-bold">Mode de livraison</Label>
                                                        <div className="flex items-center">
                                                            {
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.CHRONOPOST || selectedOrder?.deliveryMode === OrderDeliveryMode.CHRONOPOST_RELAIS ?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        Chronopost
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.COLISSIMO ?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        Colissimo
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.SO_COLISSIMO ?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        So Colissimo
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.MONDIAL_RELAIS || selectedOrder?.deliveryMode === OrderDeliveryMode.MONDIAL_RELAY ?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        Mondial Relay
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.ICI_RELAIS ?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        Ici Relais
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.AU_MAGASIN?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        Au magasin
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.AU_CLUB ?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        Au club
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.NON_LIVRABLE?
                                                                    <Badge variant="gray" className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">
                                                                        Non livrable
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.EXAPAQ ?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        Exapaq
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.MANUEL ?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        Manuel
                                                                    </Badge>
                                                                :
                                                                selectedOrder?.deliveryMode === OrderDeliveryMode.EXPEDITOR ?
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                        Expeditor
                                                                    </Badge>
                                                                :
                                                                <Badge variant="gray" className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">
                                                                    Autre
                                                                </Badge>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-sm text-gray-700 font-bold">Prix total TTC</Label>
                                                        <Input 
                                                            value={`${(selectedOrder?.amount + selectedOrder?.deliveryFees).toFixed(2) || '0.00'} €`} 
                                                            readOnly 
                                                            className="text-sm text-gray-700" 
                                                            disabled={true} 
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-sm text-gray-700 font-bold">Frais de livraison</Label>
                                                        <Input 
                                                            value={`${selectedOrder?.deliveryFees.toFixed(2) || '0.00'} €`} 
                                                            readOnly 
                                                            className="text-sm text-gray-700" 
                                                            disabled={true} 
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-sm text-gray-700 font-bold">Mode de paiement</Label>
                                                        <div className="flex items-center">
                                                            <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                {selectedOrder?.paymentMode}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-sm text-gray-700 font-bold">Boutique</Label>
                                                        <div className="flex items-center">
                                                            <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                {selectedOrder?.boutique}
                                                            </Badge>
                                                        </div>
                                                    </div>                                        
                                                </div>
                                            )
                                        }
                                        </div>
                                        <div className="mt-6">
                                        {
                                            selectedOrder && (
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                                    <Box className="w-5 h-5 text-blue-600" />
                                                                </div>
                                                                <Heading heading="3" className="text-gray-700 font-bold">Lignes de commande</Heading>
                                                            </div>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-4">
                                                            {selectedOrder?.lines.map((line, index) => (
                                                                <Card key={line.id} className="border border-gray-200">
                                                                    <CardContent className="p-4">
                                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
                                                                            <div className="flex flex-col gap-2">
                                                                                <Label className="text-sm text-gray-700 font-bold">Produit</Label>
                                                                                <Input 
                                                                                    value={line.name} 
                                                                                    readOnly 
                                                                                    className="text-sm text-gray-700" 
                                                                                    disabled={true} 
                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col gap-2">
                                                                                <Label className="text-sm text-gray-700 font-bold">Quantité</Label>
                                                                                <div className="flex items-center">
                                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                                        {line.quantity}
                                                                                    </Badge>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col gap-2">
                                                                                <Label className="text-sm text-gray-700 font-bold">Code barre</Label>
                                                                                <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-700 border">
                                                                                    {line.barCode}
                                                                                </code>
                                                                            </div>
                                                                            <div className="flex flex-col gap-2">
                                                                                <Label className="text-sm text-gray-700 font-bold">Poids</Label>
                                                                                <Input 
                                                                                    value={`${line.weight} kg`} 
                                                                                    readOnly 
                                                                                    className="text-sm text-gray-700" 
                                                                                    disabled={true} 
                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col gap-2">
                                                                                <Label className="text-sm text-gray-700 font-bold">Prix unitaire HT</Label>
                                                                                <Input 
                                                                                    value={`${(line.unitPriceExclTax).toFixed(2)} €`} 
                                                                                    readOnly 
                                                                                    className="text-sm text-gray-700" 
                                                                                    disabled={true} 
                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col gap-2">
                                                                                <Label className="text-sm text-gray-700 font-bold">TVA</Label>
                                                                                <Input 
                                                                                    value={`${line.vat}%`} 
                                                                                    readOnly 
                                                                                    className="text-sm text-gray-700" 
                                                                                    disabled={true} 
                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col gap-2">
                                                                                <Label className="text-sm text-gray-700 font-bold">Prix total TTC</Label>
                                                                                <div className="flex items-center">
                                                                                    <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1 font-bold">
                                                                                        {line.totalPriceInclTax.toFixed(2)} €
                                                                                    </Badge>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col gap-2">
                                                                                <Label className="text-sm text-gray-700 font-bold">Quantité à retourner</Label>
                                                                                <Input type="number" max={line.quantity} min={0}  onChange={async (e) => {
                                                                                    await handleReturnQuantityChange(e, line.modelId, line.quantity, line.barCode, line.unitPriceExclTax, line.vat);
                                                                                }} />
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        }                        
                                        </div>   
                                    </CardContent>
                                </Card>
                            )
                        }                        
                    </CardContent>
                </Card>
            </div>
            {
                retour && (
                    <div className="flex flex-col gap-7 w-full">
                    <div className="flex flex-row gap-7 w-full">                        
                        <div className="flex flex-col gap-1 mt-1 pb-5 w-full">
                            <Card className="mt-8">
                                <CardHeader>
                                    <CardTitle>
                                        <Heading heading="3" className="text-gray-700 font-bold">Détails du retour</Heading>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Date de demande */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">Date de demande</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Input 
                                                        value={formatDate(retour?.requestDate)} 
                                                        readOnly 
                                                        className="text-sm text-gray-700 cursor-pointer" 
                                                        placeholder="Sélectionnez une date"
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 w-auto">
                                                    <Calendar
                                                        mode="single"
                                                        selected={retour?.requestDate ? new Date(retour.requestDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date && selectedOrder?.id) {
                                                                setRetour(prev => prev ? { ...prev, requestDate: date } : {
                                                                    status: ReturnStatus.PENDING,
                                                                    orderId: selectedOrder.id,
                                                                    type: ReturnType.CREDIT,
                                                                    requestDate: new Date(),
                                                                    routingDebitCard: selectedOrder?.authorisation,
                                                                    lines: [],                                                                    
                                                                    linePresenters: [...retour.linePresenters]
                                                                });
                                                            }
                                                        }}
                                                        initialFocus
                                                        locale={fr}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Date de réception */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">Date de réception</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Input 
                                                        value={formatDate(retour?.receivedDate)} 
                                                        readOnly 
                                                        className="text-sm text-gray-700 cursor-pointer" 
                                                        placeholder="Sélectionnez une date"
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 w-auto">
                                                    <Calendar
                                                        mode="single"
                                                        selected={retour?.receivedDate ? new Date(retour.receivedDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date && selectedOrder?.id) {
                                                                setRetour(prev => prev ? { ...prev, receivedDate: date } : {
                                                                    status: ReturnStatus.PENDING,
                                                                    orderId: selectedOrder.id,
                                                                    type: ReturnType.CREDIT,
                                                                    requestDate: new Date(),
                                                                    routingDebitCard: selectedOrder?.authorisation,
                                                                    lines: [],
                                                                    linePresenters: [...retour.linePresenters]
                                                                });
                                                            }
                                                        }}
                                                        initialFocus
                                                        locale={fr}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Type de retour */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">Type de retour</Label>                                            
                                            <Select
                                                value={retour?.type}
                                                onValueChange={(value) => {
                                                    if (value && selectedOrder?.id) {
                                                        setRetour(prev => prev ? { ...prev, type: value as ReturnType } : {
                                                            status: ReturnStatus.PENDING,
                                                            orderId: selectedOrder.id,
                                                            type: ReturnType.CREDIT,
                                                            requestDate: new Date(),
                                                            routingDebitCard: selectedOrder?.authorisation,
                                                            lines: [],
                                                            linePresenters: [...retour.linePresenters]
                                                        });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Sélectionnez un type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={ReturnType.REPAYMENT}>Remboursement</SelectItem>
                                                    <SelectItem value={ReturnType.EXCHANGE}>Échange</SelectItem>
                                                    <SelectItem value={ReturnType.CREDIT}>Avoir</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Numéro de suivi */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">Numéro de suivi</Label>
                                            <Input 
                                                value={retour?.trackingNumber || ''} 
                                                readOnly 
                                                className="text-sm text-gray-700" 
                                            />
                                        </div>

                                        {/* Numéro de prise en charge */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">Numéro de prise en charge</Label>
                                            <Input 
                                                value={retour?.supportNumber || ''} 
                                                readOnly 
                                                className="text-sm text-gray-700" 
                                            />
                                        </div>

                                        {/* CAB routage */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">CAB routage</Label>
                                            <Input 
                                                value={retour?.routingDebitCard || ''} 
                                                readOnly 
                                                className="text-sm text-gray-700"                                                 
                                            />
                                        </div>

                                        {/* Date réception de commande */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">Date réception de commande</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Input 
                                                        value={formatDate(retour?.commandReceptionDate)} 
                                                        readOnly 
                                                        className="text-sm text-gray-700 cursor-pointer"                                                         
                                                        placeholder="Sélectionnez une date"
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 w-auto">
                                                    <Calendar
                                                        mode="single"
                                                        selected={retour?.commandReceptionDate ? new Date(retour.commandReceptionDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date && selectedOrder?.id) {
                                                                setRetour(prev => prev ? { ...prev, commandReceptionDate: date } : {
                                                                    status: ReturnStatus.PENDING,
                                                                    orderId: selectedOrder.id,
                                                                    type: ReturnType.CREDIT,
                                                                    requestDate: new Date(),
                                                                    routingDebitCard: selectedOrder?.authorisation,
                                                                    lines: [],
                                                                    linePresenters: [...retour.linePresenters]
                                                                });
                                                            }
                                                        }}
                                                        initialFocus
                                                        locale={fr}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Date de remboursement */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">Date de remboursement</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Input 
                                                        value={formatDate(retour?.repaymentDate)} 
                                                        readOnly 
                                                        className="text-sm text-gray-700 cursor-pointer"                                                         
                                                        placeholder="Sélectionnez une date"
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 w-auto">
                                                    <Calendar
                                                        mode="single"
                                                        selected={retour?.repaymentDate ? new Date(retour.repaymentDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date && selectedOrder?.id) {
                                                                setRetour(prev => prev ? { ...prev, repaymentDate: date } : {
                                                                    status: ReturnStatus.PENDING,
                                                                    orderId: selectedOrder.id,
                                                                    type: ReturnType.CREDIT,
                                                                    requestDate: new Date(),
                                                                    routingDebitCard: selectedOrder?.authorisation,
                                                                    lines: [],
                                                                    linePresenters: [...retour.linePresenters]
                                                                });
                                                            }
                                                        }}
                                                        initialFocus
                                                        locale={fr}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Date de réexpédition */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">Date de réexpédition</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Input 
                                                        value={formatDate(retour?.reexpeditionDate)} 
                                                        readOnly 
                                                        className="text-sm text-gray-700 cursor-pointer"                                                         
                                                        placeholder="Sélectionnez une date"
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 w-auto">
                                                    <Calendar
                                                        mode="single"
                                                        selected={retour?.reexpeditionDate ? new Date(retour.reexpeditionDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date && selectedOrder?.id) {
                                                                setRetour(prev => prev ? { ...prev, reexpeditionDate: date } : {
                                                                    status: ReturnStatus.PENDING,
                                                                    orderId: selectedOrder.id,
                                                                    type: ReturnType.CREDIT,
                                                                    requestDate: new Date(),
                                                                    routingDebitCard: selectedOrder?.authorisation,
                                                                    lines: [],
                                                                    linePresenters: [...retour.linePresenters]
                                                                });
                                                            }
                                                        }}
                                                        initialFocus
                                                        locale={fr}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* État du retour */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">État du retour</Label>
                                            <div className="flex items-center">
                                                <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">{ReturnStatus.PENDING}</Badge>
                                            </div>
                                        </div>                                        
                                    </div>

                                    {/* Motif de retour - WYSIWYG */}
                                    <div className="flex flex-col gap-2 mt-6">
                                        <Label className="text-sm text-gray-700 font-bold">Motif de retour</Label>
                                        <WYSIWYG 
                                            key={retour?.id} 
                                            content={retour?.returnReason || ''} 
                                            previewMode={false}
                                            placeholder="Saisissez le motif de retour..."
                                            onChange={(value) => {
                                                setRetour(prev => prev ? { ...prev, returnReason: value } : null);
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>                                                                                  
                        </div>                    
                    </div>
                    <div className="flex flex-col">
                        {/* Liste détaillée des retours */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <ShoppingCart className="w-5 h-5 text-green-600" />
                                            </div>
                                            <Heading heading="3" className="text-gray-700 font-bold">
                                                {retour?.type === ReturnType.CREDIT || retour?.type === ReturnType.REPAYMENT 
                                                    ? "Produits à retourner" 
                                                    : "Échanges de produits"
                                                }
                                            </Heading>
                                        </div>                                        
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {
                                    retour?.type === ReturnType.CREDIT || retour?.type === ReturnType.REPAYMENT ? (
                                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <Table>
                                                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                    <TableRow className="hover:bg-gray-100">
                                                        <TableHead className="font-semibold text-gray-700 py-4">Produit</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-center">Quantité</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4">Code barre</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-right">Prix unitaire HT</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-right">TVA</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-right">Prix total TTC</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-center">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {retour?.linePresenters?.map((line : ReturnLinePresenter & { price: number, vat: number, barCode: string }, index: number) => (
                                                        <TableRow key={`credit-${line.modelId}-${index}`} className="hover:bg-gray-50">
                                                            <TableCell>
                                                                <div className="flex items-center space-x-3">
                                                                    <ModelCell model={line.model}/>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-center">
                                                                <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                                    {line.quantity}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700 border">
                                                                    {line.barCode}
                                                                </code>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right font-medium">
                                                                {line.price.toFixed(2)} €
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right text-sm text-gray-600">
                                                                {line.vat}%
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right font-bold text-green-700">
                                                                {(line.price * (1 + line.vat / 100) * line.quantity).toFixed(2)} €
                                                            </TableCell>
                                                            <TableCell className="py-4 text-center">
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setRetour(prev => prev ? {
                                                                            ...prev,
                                                                            linePresenters: prev.linePresenters?.filter((_, i) => i !== index) || []
                                                                        } : null);
                                                                    }}
                                                                >
                                                                    <Trash className="w-4 h-4 text-red-500" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {(!retour?.linePresenters || retour.linePresenters.length === 0) && (
                                                        <TableRow>
                                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <Box className="w-8 h-8 text-gray-400" />
                                                                    <p>Aucun produit à retourner</p>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>       
                                        </div>
                                    ) : (
                                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">                                                
                                            <Table>
                                                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                    <TableRow className="hover:bg-gray-100">
                                                        <TableHead className="font-semibold text-gray-700 py-4">Produit échangé</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-center">Quantité</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-right">Prix unitaire HT</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4">Produit de remplacement</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-center">Quantité</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-right">Prix unitaire HT</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-center">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {retour?.linePresenters?.map((line : ReturnLinePresenter & { price: number, vat: number, barCode: string }, index: number) => {
                                                        return (
                                                            <TableRow key={`exchange-${line.modelId}-${index}`} className="hover:bg-gray-50">
                                                                {/* Colonne produit échangé */}
                                                                <TableCell>
                                                                    <div className="flex items-center space-x-3">
                                                                        <ModelCell model={line.model}/>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-4 text-center">
                                                                    <Badge variant="orange" className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
                                                                        {line.quantity}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="py-4 text-right font-medium">
                                                                    {line.price.toFixed(2)} €
                                                                </TableCell>
                                                                
                                                                {/* Colonne produit de remplacement */}
                                                                <TableCell className="py-4">
                                                                    {line.exchangeModel ? (
                                                                        <div className="flex items-center space-x-3">
                                                                            <ModelCell model={line.exchangeModel}/>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-sm">Aucun remplacement</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="py-4 text-center">
                                                                    {line.exchangeModel ? (
                                                                        <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                                                                            {line.quantity}
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-gray-400">-</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="py-4 text-right">
                                                                     {line.exchangeModel ? (
                                                                         <span className="font-medium">{line.exchangeModel.price.toFixed(2)} €</span>
                                                                     ) : (
                                                                         <span className="text-gray-400">-</span>
                                                                     )}
                                                                 </TableCell>
                                                                <TableCell className="py-4 text-center">
                                                                    <div className="flex items-center justify-center">
                                                                        {line.exchangeModel ? (
                                                                            <Button 
                                                                                variant="outline" 
                                                                                size="sm"
                                                                                onClick={() => {                                                                                
                                                                                    const newLines = retour?.linePresenters?.filter(l => l.modelId !== line.modelId);
                                                                                    setRetour(prev => prev ? {
                                                                                        ...prev,
                                                                                        linePresenters: [...newLines, {
                                                                                            ...line,
                                                                                            exchangeModel: undefined,
                                                                                            exchangeModelId: undefined
                                                                                        }]
                                                                                    } : null);
                                                                                }}
                                                                            >
                                                                                <Trash className="w-4 h-4 text-red-500" />
                                                                            </Button>
                                                                        ) : (
                                                                            <Dialog>
                                                                                <DialogTrigger asChild>
                                                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600 border-blue-600 hover:text-white hover:bg-blue-600">
                                                                                        <PlusIcon className="w-4 h-4" />
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                                                                                    <DialogTitle>
                                                                                        <div className="flex items-center justify-between px-4 pt-4 md:px-4 md:pt-4 pb-4">
                                                                                            <Heading heading="5">Ajouter un produit de remplacement</Heading>
                                                                                        </div>
                                                                                    </DialogTitle>
                                                                                    <div className="flex-1 overflow-y-auto space-y-6 px-4 md:px-8 pb-8">
                                                                                        <ProductSearchBar 
                                                                                            purpose="sales-point"
                                                                                            initialProducts={initialProducts}
                                                                                            isEditable={true}
                                                                                            models={products}
                                                                                            onModelSelected={async (model : ModelWithProduct) => {
                                                                                                const modelProductDetail = await getModelProductDetailByIdAction(model.id);
                                                                                                if(modelProductDetail.error) {
                                                                                                    toast({
                                                                                                        title: "Erreur",
                                                                                                        description: "Une erreur est survenue lors de la récupération du produit, erreur : " + (modelProductDetail.error || "Aucun produit trouvé"),
                                                                                                        variant: "destructive",
                                                                                                    });
                                                                                                    return;
                                                                                                }
                                                                                                const linesExchanged = retour?.linePresenters?.filter(l => l.exchangeModelId === line.modelId);
                                                                                                setRetour(prev => prev ? {
                                                                                                    ...prev,
                                                                                                    linePresenters: [...linesExchanged, {
                                                                                                        ...line,
                                                                                                        exchangeModel: modelProductDetail.item,
                                                                                                        exchangeModelId: model.id
                                                                                                    }]
                                                                                                } : null);
                                                                                                
                                                                                                const dialogElement = document.querySelector('[role="dialog"]');
                                                                                                if (dialogElement) {
                                                                                                    const closeButton = dialogElement.querySelector('[data-radix-dialog-close]');
                                                                                                    if (closeButton) {
                                                                                                        (closeButton as HTMLElement).click();
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </DialogContent>
                                                                            </Dialog>
                                                                        )}
                                                                    </div>
                                                                </TableCell>                                                                
                                                            </TableRow>
                                                        );
                                                    })}
                                                    {(!retour?.linePresenters || retour.linePresenters.length === 0) && (
                                                        <TableRow>
                                                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                                                                    <p>Aucun échange configuré</p>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>       
                                        </div>
                                    )
                                }                                
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}            
        </div>  
    );
}
