'use client'

import { getReturnAction, updateReturnAction, createCreditNoteAction } from "@repo/actions/orders";
import { CreditNoteType, OrderDeliveryMode, OrderStatus, ReturnPresenter, ReturnPresenterInput, ReturnStatus, ReturnType } from "@repo/core/models";
import { AlertTriangle, ArrowLeft, Check, ShoppingCart, TicketCheck, Trash2 } from "lucide-react";
import { startTransition, useActionState, useEffect, useState } from "react";
import { Spinner } from "~/components/Spinner";
import { Card, CardContent, CardHeader, CardTitle, Heading, Input, Label, Badge, Button } from "~/components/ui";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { WYSIWYG } from "~/components/wysiwyg";
import { useToast } from "~/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReturnOne } from "@repo/core/types";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ModelCell } from "~/components/ModelCell";

export interface MainPanelComponentProps {
    returnId: number
}

const LIMIT = 100;

export const MainPanelComponent: React.FunctionComponent<MainPanelComponentProps> = ({ returnId }) => {
    const { toast } = useToast();
    const router = useRouter();
    const [retour, setRetour] = useState<ReturnPresenter | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState<number>(1);

    const [ret, fetchReturn, pending] = useActionState(
        async (_: ReturnOne<ReturnPresenter> | null, payload: number) => await getReturnAction(payload),
        null
    );

    const [updateRet, updateReturn, updatePending] = useActionState(
        async (_: ReturnOne<ReturnPresenter> | null, payload: ReturnPresenterInput) => await updateReturnAction(returnId, payload),
        null
    );

    useEffect(() => {
        startTransition(() => {
            fetchReturn(returnId);
        });
    }, [returnId]);

    useEffect(() => {
        if(ret && (ret.error || !ret)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération du retour, erreur : " + (ret.error || "Aucun retour trouvé"),
                variant: "destructive",
            });
        } else {
            setRetour(ret?.item || null);
        }
    }, [ret]);

    const isReadOnly = retour?.status !== ReturnStatus.PENDING;
    // Calculer le nombre total de pages basé sur les lignes du retour
    const totalPages = Math.ceil(retour?.lines.length || 0 / LIMIT);

    const getReturnTypeBadge = (type: ReturnType) => {
        switch (type) {
            case ReturnType.REPAYMENT:
                return <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">Remboursement</Badge>;
            case ReturnType.EXCHANGE:
                return <Badge variant="orange" className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">Échange</Badge>;
            case ReturnType.CREDIT:
                return <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">Avoir</Badge>;
            default:
                return <Badge variant="gray" className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">Inconnu</Badge>;
        }
    };

    const getReturnStatusBadge = (status: ReturnStatus) => {
        switch (status) {
            case ReturnStatus.PENDING:
                return <Badge variant="orange" className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">En cours</Badge>;
            case ReturnStatus.APPROVED:
                return <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">Approuvé</Badge>;
            case ReturnStatus.VALIDATED:
                return <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">Validé</Badge>;
            case ReturnStatus.REJECTED:
                return <Badge variant="red" className="bg-red-100 text-red-800 border-red-200 px-3 py-1">Refusé</Badge>;
            default:
                return <Badge variant="gray" className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">Inconnu</Badge>;
        }
    };

    const formatDate = (date: Date | undefined) => {
        if (!date) return '';
        return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
    };

    const formatDateTime = (date: Date | undefined) => {
        if (!date) return '';
        return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
    };

    const handleRouterPush = (path: string) => {
        router.push(path);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handlePageChange = (value: string) => {
        setPage(parseInt(value));
    }

    return <div className="container flex flex-col gap-4">
        {
            pending ? (
                <div className="flex justify-center items-center py-8">
                    <div className="flex flex-col items-center gap-2">
                        <Spinner variant="circle" size={32} />
                        <p className="text-sm text-gray-500">Chargement du retour...</p>
                    </div>
                </div>
            ) : ret && ret.item ? (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row justify-between w-full">
                        <div className="flex flex-row gap-3 items-center h-[26px]">              
                            <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                                window.location.href = `/orders/returns`;
                            }}>                        
                                <ArrowLeft style={{ width: '16px', height: '16px' }}/>
                            </Card>                    
                            <Heading key='page-title' heading={"2"} className="text-gray-700 mt-3">Retour #{retour?.id}</Heading>                            
                        </div>                        
                        {(retour?.status === ReturnStatus.PENDING || retour?.status === ReturnStatus.VALIDATED) && (
                            <div className="flex flex-row gap-3 items-center h-[26px]">                                                                
                                {
                                    retour?.status === ReturnStatus.PENDING && (
                                        <Button variant="default" className="bg-green-500 hover:bg-green-600" size="lg" onClick={async () => {
                                            const updatedReturn = await updateReturnAction(returnId, {
                                                status: ReturnStatus.VALIDATED,
                                                orderId: retour.orderId || 0,
                                                type: retour.type,
                                                requestDate: retour.requestDate || new Date(),
                                                commandReceptionDate: retour.commandReceptionDate || new Date(),
                                                lines: retour.lines.map(line => ({
                                                    returnId: line.returnId,
                                                    modelId: line.modelId,
                                                    quantity: line.quantity,
                                                    id: line.id,
                                                    returnReason: line.returnReason,
                                                    name: line.name,
                                                    exchangeModelId: line.exchangeModelId,
                                                })) || []
                                            });

                                            if (updatedReturn.error) {
                                                toast({
                                                    title: "Erreur",
                                                    description: updatedReturn.error,
                                                    variant: "destructive",
                                                });
                                            } else {
                                                toast({
                                                    title: "Succès",
                                                    description: "Retour validé avec succès",
                                                    variant: "default",
                                                });
                                            }

                                            startTransition(() => {
                                                fetchReturn(returnId);
                                            });
                                        }}>
                                            <TicketCheck className="w-4 h-4" /> Valider
                                        </Button>
                                    )
                                }

                                {
                                    retour?.status === ReturnStatus.VALIDATED && (
                                        <Button 
                                            variant="default" 
                                            className="bg-green-500 hover:bg-green-600" 
                                            size="lg" 
                                            onClick={async () => {
                                                const updatedReturn = await updateReturnAction(returnId, {
                                                    status: ReturnStatus.APPROVED,
                                                    orderId: retour.orderId || 0,
                                                    type: retour.type,
                                                    requestDate: retour.requestDate || new Date(),
                                                    commandReceptionDate: retour.commandReceptionDate || new Date(),
                                                    lines: retour.lines.map(line => ({
                                                        returnId: line.returnId,
                                                        modelId: line.modelId,
                                                        quantity: line.quantity,
                                                        id: line.id,
                                                        returnReason: line.returnReason,
                                                        name: line.name,
                                                        exchangeModelId: line.exchangeModelId,
                                                    })) || []
                                                });

                                                if (updatedReturn.error) {
                                                    toast({
                                                        title: "Erreur",
                                                        description: updatedReturn.error,
                                                        variant: "destructive",
                                                    });
                                                } else {
                                                    toast({
                                                        title: "Succès",
                                                        description: "Retour approuvé avec succès",
                                                        variant: "default",
                                                    });
                                                }

                                                startTransition(() => {
                                                    fetchReturn(returnId);
                                                });
                                            }}
                                        >
                                            <TicketCheck className="w-4 h-4" /> Approuver
                                        </Button>
                                    )
                                }

                                {/* Bouton Refuser - toujours affiché */}
                                <Button 
                                    variant="default" 
                                    className="bg-red-500 hover:bg-red-600" 
                                    size="lg" 
                                    onClick={async () => {
                                        if (!retour) return;
                                        
                                        const updatedReturn = await updateReturnAction(returnId, {
                                            status: ReturnStatus.REJECTED,
                                            orderId: retour.orderId || 0,
                                            type: ReturnType.REPAYMENT,
                                            requestDate: retour.requestDate || new Date(),
                                            commandReceptionDate: retour.commandReceptionDate || new Date(),
                                            lines: retour.lines?.map(line => ({
                                                returnId: line.returnId,
                                                modelId: line.modelId,
                                                quantity: line.quantity,
                                                id: line.id,
                                                returnReason: line.returnReason,
                                                name: line.name,
                                                exchangeModelId: line.exchangeModelId,
                                            })) || []
                                        });

                                        if (updatedReturn.error) {
                                            toast({
                                                title: "Erreur",
                                                description: updatedReturn.error,
                                                variant: "destructive",
                                            });
                                        } else {
                                            toast({
                                                title: "Succès",
                                                description: "Retour refusé avec succès",
                                                variant: "default",
                                            });
                                        }

                                        startTransition(() => {
                                            fetchReturn(returnId);
                                        });
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" /> Refuser
                                </Button>                                
                            </div>
                        )}                        
                    </div>
                    <div className="flex flex-col gap-4">
                        <Card  className="mt-8">
                            <CardHeader>
                                <CardTitle>
                                    <Heading heading="3" className="text-gray-700 font-bold">Informations de la commande concernée</Heading>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-gray-700 font-bold">ID de la commande</Label>
                                        <Input 
                                            value={retour?.order?.id || ''} 
                                            readOnly 
                                            className="text-sm text-gray-700" 
                                            disabled={true} 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-gray-700 font-bold">Statut de la commande</Label>
                                        <div className="flex items-center">
                                            {
                                                retour?.order?.status === OrderStatus.EXPEDIEE ?
                                                    <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                                                        Expédié
                                                    </Badge>
                                                :
                                                retour?.order?.status === OrderStatus.ATTENTE_PAIMENT ?
                                                    <Badge variant="orange" className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
                                                        En attente de paiement
                                                    </Badge>
                                                :                            
                                                retour?.order?.status === OrderStatus.PREPARATION ?
                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                        En préparation
                                                    </Badge>
                                                :
                                                retour?.order?.status === OrderStatus.PAIMENT_ACCEPTE ?
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
                                            value={formatDate(retour?.order?.createdAt)} 
                                            readOnly 
                                            className="text-sm text-gray-700" 
                                            disabled={true} 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-gray-700 font-bold">Mode de livraison</Label>
                                        <div className="flex items-center">
                                            {
                                                retour?.order?.deliveryMode === OrderDeliveryMode.CHRONOPOST || retour?.order?.deliveryMode === OrderDeliveryMode.CHRONOPOST_RELAIS ?
                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                        Chronopost
                                                    </Badge>
                                                :
                                                retour?.order?.deliveryMode === OrderDeliveryMode.COLISSIMO ?
                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                        Colissimo
                                                    </Badge>
                                                :
                                                retour?.order?.deliveryMode === OrderDeliveryMode.SO_COLISSIMO ?
                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                        So Colissimo
                                                    </Badge>
                                                :
                                                retour?.order?.deliveryMode === OrderDeliveryMode.MONDIAL_RELAIS || retour?.order?.deliveryMode === OrderDeliveryMode.MONDIAL_RELAY ?
                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                        Mondial Relay
                                                    </Badge>
                                                :
                                                retour?.order?.deliveryMode === OrderDeliveryMode.ICI_RELAIS ?
                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                        Ici Relais
                                                    </Badge>
                                                :
                                                retour?.order?.deliveryMode === OrderDeliveryMode.AU_MAGASIN?
                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                        Au magasin
                                                    </Badge>
                                                :
                                                retour?.order?.deliveryMode === OrderDeliveryMode.AU_CLUB ?
                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                        Au club
                                                    </Badge>
                                                :
                                                retour?.order?.deliveryMode === OrderDeliveryMode.NON_LIVRABLE?
                                                    <Badge variant="gray" className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">
                                                        Non livrable
                                                    </Badge>
                                                :
                                                retour?.order?.deliveryMode === OrderDeliveryMode.EXAPAQ ?
                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                        Exapaq
                                                    </Badge>
                                                :
                                                retour?.order?.deliveryMode === OrderDeliveryMode.MANUEL ?
                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                        Manuel
                                                    </Badge>
                                                :
                                                retour?.order?.deliveryMode === OrderDeliveryMode.EXPEDITOR ?
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
                                            value={`${retour?.order?.amount.toFixed(2) || '0.00'} €`} 
                                            readOnly 
                                            className="text-sm text-gray-700" 
                                            disabled={true} 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-gray-700 font-bold">Frais de livraison</Label>
                                        <Input 
                                            value={`${retour?.order?.deliveryFees.toFixed(2) || '0.00'} €`} 
                                            readOnly 
                                            className="text-sm text-gray-700" 
                                            disabled={true} 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-gray-700 font-bold">Mode de paiement</Label>
                                        <div className="flex items-center">
                                            <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                {retour?.order?.paymentMode}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-gray-700 font-bold">Boutique</Label>
                                        <div className="flex items-center">
                                            <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                                {retour?.order?.boutique}
                                            </Badge>
                                        </div>
                                    </div>                                        
                                </div>      
                                <div className="mt-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <Heading heading="3" className="text-gray-700 font-bold">Lignes de commande</Heading>
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {retour?.order?.lines.map((line, index) => (
                                                    <Card key={line.id} className="border border-gray-200">
                                                        <CardContent className="p-4">
                                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                                                                    <Label className="text-sm text-gray-700 font-bold">Prix unitaire</Label>
                                                                    <Input 
                                                                        value={`${(line.totalPriceInclTax / line.quantity).toFixed(2)} €`} 
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
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
                                                        disabled={isReadOnly}
                                                        placeholder="Sélectionnez une date"
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 w-auto">
                                                    <Calendar
                                                        mode="single"
                                                        selected={retour?.requestDate ? new Date(retour.requestDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date && !isReadOnly) {
                                                                setRetour(prev => prev ? { ...prev, requestDate: date } : null);
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
                                                        disabled={isReadOnly}
                                                        placeholder="Sélectionnez une date"
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 w-auto">
                                                    <Calendar
                                                        mode="single"
                                                        selected={retour?.receivedDate ? new Date(retour.receivedDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date && !isReadOnly) {
                                                                setRetour(prev => prev ? { ...prev, receivedDate: date } : null);
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
                                            {isReadOnly ? (
                                                <div className="flex items-center">
                                                    {retour?.type && getReturnTypeBadge(retour.type)}
                                                </div>
                                            ) : (
                                                <Select
                                                    value={retour?.type}
                                                    onValueChange={(value) => {
                                                        if (value) {
                                                            setRetour(prev => prev ? { ...prev, type: value as ReturnType } : null);
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
                                            )}
                                        </div>

                                        {/* Numéro de suivi */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">Numéro de suivi</Label>
                                            <Input 
                                                value={retour?.trackingNumber || ''} 
                                                readOnly 
                                                className="text-sm text-gray-700" 
                                                disabled={isReadOnly} 
                                            />
                                        </div>

                                        {/* Numéro de prise en charge */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">Numéro de prise en charge</Label>
                                            <Input 
                                                value={retour?.supportNumber || ''} 
                                                readOnly 
                                                className="text-sm text-gray-700" 
                                                disabled={isReadOnly} 
                                            />
                                        </div>

                                        {/* CAB routage */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm text-gray-700 font-bold">CAB routage</Label>
                                            <Input 
                                                value={retour?.routingDebitCard || ''} 
                                                readOnly 
                                                className="text-sm text-gray-700" 
                                                disabled={isReadOnly} 
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
                                                        disabled={isReadOnly}
                                                        placeholder="Sélectionnez une date"
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 w-auto">
                                                    <Calendar
                                                        mode="single"
                                                        selected={retour?.commandReceptionDate ? new Date(retour.commandReceptionDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date && !isReadOnly) {
                                                                setRetour(prev => prev ? { ...prev, commandReceptionDate: date } : null);
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
                                                        disabled={isReadOnly}
                                                        placeholder="Sélectionnez une date"
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 w-auto">
                                                    <Calendar
                                                        mode="single"
                                                        selected={retour?.repaymentDate ? new Date(retour.repaymentDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date && !isReadOnly) {
                                                                setRetour(prev => prev ? { ...prev, repaymentDate: date } : null);
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
                                                        disabled={isReadOnly}
                                                        placeholder="Sélectionnez une date"
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 w-auto">
                                                    <Calendar
                                                        mode="single"
                                                        selected={retour?.reexpeditionDate ? new Date(retour.reexpeditionDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date && !isReadOnly) {
                                                                setRetour(prev => prev ? { ...prev, reexpeditionDate: date } : null);
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
                                                {retour?.status && getReturnStatusBadge(retour.status)}
                                            </div>
                                        </div>                                        
                                    </div>

                                    {/* Motif de retour - WYSIWYG */}
                                    <div className="flex flex-col gap-2 mt-6">
                                        <Label className="text-sm text-gray-700 font-bold">Motif de retour</Label>
                                        <WYSIWYG 
                                            key={retour?.id} 
                                            content={retour?.returnReason || ''} 
                                            previewMode={isReadOnly}
                                            placeholder="Saisissez le motif de retour..."
                                            onChange={(value) => {
                                                setRetour(prev => prev ? { ...prev, returnReason: value } : null);
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>                                                                                  
                        </div>                        
                        <div className="flex flex-col gap-4">
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle>
                                    <Heading heading="3" className="text-gray-700 font-bold">Informations du client</Heading>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-gray-700 font-bold">Nom</Label>
                                        <Input value={retour?.client?.lastName || ''} readOnly className="text-sm text-gray-700" disabled={true} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-gray-700 font-bold">Prénom</Label>
                                        <Input value={retour?.client?.firstName || ''} readOnly className="text-sm text-gray-700" disabled={true} />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 mt-6">
                                    <Label className="text-sm text-gray-700 font-bold">Email</Label>
                                    <Input value={retour?.client?.email || ''} readOnly className="text-sm text-gray-700" disabled={true} />
                                </div>

                                <div className="grid grid-cols-2 gap-6 mt-6">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-gray-700 font-bold">Téléphone</Label>
                                        <Input value={retour?.client?.phone || ''} readOnly className="text-sm text-gray-700" disabled={true} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-gray-700 font-bold">Club</Label>
                                        <Input value={retour?.client?.club?.name || ''} readOnly className="text-sm text-gray-700" disabled={true} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>  
                    </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Heading heading="3" className="text-gray-700 font-bold">Liste des produits</Heading>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Statistiques des produits */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{retour?.lines.length || 0}</div>
                                            <div className="text-sm text-gray-600">Produits au total</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {retour?.lines.reduce((sum, line) => sum + line.quantity, 0) || 0}
                                            </div>
                                            <div className="text-sm text-gray-600">Quantité totale</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {retour?.lines.reduce((sum, line) => sum + (line.model.price * line.quantity), 0).toFixed(2) || '0.00'} €
                                            </div>
                                            <div className="text-sm text-gray-600">Valeur totale</div>
                                        </div>
                                    </div>
                                </div>

                                {retour?.type === ReturnType.REPAYMENT || retour?.type === ReturnType.CREDIT ? (
                                    <>
                                        {/* Barre de recherche et pagination améliorée */}
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                                            <div className="flex-1 w-full sm:max-w-md">
                                                <div className="relative">
                                                    <Input 
                                                        placeholder="Rechercher un produit par nom ou code barre..." 
                                                        value={search} 
                                                        onChange={handleSearchChange}
                                                        className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                    />
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600">Page</span>
                                                <Select value={page.toString()} onValueChange={handlePageChange}>
                                                    <SelectTrigger className="w-20 bg-white border-gray-300">
                                                        <SelectValue placeholder="1" />
                                                    </SelectTrigger>
                                                    <SelectContent className="!min-w-0 w-[60px]">
                                                        {Array.from({ length: totalPages }, (_, i) => (
                                                            <SelectItem
                                                                key={i + 1}
                                                                value={String(i + 1)}
                                                                className="text-center"
                                                            >
                                                                {i + 1}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <span className="text-sm text-gray-600">sur {totalPages}</span>
                                            </div>
                                        </div>

                                        {/* Tableau des produits amélioré */}                                        
                                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <Table>
                                                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                    <TableRow className="hover:bg-gray-100">
                                                        <TableHead className="font-semibold text-gray-700 py-4">Produit</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-center">Quantité</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4">Code barre</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-right">Prix unitaire HT</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-right">Prix total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {retour?.lines.map((line) => (
                                                        <TableRow key={line.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                                            <TableCell className="py-4">
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
                                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                                                                    {line.model.codeBar}
                                                                </code>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right font-medium">
                                                                {line.model.price.toFixed(2)} €
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right font-bold text-green-600">
                                                                {(line.model.price * line.quantity).toFixed(2)} €
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>



                                        {/* Résumé détaillé du remboursement */}
                                        <div className="mt-6 space-y-4">
                                            {/* Informations sur l'avoir */}
                                            {retour?.creditNote && (
                                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <TicketCheck className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-blue-800">Informations sur l'avoir</h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                                                            <div className="text-sm font-medium text-blue-600 mb-1">ID Avoir</div>
                                                            <div className="text-lg font-bold text-blue-800">#{retour?.creditNote?.id}</div>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                                                            <div className="text-sm font-medium text-blue-600 mb-1">Montant total</div>
                                                            <div className="text-lg font-bold text-blue-800">{retour?.creditNote?.total.toFixed(2)} €</div>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                                                            <div className="text-sm font-medium text-blue-600 mb-1">Montant restant</div>
                                                            <div className="text-lg font-bold text-blue-800">{retour?.creditNote?.remainingAmount?.toFixed(2) || '0.00'} €</div>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                                                            <div className="text-sm font-medium text-blue-600 mb-1">Type d'avoir</div>
                                                            <div className="flex items-center gap-2">
                                                                {retour?.creditNote?.type === CreditNoteType.CASHBACK ? (
                                                                    <Badge variant="green" className="bg-green-100 text-green-800 border-green-200">Cashback</Badge>
                                                                ) : (
                                                                    <Badge variant="blue" className="bg-blue-100 text-blue-800 border-blue-200">Remboursement</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                                                            <div className="text-sm font-medium text-blue-600 mb-1">Date d'expiration</div>
                                                            <div className="text-sm text-blue-800">
                                                                {retour?.creditNote?.expiredAt ? 
                                                                    new Date(retour?.creditNote?.expiredAt).toLocaleDateString("fr-FR", {
                                                                        day: "2-digit",
                                                                        month: "2-digit",
                                                                        year: "numeric"
                                                                    }) : "Non définie"
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                                                            <div className="text-sm font-medium text-blue-600 mb-1">Statut</div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={retour?.creditNote?.used ? "red" : "green"} 
                                                                       className={retour?.creditNote?.used ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}>
                                                                    {retour?.creditNote?.used ? "Utilisé" : "Disponible"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        {retour?.lines.map((line, index) => (
                                            <div key={line.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 border-b border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                            </svg>
                                                            Échange #{index + 1}
                                                        </h4>
                                                        <Badge variant="orange" className="bg-orange-100 text-orange-800 border-orange-200">
                                                            Échange
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Table>
                                                    <TableHeader className="bg-gray-50">
                                                        <TableRow className="hover:bg-gray-50">
                                                            <TableHead className="font-semibold text-gray-700 py-3">Produit échangé</TableHead>
                                                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Quantité</TableHead>
                                                            <TableHead className="font-semibold text-gray-700 py-3">Code barre</TableHead>
                                                            <TableHead className="font-semibold text-gray-700 py-3">Produit remplacé</TableHead>
                                                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Quantité</TableHead>
                                                            <TableHead className="font-semibold text-gray-700 py-3">Code barre</TableHead>
                                                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <TableRow key={line.id} className="hover:bg-gray-50 transition-colors">
                                                            <TableCell className="py-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <ModelCell model={line.model}/>                                                        
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-center">
                                                                <Badge variant="orange" className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
                                                                    {line.quantity}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                                                                    {line.model.codeBar}
                                                                </code>
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <ModelCell model={line.exchangeModel ?? {
                                                                        name: "Non spécifié",
                                                                        attributs: [],
                                                                        price: 0,
                                                                        image: ""
                                                                    }}/>                                                        
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-center">
                                                                <Badge variant="green" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                                                                    {line.quantity}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                                                                    {line.exchangeModel?.codeBar || "N/A"}
                                                                </code>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-center">
                                                                {!isReadOnly && (
                                                                    <div className="flex justify-center gap-2">
                                                                        <Button 
                                                                            variant="outline" 
                                                                            size="sm" 
                                                                            className="hover:bg-red-50 hover:border-red-200 transition-colors"
                                                                            title="Supprimer l'échange"
                                                                        >
                                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline" 
                                                                            size="sm" 
                                                                            className="hover:bg-green-50 hover:border-green-200 transition-colors"
                                                                            title="Approuver l'échange"
                                                                        >
                                                                            <Check className="w-4 h-4 text-green-500" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>                                        
                </div>
            ) : (
                <div className="flex justify-center items-center py-8">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex flex-row items-center gap-2 bg-red-100 p-4 rounded-md w-full">
                            <AlertTriangle className="w-20 h-20 text-red-500" />
                            <p className="text-sm text-red-500">Une erreur est survenue lors de la récupération du retour, erreur : {ret?.error}</p>
                        </div>
                    </div>
                </div>
            )
        }        
    </div>;
}