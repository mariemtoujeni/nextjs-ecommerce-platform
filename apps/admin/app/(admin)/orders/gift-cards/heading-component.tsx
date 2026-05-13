'use client'

import { Client } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { ChevronsUpDown, Plus, Router } from "lucide-react";
import { useRef, useState } from "react";
import { Button, Heading, Input, Label, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "~/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { createGiftCardAction } from "@repo/actions/orders/gift-card";
import { getAllClientAction } from "@repo/actions/clients";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Spinner } from "~/components/Spinner";

export interface GiftCardHeaderComponentProps {
    clients: ReturnAll<Client>;
}

export const HeaderComponent: React.FunctionComponent<GiftCardHeaderComponentProps> = ({ clients : initialClientList }) => {
    const [open, setOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>(initialClientList.items);
    const [search, setSearch] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [openShopPopover, setOpenShopPopover] = useState(false);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [giftCard, setGiftCard] = useState<{quantity: number | undefined, type: string | undefined, clientId: number | undefined}>({
        quantity: undefined,
        type: undefined,
        clientId: undefined
    });
    const { toast } = useToast();
    const router = useRouter();

    const handleUserSearch = async (searchRequest: string) => {
        setIsLoadingClients(true);
        searchTimeoutRef.current = setTimeout(async () => {
            const providedClients = await getAllClientAction({search: searchRequest, sort: 'asc'});
            setClients(providedClients.items);
            setIsLoadingClients(false);
        }, 500);
        return () => clearTimeout(searchTimeoutRef.current as NodeJS.Timeout);        
    }

    return (
        <div className="flex flex-row justify-between w-100">
            <Heading key='page-title' heading={"2"} className="text-gray-700">Chèques cadeaux</Heading>
            <div className="flex flex-row gap-3 items-center h-[26px]">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        className="flex items-center justify-center px-4 py-2 bg-black text-white rounded-md gap-2 w-full sm:w-auto"
                    >
                        <Plus /> Générer un chèque cadeau
                    </DialogTrigger>
                    <DialogContent className="fixed top-[300px] w-[1000px]">
                        <DialogHeader>
                            <DialogTitle>Générer un chèque cadeau</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-2 mt-8">
                            <div className="flex flex-row gap-2 ">                                      
                                <div className="flex flex-col gap-2 w-1/2">
                                    <Label>Quantité (requis)</Label>
                                    <Input type="number" min={1} max={100} placeholder="1" value={giftCard.quantity || ''} onChange={(e) => setGiftCard({quantity: Number(e.target.value), type: giftCard.type, clientId: giftCard.clientId})} />
                                </div>
                                <div className="flex flex-col gap-2 w-1/2">
                                    <Label>Type de chèque (requis)</Label>
                                    <Select value={giftCard.type} onValueChange={(value) => setGiftCard({quantity: giftCard.quantity, type: value, clientId: giftCard.clientId})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type de chèque cadeau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10 €</SelectItem>
                                            <SelectItem value="20">20 €</SelectItem>
                                            <SelectItem value="50">50 €</SelectItem>                                        
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="flex flex-col gap-2 w-full">
                                    <Label>Client (requis)</Label>
                                    <Popover open={openShopPopover} onOpenChange={setOpenShopPopover}>
                                        <PopoverTrigger asChild className="w-full">
                                            <Button variant="outline" role="combobox" aria-expanded={openShopPopover ? true : false} className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500">                                                                                            
                                                {giftCard.clientId ? clients.find(client => client.clientNumber === giftCard.clientId)?.firstName + " " + clients.find(client => client.clientNumber === giftCard.clientId)?.lastName : "John Doe"}
                                                <ChevronsUpDown className="opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command className="max-h-[200px] overflow-y-auto">
                                                <CommandInput placeholder="Rechercher un point de vente..." className="h-9" onValueChange={async (value) => {
                                                    await handleUserSearch(value);
                                                }} />
                                                {isLoadingClients ? (
                                                    <div className="flex justify-center items-center py-8">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Spinner variant="circle" size={32} />
                                                            <p className="text-sm text-gray-500">Chargement des clients...</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <CommandEmpty>Aucun point de vente trouvé</CommandEmpty>
                                                        <CommandGroup className="max-h-[150px] overflow-y-auto">
                                                            {
                                                                clients.map((client) => (
                                                                    <CommandItem key={client.userId} value={client.firstName + " " + client.lastName} onSelect={() => {
                                                                        setGiftCard({quantity: giftCard.quantity, type: giftCard.type, clientId: client.clientNumber});
                                                                        setOpenShopPopover(false);
                                                                    }}>
                                                                        <div className="flex flex-row gap-2">
                                                                            <div className="flex flex-col gap-1">
                                                                                <Label className="text-sm font-bold text-gray-700">{client.firstName + " " + client.lastName}</Label>
                                                                                <Label className="text-xs text-gray-500">{client.email}</Label>
                                                                            </div>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))
                                                            }
                                                        </CommandGroup>
                                                    </>
                                                )}
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>  
                            <div className="flex flex-row gap-2 justify-end mt-5">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Annuler
                                </Button>
                                <Button disabled={!giftCard.quantity || !giftCard.type || !giftCard.clientId} variant="default" onClick={async () => {
                                    setOpen(false);
                                    if (giftCard.quantity && giftCard.type && giftCard.clientId) {
                                        const result = await createGiftCardAction({
                                            value: Number(giftCard.type),
                                            clientId: Number(giftCard.clientId),
                                            cancelled: 0,
                                            used: false,
                                            remainingValue: Number(giftCard.type),
                                        }, giftCard.quantity);
    
                                        if(result.items && result.items.length > 0) {
                                            window.location.reload();
                                            toast({
                                                title: "Chèque cadeau généré avec succès",
                                                description: "Le chèque cadeau a été généré avec succès",
                                                variant: "default"
                                            })
                                            window.location.reload();
                                        } else {
                                            toast({
                                                title: "Erreur lors de l'exportation",
                                                description: result.error as string,
                                                variant: "destructive"
                                            })
                                        }
                                    } else {
                                                                                 toast({
                                             title: "Erreur lors de l'exportation",
                                             description: "Veuillez remplir tous les champs " + giftCard.quantity + " | " + giftCard.type + " | " + giftCard.clientId,
                                             variant: "destructive"
                                         })
                                    }
                                }}>
                                    Générer
                                </Button>
                            </div>                          
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}