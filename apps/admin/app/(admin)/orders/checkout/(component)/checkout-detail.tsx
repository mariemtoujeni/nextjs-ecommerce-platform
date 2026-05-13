'use client'

import { Address, CheckoutPresenter, CheckoutStatus, Client, ClientFilterTypeAdmin, ClientType, Club, CreateCheckoutLineRequest, CreateCheckoutRequest, DiscountType, ModelWithProduct, PaymentMethod, Shop, ShopPresenter, ShopStatus } from "@repo/core/models"
import { ReturnAll } from "@repo/core/types";
import { useState, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Heading, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table"
import React from "react";
import { ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "~/components/ui/command";
import { getAllProductModelsAction } from "@repo/actions/product-models";
import { TableSummaryModels } from "~/components/TableSummaryModels";
import { getAllClientAction } from "@repo/actions/clients";
import { ProductSearchBar } from "~/components/ProductSearchBar";
import { useToast } from "~/hooks/use-toast";

export interface CheckoutDetailViewProps {
    checkout?: CheckoutPresenter
    isEditable: boolean
    isNew: boolean
    products?: ReturnAll<ModelWithProduct>
    clients?: ReturnAll<Client>
    clubs?: ReturnAll<Client>
    shops?: ReturnAll<Shop>
    onCheckoutChange?: (checkout: CheckoutPresenter) => void
    onCheckoutToCreateChange?: (checkoutToCreate: CreateCheckoutRequest) => void
}
export const CheckoutDetailView : React.FunctionComponent<CheckoutDetailViewProps> = ({checkout, isEditable, isNew, products: initialProducts, clients: initialClients, clubs: initialClubs, shops: initialShops, onCheckoutChange, onCheckoutToCreateChange}) => {
    const defaultShop : ShopPresenter = {
        id: 0,
        name: '',
        expirationDate: new Date(),
        isActive: false,
        createdAt: new Date(),
        status: ShopStatus.OPEN,
        department: '',
    }

    const defaultClub : Club = {
        id: 0,
        name: '',
        president: '',
        email: '',
        accountantAccount: '',
        paymentMode: 0,
        paymentDelay: 0,
        phone: '',
        partner: false,
        referent: "",
        code: "",
        valid: false,
        siren: "",
        tvaNumber: ""
    }

    const defaultClientAddress : Address = {
        id: 0,
        numero_client: 0,
        designation: "",
        civilite: "",
        nom: "",
        prenom: "",
        adresse: "",
        adresse2: "",
        adresse3: "",
        code_postal: "",
        ville: "",
        pays: "",
        interphone: "",
        code_porte: "",
        instructions: "",
        default: false,
        created_at: new Date(),
        updated_at: new Date(),
        societe: ""
    }

    const defaultClient : Client = {
        clientNumber: 0,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        mobilePhone: '',
        workPhone: '',
        clubMemberId: 0,
        clubId: 0,
        club: defaultClub,
        type: ClientType.CLIENT,
        lang: 'fr',
        birthDate: new Date(),
        newsLetter: false,
        siteOffer: false,
        partnerOffer: false,
        fidelityPoints: 0,
        credit: 0,
        clientAddress: [defaultClientAddress],
        order: [],
        quotation: [],
        createdAt: new Date(),
        userId: ''
    }

    const defaultCheckout : CreateCheckoutRequest = {
        idClient: defaultClient.clientNumber,
        idShop: defaultShop.id,
        paymentMethod: PaymentMethod.CASH,
        discountType: DiscountType.PERCENTAGE,
        discountAmount: '0',
        totalHT: '0',
        totalTTC: '0',
        cbAmount: '0',
        cashAmount: '0',
        checkAmount: '0',
        NoVAT: false,
        status: CheckoutStatus.OPEN,
        lines: [] as CreateCheckoutLineRequest[],
        shop: defaultShop,
        client: defaultClient            
    }

    const [clubs, setClubs] = useState<Client[] | undefined>(initialClubs?.items);
    const [clients, setClients] = useState<Client[] | undefined>(initialClients?.items);
    
    // Initialize checkout with first available shop if no checkout is provided
    const getInitialCheckout = () => {
        if (checkout) {
            return {
                ...checkout,
                lines: checkout.lines?.map((line) => ({
                    ...line,
                })) ?? []
            };
        }
        
        // Use first available shop if shops are provided, otherwise use default
        const firstShop = initialShops?.items && initialShops.items.length > 0 ? initialShops.items[0] : defaultShop;
        
        if (!firstShop) {
            return defaultCheckout;
        }
        
        return {
            ...defaultCheckout,
            idShop: firstShop.id,
            shop: firstShop
        };
    };
    
    const [checkoutToCreate, setCheckoutToCreate] = useState<CreateCheckoutRequest | undefined>(getInitialCheckout());
    const [models, setModels] = useState<ModelWithProduct[] | undefined>(initialProducts?.items);
    const [openClientPopover, setOpenClientPopover] = useState(false);
    const [openClubPopover, setOpenClubPopover] = useState(false);
    const [openShopPopover, setOpenShopPopover] = useState(false);
    const [vat, setVat] = useState<number>(20);
    const { toast } = useToast();

    // Initialize with first shop and trigger calculations
    useEffect(() => {
        if (initialShops?.items && initialShops.items.length > 0 && !checkout) {
            const firstShop = initialShops.items[0];
            if (firstShop) {
                const newCheckoutToCreate: CreateCheckoutRequest = {
                    ...defaultCheckout,
                    idShop: firstShop.id,
                    shop: firstShop,
                    lines: [],
                    totalHT: '0',
                    totalTTC: '0',
                    cbAmount: '0',
                    cashAmount: '0',
                    checkAmount: '0',
                    discountType: DiscountType.PERCENTAGE,
                    discountAmount: '0',
                    idClient: defaultClient.clientNumber,
                    paymentMethod: PaymentMethod.CASH,
                    NoVAT: false,
                    status: CheckoutStatus.OPEN,
                    client: defaultClient
                };
                
                setCheckoutToCreate(newCheckoutToCreate);
                onCheckoutToCreateChange?.(newCheckoutToCreate);
            }
        }
    }, [initialShops, checkout, onCheckoutToCreateChange]);

    const searchProducts = async (searchRequest: string) => {        
        const models = await getAllProductModelsAction({sort: 'asc', search: searchRequest});
        setModels(models.items);
    }

    const handleUserSearch = async (searchRequest: string) => {
        const timer = setTimeout(async () => {
            const providedClients = await getAllClientAction({search: searchRequest, sort: 'asc', filters: [ { key: ClientFilterTypeAdmin.TYPE, values: [ClientType.CLIENT], }, ]});
            setClients(providedClients.items);
        }, 500);
        return () => clearTimeout(timer);        
    }

    const handleClubSearch = async (searchRequest: string) => {
        const timer = setTimeout(async () => {
            const providedClubs = await getAllClientAction({search: searchRequest, sort: 'asc', filters: [ { key: ClientFilterTypeAdmin.TYPE, values: [ClientType.CLUB], }, ]});
            setClubs(providedClubs.items);
        }, 500);
        return () => clearTimeout(timer);        
    }

    if(initialProducts && (initialProducts.error || !initialProducts.items)) {
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la récupération des modèles, erreur : " + (initialProducts.error || "Aucun modèle trouvé"),
            variant: "destructive",
        });
    }

    if(initialClients && (initialClients.error || !initialClients.items)) {
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la récupération des clients, erreur : " + (initialClients.error || "Aucun client trouvé"),
            variant: "destructive",
        });
    }

    if(initialClubs && (initialClubs.error || !initialClubs.items)) {
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la récupération des clubs, erreur : " + (initialClubs.error || "Aucun club trouvé"),
            variant: "destructive",
        });
    }

    if(initialShops && (initialShops.error || !initialShops.items)) {
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la récupération des magasins, erreur : " + (initialShops.error || "Aucun magasin trouvé"),
            variant: "destructive",
        });
    }
    
    return <div className="flex flex-row gap-7 w-full">
        <div className="flex flex-col gap-1 mt-1 pb-5 w-2/3">    
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>
                        <Heading heading="3" className="text-gray-700 font-bold">{ isEditable ? "Modèles à ajouter" : "Modèles"}</Heading>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-7">
                        <ProductSearchBar 
                            purpose="checkout"
                            checkoutToCreate={checkoutToCreate} 
                            onCheckoutToCreateChange={(checkoutToCreate: CreateCheckoutRequest) => {
                                const cbAmount = (Number(checkoutToCreate.totalTTC) - Number(checkoutToCreate.cashAmount) - Number(checkoutToCreate.checkAmount)).toFixed(2);
                                checkoutToCreate.cbAmount = cbAmount;
                                setCheckoutToCreate(checkoutToCreate);
                                onCheckoutToCreateChange?.(checkoutToCreate);
                            }} 
                            initialProducts={initialProducts} 
                            isEditable={isEditable} 
                            models={models}
                        />
                        <div className="border rounded-lg">                            
                            <TableSummaryModels 
                                isEditable={isEditable} 
                                checkout={checkout} 
                                checkoutToCreate={checkoutToCreate} 
                                onCreateCheckoutChange={(checkoutToCreate: CreateCheckoutRequest) => {
                                    const cbAmount = (Number(checkoutToCreate.totalTTC) - Number(checkoutToCreate.cashAmount) - Number(checkoutToCreate.checkAmount)).toFixed(2);
                                    checkoutToCreate.cbAmount = cbAmount;
                                    setCheckoutToCreate(checkoutToCreate);
                                    onCheckoutToCreateChange?.(checkoutToCreate);
                                }} 
                                onDeleteCheckoutLine={(idModel: number) => {
                                    if(checkoutToCreate) {
                                        const newCheckoutToCreate : CreateCheckoutRequest = {
                                            ...checkoutToCreate,
                                            lines: checkoutToCreate?.lines?.filter((line) => line.idModel !== idModel) ?? []
                                        }
                                        const cbAmount = (Number(newCheckoutToCreate.totalTTC) - Number(newCheckoutToCreate.cashAmount) - Number(newCheckoutToCreate.checkAmount)).toFixed(2);
                                        newCheckoutToCreate.cbAmount = cbAmount;
                                        setCheckoutToCreate(newCheckoutToCreate);
                                        onCheckoutToCreateChange?.(newCheckoutToCreate);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>            
            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>
                        <Heading heading="3" className="text-gray-700 font-bold">Réduction</Heading>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row gap-7 w-full">
                        <div className="flex flex-col gap-2 w-1/2">
                            <Label htmlFor="discount-type" className="text-sm text-gray-700">Type de réduction</Label>
                            <Select disabled={!isEditable} value={checkout ? checkout.discountType : (checkoutToCreate?.discountType ?? DiscountType.PERCENTAGE)} onValueChange={(value) => {
                                const newCheckoutToCreate : CreateCheckoutRequest = {
                                    ...checkoutToCreate,
                                    discountType: value as DiscountType,
                                    idClient: checkoutToCreate?.client?.clientNumber ?? 0,
                                    idShop: checkoutToCreate?.shop?.id ?? 0,     
                                    paymentMethod: checkoutToCreate?.paymentMethod ?? PaymentMethod.CASH,
                                    discountAmount: checkoutToCreate?.discountAmount ?? '0',
                                    totalHT: checkoutToCreate?.totalHT ?? '0',
                                    totalTTC: checkoutToCreate?.totalTTC ?? '0',
                                    cbAmount: checkoutToCreate?.cbAmount ?? '0',
                                    cashAmount: checkoutToCreate?.cashAmount ?? '0',
                                    checkAmount: checkoutToCreate?.checkAmount ?? '0',
                                    NoVAT: checkoutToCreate?.NoVAT ?? false,
                                    VAT: checkoutToCreate?.VAT ?? vat,
                                    status: checkoutToCreate?.status ?? CheckoutStatus.OPEN,
                                    lines: checkoutToCreate?.lines?.map((line) => ({
                                        ...line,
                                    })) ?? [],
                                    shop: checkoutToCreate?.shop ?? defaultShop,
                                    client: checkoutToCreate?.client ?? defaultClient
                                }
                                const totalWithoutDiscount = newCheckoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0;
                                const totalDiscountProduct = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0;
                                const totalDiscountGlobal = newCheckoutToCreate.discountType === DiscountType.FIXED ? parseFloat(newCheckoutToCreate.discountAmount) : (totalWithoutDiscount - totalDiscountProduct) * parseFloat(newCheckoutToCreate.discountAmount) / 100;
                                newCheckoutToCreate.totalTTC = (totalWithoutDiscount - totalDiscountProduct - totalDiscountGlobal).toString();
                                const totalWithoutVAT = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.price * line.quantity - line.price * line.quantity * line.VAT / 100), 0) ?? 0;
                                newCheckoutToCreate.totalHT =  (totalWithoutVAT -  totalDiscountProduct - totalDiscountGlobal).toString();
                                newCheckoutToCreate.cbAmount = (Number(newCheckoutToCreate.totalTTC) - Number(newCheckoutToCreate.cashAmount) - Number(newCheckoutToCreate.checkAmount)).toFixed(2);
                                setCheckoutToCreate(newCheckoutToCreate);
                                onCheckoutToCreateChange?.(newCheckoutToCreate);
                            }}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Type de remise" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={DiscountType.PERCENTAGE}>%</SelectItem>
                                    <SelectItem value={DiscountType.FIXED}>€</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2 w-1/2">
                            <Label htmlFor="discount" className="text-sm text-gray-700">Valeur de la réduction</Label>
                            <Input type="number" min={0} disabled={!isEditable} value={isEditable ? checkoutToCreate?.discountAmount ?? 0 : checkout?.discountAmount ?? 0} onChange={(e) => {
                                const newCheckoutToCreate : CreateCheckoutRequest = {
                                    ...checkoutToCreate,
                                    discountAmount: e.target.value.toString(),
                                    idClient: checkoutToCreate?.client?.clientNumber ?? 0,
                                    idShop: checkoutToCreate?.shop?.id ?? 0,     
                                    paymentMethod: checkoutToCreate?.paymentMethod ?? PaymentMethod.CASH,
                                    discountType: checkoutToCreate?.discountType ?? DiscountType.PERCENTAGE,
                                    totalHT: checkoutToCreate?.totalHT ?? '0',
                                    totalTTC: checkoutToCreate?.totalTTC ?? '0',
                                    cbAmount: checkoutToCreate?.cbAmount ?? '0',
                                    cashAmount: checkoutToCreate?.cashAmount ?? '0',
                                    checkAmount: checkoutToCreate?.checkAmount ?? '0',
                                    NoVAT: checkoutToCreate?.NoVAT ?? false,
                                    VAT: checkoutToCreate?.VAT ?? vat,
                                    status: checkoutToCreate?.status ?? CheckoutStatus.OPEN,
                                    lines: checkoutToCreate?.lines?.map((line) => ({
                                        ...line,
                                    })) ?? [],
                                    shop: checkoutToCreate?.shop ?? defaultShop,
                                    client: checkoutToCreate?.client ?? defaultClient
                                }
                                const totalWithoutDiscount = newCheckoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0;
                                const totalDiscountProduct = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0;
                                const totalDiscountGlobal = newCheckoutToCreate.discountType === DiscountType.FIXED ? parseFloat(newCheckoutToCreate.discountAmount) : (totalWithoutDiscount - totalDiscountProduct) * parseFloat(newCheckoutToCreate.discountAmount) / 100;
                                
                                newCheckoutToCreate.totalHT = (totalWithoutDiscount - totalDiscountProduct - totalDiscountGlobal).toString();
                                const totalWithoutVAT = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.price * line.quantity + line.price * line.quantity * vat / 100), 0) ?? 0;
                                newCheckoutToCreate.totalTTC =  (totalWithoutVAT -  totalDiscountProduct - totalDiscountGlobal).toString();
                                newCheckoutToCreate.cbAmount = (Number(newCheckoutToCreate.totalTTC) - Number(newCheckoutToCreate.cashAmount) - Number(newCheckoutToCreate.checkAmount)).toFixed(2);
                                setCheckoutToCreate(newCheckoutToCreate);
                                onCheckoutToCreateChange?.(newCheckoutToCreate);
                            }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>
                        <Heading heading="3" className="text-gray-700 font-bold">TVA</Heading>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row gap-7 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <Label htmlFor="tva" className="text-sm text-gray-700">TVA (%)</Label>
                            <Input type="number" max={20} min={0} disabled={!isEditable} value={vat} onChange={(e) => {
                                e.stopPropagation();
                                setVat( parseFloat(e.target.value) );
                                const newCheckoutToCreate : CreateCheckoutRequest = {
                                    ...checkoutToCreate,
                                    discountAmount: checkoutToCreate?.discountAmount ?? '0',
                                    idClient: checkoutToCreate?.client?.clientNumber ?? 0,
                                    idShop: checkoutToCreate?.shop?.id ?? 0,     
                                    paymentMethod: checkoutToCreate?.paymentMethod ?? PaymentMethod.CASH,
                                    discountType: checkoutToCreate?.discountType ?? DiscountType.PERCENTAGE,
                                    totalHT: checkoutToCreate?.totalHT ?? '0',
                                    totalTTC: checkoutToCreate?.totalTTC ?? '0',
                                    cbAmount: checkoutToCreate?.cbAmount ?? '0',
                                    cashAmount: checkoutToCreate?.cashAmount ?? '0',
                                    checkAmount: checkoutToCreate?.checkAmount ?? '0',
                                    NoVAT: e.target.value.toString() === '0',
                                    VAT: parseFloat(e.target.value),
                                    status: checkoutToCreate?.status ?? CheckoutStatus.OPEN,
                                    lines: checkoutToCreate?.lines?.map((line) => ({
                                        ...line,
                                        VAT: parseFloat(e.target.value)
                                    })) ?? [],
                                    shop: checkoutToCreate?.shop ?? defaultShop,
                                    client: checkoutToCreate?.client ?? defaultClient
                                }

                                const totalWithoutDiscount = newCheckoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0;
                                const totalDiscountProduct = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0;
                                const totalDiscountGlobal = newCheckoutToCreate.discountType === DiscountType.FIXED ? parseFloat(newCheckoutToCreate.discountAmount) : (totalWithoutDiscount - totalDiscountProduct) * parseFloat(newCheckoutToCreate.discountAmount) / 100;
                                
                                newCheckoutToCreate.totalHT = (totalWithoutDiscount - totalDiscountProduct - totalDiscountGlobal).toString();
                                const totalWithoutVAT = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.price * line.quantity + line.price * line.quantity * parseFloat(e.target.value) / 100), 0) ?? 0;
                                newCheckoutToCreate.totalTTC =  (totalWithoutVAT -  totalDiscountProduct - totalDiscountGlobal).toString();                
                                newCheckoutToCreate.cbAmount = (Number(newCheckoutToCreate.totalTTC) - Number(newCheckoutToCreate.cashAmount) - Number(newCheckoutToCreate.checkAmount)).toFixed(2);                
                                setCheckoutToCreate(newCheckoutToCreate);
                                onCheckoutToCreateChange?.(newCheckoutToCreate);
                            }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>
                        <Heading heading="3" className="text-gray-700 font-bold">Synthèse</Heading>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg p-2 w-full">
                        <Table className="w-full">
                            <TableBody>
                                {
                                    
                                    checkout && checkout.status === CheckoutStatus.CLOSED && checkout.lines?.map((line) => (
                                        <TableRow className="border-none" key={line.id}>
                                            <TableCell  className="w-1/4 border-none">{line.modelProduct?.name}</TableCell>
                                            <TableCell className="w-1/4 border-none">{line.modelProduct?.price} €</TableCell>
                                            <TableCell className="w-1/4 border-none">{`${line.quantity > 1 ? `${line.quantity} articles` : `${line.quantity} article`}`}</TableCell>                                        
                                            <TableCell className="w-1/4 border-none text-right">{`${(line.price * line.quantity - (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity)).toFixed(2)} €`}</TableCell>
                                        </TableRow>
                                    ))
                                }
                                {/* Sous-total */}
                                <TableRow className="border-none">
                                    <TableCell className="w-1/4 border-none">Total HT</TableCell>
                                    <TableCell className="w-1/4 border-none"></TableCell>
                                    <TableCell className="w-1/4 border-none">
                                        {
                                            isEditable ?
                                                checkoutToCreate && checkoutToCreate.lines && `${checkoutToCreate.lines.reduce((acc, line) => acc + line.quantity, 0)} ${checkoutToCreate.lines.reduce((acc, line) => acc + line.quantity, 0) > 1 ? "articles" : "article"}`
                                            :
                                                checkout && checkout.lines && `${checkout.lines.reduce((acc, line) => acc + line.quantity, 0)} ${checkout.lines.reduce((acc, line) => acc + line.quantity, 0) > 1 ? "articles" : "article"}`
                                        }
                                    </TableCell>
                                    <TableCell className="w-1/4 border-none text-right">
                                        {
                                            isEditable ?
                                                checkoutToCreate && checkoutToCreate.lines && `${(checkoutToCreate.lines.reduce((acc, line) => acc + line.price * line.quantity - (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0)).toFixed(2)} €`
                                            :
                                                checkout && checkout.lines && `${(checkout.lines.reduce((acc, line) => acc + line.price * line.quantity - (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0)).toFixed(2)} €`
                                        }
                                    </TableCell>
                                </TableRow>
                                {/* Réduction */}
                                <TableRow className="border-none">
                                    <TableCell className="w-1/4 border-none">Réduction</TableCell>
                                    <TableCell className="w-1/4 border-none"></TableCell>
                                    <TableCell className="w-1/4 border-none"></TableCell>
                                    <TableCell className="w-1/4 border-none text-right">-{
                                        isEditable ? // discount summarise global discount of the checkout and the sum of the discount of each line (if percentage)
                                            checkoutToCreate && ((
                                                checkoutToCreate.discountType === DiscountType.FIXED ? parseFloat(checkoutToCreate.discountAmount) 
                                                : 
                                                (checkoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) - checkoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0)) * parseFloat(checkoutToCreate.discountAmount) / 100) 
                                                + (checkoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0)).toFixed(2)
                                        :
                                            checkout && (
                                                checkout.discountType === DiscountType.FIXED ? 
                                                    parseFloat(checkout.discountAmount ?? '0').toFixed(2) 
                                                :
                                                    ((parseFloat(checkout.discountAmount ?? '0') / 100) * (
                                                        checkout.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0
                                                    )).toFixed(2)
                                            )
                                    } €</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="w-1/4 border-none">TVA</TableCell>
                                    <TableCell className="w-1/4 border-none"></TableCell>
                                    <TableCell className="w-1/4 border-none"></TableCell>
                                    <TableCell className="w-1/4 border-none text-right">{
                                        isEditable ?
                                            checkoutToCreate && checkoutToCreate.lines && (
                                                (
                                                    checkoutToCreate.lines.reduce(
                                                        (acc, line) =>
                                                            acc +
                                                            line.price * line.quantity -
                                                            (line.discountType === DiscountType.PERCENTAGE
                                                                ? line.price * line.quantity * parseFloat(line.discount) / 100
                                                                : parseFloat(line.discount) * line.quantity),
                                                        0
                                                    ) *
                                                    (parseFloat(String(checkoutToCreate.VAT ?? vat)) / 100)
                                                ).toFixed(2)
                                            )
                                        :
                                            checkout && (parseFloat(checkout.totalTTC) - parseFloat(checkout.totalHT)).toFixed(2)
                                    } €</TableCell>
                                </TableRow>
                                {/* Total */}
                                <TableRow>
                                    <TableCell className="w-1/4 ">Total TTC</TableCell>
                                    <TableCell className="w-1/4"></TableCell>
                                    <TableCell className="w-1/4"></TableCell>
                                    <TableCell className="w-1/4 text-right">{
                                        isEditable ?
                                            checkoutToCreate && checkoutToCreate.lines &&
                                            (
                                                checkoutToCreate.lines.reduce(
                                                    (acc, line) =>
                                                        acc +
                                                        line.price * line.quantity -
                                                        (line.discountType === DiscountType.PERCENTAGE
                                                            ? line.price * line.quantity * parseFloat(line.discount) / 100
                                                            : parseFloat(line.discount) * line.quantity),
                                                    0
                                                ) *
                                                (parseFloat(String(checkoutToCreate.VAT ?? vat)) / 100) 
                                                + checkoutToCreate.lines.reduce(
                                                    (acc, line) =>
                                                        acc +
                                                        line.price * line.quantity -
                                                        (line.discountType === DiscountType.PERCENTAGE
                                                            ? line.price * line.quantity * parseFloat(line.discount) / 100
                                                            : parseFloat(line.discount) * line.quantity),
                                                    0
                                                 ) - (checkoutToCreate.discountType === DiscountType.FIXED ?
                                                parseFloat(checkoutToCreate.discountAmount) 
                                                : 
                                                (checkoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) - checkoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0)) * parseFloat(checkoutToCreate.discountAmount) / 100) 
                                                + (checkoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0)
                                            ).toFixed(2)
                                        :
                                            checkout && parseFloat(checkout.totalTTC).toFixed(2)
                                    } €</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>
                        <Heading heading="3" className="text-gray-700 font-bold">Informations de paiement</Heading>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row gap-7 w-full">
                        <div className="flex flex-col gap-2 w-1/3">
                            <Label htmlFor="payment-method" className="text-sm text-gray-700">Montant carte bancaire</Label>
                            <Input type="number" disabled={!isEditable} value={isEditable ? checkoutToCreate?.cbAmount ?? 0 : checkout?.cbAmount ?? 0} onChange={(e) => {
                                const newCheckoutToCreate : CreateCheckoutRequest = {
                                    ...checkoutToCreate,
                                    cbAmount: e.target.value.toString(),
                                    idClient: checkoutToCreate?.client?.clientNumber ?? 0,
                                    idShop: checkoutToCreate?.shop?.id ?? 0,     
                                    paymentMethod: checkoutToCreate?.paymentMethod ?? PaymentMethod.CASH,
                                    discountType: checkoutToCreate?.discountType ?? DiscountType.PERCENTAGE,
                                    discountAmount: checkoutToCreate?.discountAmount ?? '0', 
                                    cashAmount: checkoutToCreate?.cashAmount ?? '0',
                                    checkAmount: checkoutToCreate?.checkAmount ?? '0',
                                    NoVAT: checkoutToCreate?.NoVAT ?? false,
                                    totalHT: checkoutToCreate?.totalHT ?? '0',
                                    totalTTC: checkoutToCreate?.totalTTC ?? '0',
                                    status: checkoutToCreate?.status ?? CheckoutStatus.OPEN,
                                    lines: checkoutToCreate?.lines?.map((line) => ({
                                        ...line,
                                    })) ?? [],
                                    shop: checkoutToCreate?.shop ?? defaultShop,
                                    client: checkoutToCreate?.client ?? defaultClient
                                }
                                const totalWithoutDiscount = newCheckoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0;
                                const totalDiscountProduct = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0;
                                const totalDiscountGlobal = newCheckoutToCreate.discountType === DiscountType.FIXED ? parseFloat(newCheckoutToCreate.discountAmount) : (totalWithoutDiscount - totalDiscountProduct) * parseFloat(newCheckoutToCreate.discountAmount) / 100;
                                
                                newCheckoutToCreate.totalHT = (totalWithoutDiscount - totalDiscountProduct - totalDiscountGlobal).toString();
                                const totalWithoutVAT = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.price * line.quantity + line.price * line.quantity * vat / 100), 0) ?? 0;
                                newCheckoutToCreate.totalTTC =  (totalWithoutVAT -  totalDiscountProduct - totalDiscountGlobal).toString();                                
                                newCheckoutToCreate.cbAmount = (Number(newCheckoutToCreate.totalTTC) - Number(newCheckoutToCreate.cashAmount) - Number(newCheckoutToCreate.checkAmount)).toFixed(2);                

                                setCheckoutToCreate(newCheckoutToCreate);
                                onCheckoutToCreateChange?.(newCheckoutToCreate);
                            }} />
                        </div>
                        <div className="flex flex-col gap-2 w-1/3">
                            <Label htmlFor="payment-method" className="text-sm text-gray-700">Montant chèque</Label>
                            <Input type="number" disabled={!isEditable} value={isEditable ? checkoutToCreate?.checkAmount ?? 0 : checkout?.checkAmount ?? 0} onChange={(e) => {
                                const newCheckoutToCreate : CreateCheckoutRequest = {
                                    ...checkoutToCreate,
                                    checkAmount: e.target.value.toString(),
                                    idClient: checkoutToCreate?.client?.clientNumber ?? 0,
                                    idShop: checkoutToCreate?.shop?.id ?? 0,     
                                    paymentMethod: checkoutToCreate?.paymentMethod ?? PaymentMethod.CASH,
                                    discountType: checkoutToCreate?.discountType ?? DiscountType.PERCENTAGE,
                                    discountAmount: checkoutToCreate?.discountAmount ?? '0', 
                                    cashAmount: checkoutToCreate?.cashAmount ?? '0',
                                    NoVAT: checkoutToCreate?.NoVAT ?? false,
                                    totalHT: checkoutToCreate?.totalHT ?? '0',
                                    totalTTC: checkoutToCreate?.totalTTC ?? '0',
                                    cbAmount: checkoutToCreate?.cbAmount ?? '0',
                                    status: checkoutToCreate?.status ?? CheckoutStatus.OPEN,
                                    lines: checkoutToCreate?.lines?.map((line) => ({
                                        ...line,
                                    })) ?? [],
                                    shop: checkoutToCreate?.shop ?? defaultShop,
                                    client: checkoutToCreate?.client ?? defaultClient
                                }

                                const totalWithoutDiscount = newCheckoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0;
                                const totalDiscountProduct = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0;
                                const totalDiscountGlobal = newCheckoutToCreate.discountType === DiscountType.FIXED ? parseFloat(newCheckoutToCreate.discountAmount) : (totalWithoutDiscount - totalDiscountProduct) * parseFloat(newCheckoutToCreate.discountAmount) / 100;
                                
                                newCheckoutToCreate.totalHT = (totalWithoutDiscount - totalDiscountProduct - totalDiscountGlobal).toString();
                                const totalWithoutVAT = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.price * line.quantity + line.price * line.quantity * vat / 100), 0) ?? 0;
                                newCheckoutToCreate.totalTTC =  (totalWithoutVAT -  totalDiscountProduct - totalDiscountGlobal).toString();                                
                                newCheckoutToCreate.cbAmount = (Number(newCheckoutToCreate.totalTTC) - Number(newCheckoutToCreate.cashAmount) - Number(newCheckoutToCreate.checkAmount)).toFixed(2);                

                                setCheckoutToCreate(newCheckoutToCreate);
                                onCheckoutToCreateChange?.(newCheckoutToCreate);
                            }} />
                        </div>
                        <div className="flex flex-col gap-2 w-1/3">
                            <Label htmlFor="payment-method" className="text-sm text-gray-700">Montant espèces</Label>
                            <Input type="number" disabled={!isEditable} value={isEditable ? checkoutToCreate?.cashAmount ?? 0 : checkout?.cashAmount ?? 0} onChange={(e) => {
                                const newCheckoutToCreate : CreateCheckoutRequest = {
                                    ...checkoutToCreate,
                                    cashAmount: e.target.value.toString(),
                                    idClient: checkoutToCreate?.client?.clientNumber ?? 0,
                                    idShop: checkoutToCreate?.shop?.id ?? 0,     
                                    paymentMethod: checkoutToCreate?.paymentMethod ?? PaymentMethod.CASH,
                                    discountType: checkoutToCreate?.discountType ?? DiscountType.PERCENTAGE,
                                    discountAmount: checkoutToCreate?.discountAmount ?? '0', 
                                    checkAmount: checkoutToCreate?.checkAmount ?? '0',
                                    NoVAT: checkoutToCreate?.NoVAT ?? false,
                                    totalHT: checkoutToCreate?.totalHT ?? '0',
                                    totalTTC: checkoutToCreate?.totalTTC ?? '0',
                                    cbAmount: checkoutToCreate?.cbAmount ?? '0',
                                    status: checkoutToCreate?.status ?? CheckoutStatus.OPEN,
                                    lines: checkoutToCreate?.lines?.map((line) => ({
                                        ...line,
                                    })) ?? [],
                                    shop: checkoutToCreate?.shop ?? defaultShop,
                                    client: checkoutToCreate?.client ?? defaultClient
                                }

                                const totalWithoutDiscount = newCheckoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0;
                                const totalDiscountProduct = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0;
                                const totalDiscountGlobal = newCheckoutToCreate.discountType === DiscountType.FIXED ? parseFloat(newCheckoutToCreate.discountAmount) : (totalWithoutDiscount - totalDiscountProduct) * parseFloat(newCheckoutToCreate.discountAmount) / 100;
                                
                                newCheckoutToCreate.totalHT = (totalWithoutDiscount - totalDiscountProduct - totalDiscountGlobal).toString();
                                const totalWithoutVAT = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.price * line.quantity + line.price * line.quantity * vat / 100), 0) ?? 0;
                                newCheckoutToCreate.totalTTC =  (totalWithoutVAT -  totalDiscountProduct - totalDiscountGlobal).toString();                                
                                newCheckoutToCreate.cbAmount = (Number(newCheckoutToCreate.totalTTC) - Number(newCheckoutToCreate.cashAmount) - Number(newCheckoutToCreate.checkAmount)).toFixed(2);                

                                setCheckoutToCreate(newCheckoutToCreate);
                                onCheckoutToCreateChange?.(newCheckoutToCreate);
                            }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="flex flex-col gap-1 mt-1 pb-5 w-1/3">
            <Card className="mt-8 h-fit">
                <CardHeader>
                    <CardTitle>
                        <Heading heading="3" className="text-gray-700 font-bold">Point de vente <span className="text-red-500">*</span></Heading>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row gap-7 w-full">
                        {
                            isNew ?
                                <Popover open={openShopPopover} onOpenChange={setOpenShopPopover}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" aria-expanded={openShopPopover ? true : false} className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500">                                            
                                            {checkoutToCreate?.shop && checkoutToCreate.shop?.name ? checkoutToCreate.shop.name : "Sélectionner un point de vente..."}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0 max-h-[200px] overflow-y-auto">
                                        <Command>
                                            <CommandInput placeholder="Rechercher un point de vente..." className="h-9" />
                                            <CommandEmpty>Aucun point de vente trouvé</CommandEmpty>
                                            <CommandGroup>
                                                {
                                                    initialShops?.items.map((shop) => (
                                                        <CommandItem key={shop.id} value={shop.name} onSelect={() => {
                                                            setOpenShopPopover(false);
                                                            const newCheckoutToCreate : CreateCheckoutRequest = {
                                                                ...checkoutToCreate,
                                                                idShop: shop.id,
                                                                shop: shop,
                                                                lines: checkoutToCreate?.lines?.map((line) => ({
                                                                    ...line,
                                                                })) ?? [],
                                                                totalHT: checkoutToCreate?.totalHT ?? '0',
                                                                totalTTC: checkoutToCreate?.totalTTC ?? '0',
                                                                cbAmount: checkoutToCreate?.cbAmount ?? '0',
                                                                cashAmount: checkoutToCreate?.cashAmount ?? '0',
                                                                checkAmount: checkoutToCreate?.checkAmount ?? '0',
                                                                discountType: checkoutToCreate?.discountType ?? DiscountType.PERCENTAGE,
                                                                discountAmount: checkoutToCreate?.discountAmount ?? '0',
                                                                idClient: checkoutToCreate?.client?.clientNumber ?? 0,
                                                                paymentMethod: checkoutToCreate?.paymentMethod ?? PaymentMethod.CASH,
                                                                NoVAT: checkoutToCreate?.NoVAT ?? false,
                                                                status: checkoutToCreate?.status ?? CheckoutStatus.OPEN,
                                                                client: checkoutToCreate?.client ?? defaultClient
                                                            };

                                                            const totalWithoutDiscount = newCheckoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0;
                                                            const totalDiscountProduct = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0;
                                                            const totalDiscountGlobal = newCheckoutToCreate.discountType === DiscountType.FIXED ? parseFloat(newCheckoutToCreate.discountAmount) : (totalWithoutDiscount - totalDiscountProduct) * parseFloat(newCheckoutToCreate.discountAmount) / 100;
                                                            
                                                            newCheckoutToCreate.totalHT = (totalWithoutDiscount - totalDiscountProduct - totalDiscountGlobal).toString();
                                                            const totalWithoutVAT = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.price * line.quantity + line.price * line.quantity * vat / 100), 0) ?? 0;
                                                            newCheckoutToCreate.totalTTC =  (totalWithoutVAT -  totalDiscountProduct - totalDiscountGlobal).toString();                                
                                                            newCheckoutToCreate.cbAmount = (Number(newCheckoutToCreate.totalTTC) - Number(newCheckoutToCreate.cashAmount) - Number(newCheckoutToCreate.checkAmount)).toFixed(2);                
                                                            setCheckoutToCreate(newCheckoutToCreate);
                                                            onCheckoutToCreateChange?.(newCheckoutToCreate);
                                                            searchProducts('');
                                                        }}>
                                                            {shop.name} ({shop.department} - {new Date(shop.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                                                        </CommandItem>
                                                    ))
                                                }
                                            </CommandGroup>
                                        </Command>                                        
                                    </PopoverContent>
                                </Popover>
                            :
                                <Input type="text" disabled={true} value={checkout?.shop?.name ?? ''}/>
                        }
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>
                        <Heading heading="3" className="text-gray-700 font-bold">Client</Heading>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-7 w-full">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="client-name" className="text-sm text-gray-700">Adresse email du client</Label>
                            {
                                isEditable ?
                                    <Popover open={openClientPopover} onOpenChange={setOpenClientPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openClientPopover ? true : false}
                                                className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500"
                                            >
                                                {checkoutToCreate?.client && checkoutToCreate?.client.clientNumber !== 0 ? checkoutToCreate?.client.email : "Sélectionner un utilisateur..."}
                                                <ChevronsUpDown className="opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0 max-h-[200px] overflow-y-auto">
                                            <Command>
                                                <CommandInput 
                                                    placeholder="Rechercher un utilisateur..." 
                                                    className="h-9" 
                                                    onValueChange={async (value) => {
                                                        await handleUserSearch(value);
                                                    }}
                                                />
                                                <CommandEmpty>Aucun utilisateur trouvé</CommandEmpty>
                                                <CommandGroup>
                                                    {
                                                        clients?.map((client) => (
                                                            <CommandItem key={client.clientNumber} onSelect={() => {
                                                                setOpenClientPopover(false);
                                                                const newCheckoutToCreate : CreateCheckoutRequest = {
                                                                    ...checkoutToCreate,
                                                                    idClient: client.clientNumber,
                                                                    idShop: checkoutToCreate?.shop?.id ?? 0,
                                                                    paymentMethod: checkoutToCreate?.paymentMethod ?? PaymentMethod.CASH,
                                                                    discountType: checkoutToCreate?.discountType ?? DiscountType.PERCENTAGE,
                                                                    discountAmount: checkoutToCreate?.discountAmount ?? '0',
                                                                    cashAmount: checkoutToCreate?.cashAmount ?? '0',
                                                                    checkAmount: checkoutToCreate?.checkAmount ?? '0',
                                                                    NoVAT: checkoutToCreate?.NoVAT ?? false,
                                                                    shop: checkoutToCreate?.shop ?? defaultShop,
                                                                    client: client,
                                                                    status: checkoutToCreate?.status ?? CheckoutStatus.OPEN,
                                                                    lines: checkoutToCreate?.lines?.map((line) => ({
                                                                        ...line,
                                                                    })) ?? [],
                                                                    totalHT: checkoutToCreate?.totalHT ?? '0',
                                                                    totalTTC: checkoutToCreate?.totalTTC ?? '0',
                                                                    cbAmount: checkoutToCreate?.cbAmount ?? '0'
                                                                };

                                                                const totalWithoutDiscount = newCheckoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0;
                                                                const totalDiscountProduct = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0;
                                                                const totalDiscountGlobal = newCheckoutToCreate.discountType === DiscountType.FIXED ? parseFloat(newCheckoutToCreate.discountAmount) : (totalWithoutDiscount - totalDiscountProduct) * parseFloat(newCheckoutToCreate.discountAmount) / 100;
                                                                
                                                                newCheckoutToCreate.totalHT = (totalWithoutDiscount - totalDiscountProduct - totalDiscountGlobal).toString();
                                                                const totalWithoutVAT = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.price * line.quantity + line.price * line.quantity * vat / 100), 0) ?? 0;
                                                                newCheckoutToCreate.totalTTC =  (totalWithoutVAT -  totalDiscountProduct - totalDiscountGlobal).toString();
                                                                newCheckoutToCreate.cbAmount = (Number(newCheckoutToCreate.totalTTC) - Number(newCheckoutToCreate.cashAmount) - Number(newCheckoutToCreate.checkAmount)).toFixed(2);                

                                                                setCheckoutToCreate(newCheckoutToCreate);
                                                                onCheckoutToCreateChange?.(newCheckoutToCreate);
                                                            }}>
                                                                {client.email}
                                                            </CommandItem>
                                                        ))
                                                    }
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                :
                                    <Input type="text" disabled={true} value={checkout?.client?.email ?? ''}/>
                            }
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="client-name" className="text-sm text-gray-700">Club</Label>
                            {
                                isEditable ?
                                    <Popover open={openClubPopover} onOpenChange={setOpenClubPopover}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openClubPopover ? true : false}
                                            className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500"
                                        >
                                            {checkoutToCreate?.client && checkoutToCreate?.client.clientNumber !== 0 ? checkoutToCreate?.client.club?.name ?? "Sans club" : "Sélectionner un club..."}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0 max-h-[200px] overflow-y-auto">
                                        <Command>
                                            <CommandInput 
                                                placeholder="Rechercher un club..." 
                                                className="h-9" 
                                                onValueChange={async (value) => {
                                                    await handleClubSearch(value);
                                                }}
                                            />
                                            <CommandEmpty>Aucun club trouvé</CommandEmpty>
                                            <CommandGroup>
                                                {
                                                    clubs?.map((client) => (
                                                        <CommandItem key={client.clientNumber} onSelect={() => {
                                                            setOpenClientPopover(false);
                                                            const newCheckoutToCreate : CreateCheckoutRequest = {
                                                                ...checkoutToCreate,
                                                                idClient: client.clientNumber,
                                                                idShop: checkoutToCreate?.shop?.id ?? 0,
                                                                paymentMethod: checkoutToCreate?.paymentMethod ?? PaymentMethod.CASH,
                                                                discountType: checkoutToCreate?.discountType ?? DiscountType.PERCENTAGE,
                                                                discountAmount: checkoutToCreate?.discountAmount ?? '0',
                                                                cashAmount: checkoutToCreate?.cashAmount ?? '0',
                                                                checkAmount: checkoutToCreate?.checkAmount ?? '0',
                                                                NoVAT: checkoutToCreate?.NoVAT ?? false,
                                                                shop: checkoutToCreate?.shop ?? defaultShop,
                                                                client: client,
                                                                status: checkoutToCreate?.status ?? CheckoutStatus.OPEN,
                                                                lines: checkoutToCreate?.lines?.map((line) => ({
                                                                    ...line,
                                                                })) ?? [],
                                                                totalHT: checkoutToCreate?.totalHT ?? '0',
                                                                totalTTC: checkoutToCreate?.totalTTC ?? '0',
                                                                cbAmount: checkoutToCreate?.cbAmount ?? '0'
                                                            };

                                                            const totalWithoutDiscount = newCheckoutToCreate.lines?.reduce((acc, line) => acc + line.price * line.quantity, 0) ?? 0;
                                                            const totalDiscountProduct = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.discountType === DiscountType.PERCENTAGE ? line.price * line.quantity * parseFloat(line.discount) / 100 : parseFloat(line.discount) * line.quantity), 0) ?? 0;
                                                            const totalDiscountGlobal = newCheckoutToCreate.discountType === DiscountType.FIXED ? parseFloat(newCheckoutToCreate.discountAmount) : (totalWithoutDiscount - totalDiscountProduct) * parseFloat(newCheckoutToCreate.discountAmount) / 100;
                                                            
                                                            newCheckoutToCreate.totalHT = (totalWithoutDiscount - totalDiscountProduct - totalDiscountGlobal).toString();
                                                            const totalWithoutVAT = newCheckoutToCreate.lines?.reduce((acc, line) => acc + (line.price * line.quantity + line.price * line.quantity * vat / 100), 0) ?? 0;
                                                            newCheckoutToCreate.totalTTC =  (totalWithoutVAT -  totalDiscountProduct - totalDiscountGlobal).toString();

                                                            setCheckoutToCreate(newCheckoutToCreate);
                                                            onCheckoutToCreateChange?.(newCheckoutToCreate);
                                                        }}>
                                                            {client.lastName}
                                                        </CommandItem>
                                                    ))
                                                }
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            :
                                <Input type="text" disabled={true} value={checkout?.client?.club?.name ?? ''}/>
                            }
                            
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
}