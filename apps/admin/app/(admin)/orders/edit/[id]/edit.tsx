"use client";

import { AddressType, OrderAdmin, OrderEtat, OrderState, OrderStatus, OrderUpdate, OrderWithAdmin, PaymentMode, ReductionValueType } from "@repo/core/models";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Heading } from "~/components/ui/heading";
import { Badge, Card, CardContent, CardHeader, CardTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { OrderStateBadges } from "../../state";
import noPicture from '~/public/no-picture.jpg'; 
import Image from "next/image";

export default function Edit({ order }: { order: OrderWithAdmin }) {
    const [orderUpdate, setOrderUpdate] = useState<OrderUpdate>({...order});
    let vatValue = 0;
    let authorisationDate = new Date(order.authorisationDate);
    let amountHT = order.lines.reduce( (sum, line) => sum + (line.totalPriceInclTax ?? 0), 0 );
    let vatRate = (order.lines[0]?.vat ?? 0) / 100;
    let vat = amountHT * vatRate;

    return (
        <div className="container">
            <div className="flex gap-2 justify-start items-center mb-8">
                <Link href="/orders">   
                    <Button className="text-gray-700" variant="secondary" size="icon"><ArrowLeft /> </Button>
                </Link>
                <Heading heading={"2"} className="text-gray-700 m-0">Commande # {order.id} - {order.client?.firstName} {order.client?.lastName}</Heading>      
            </div>
            <div className="flex gap-4">
                <div className="flex flex-col gap-2 w-3/4">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Produits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="w-6/12">Produit</TableHead>
                                        <TableHead className="w-1/12 text-center">Quantité</TableHead>
                                        <TableHead className="w-2/12 text-center">Prix unitaire (HT)</TableHead>
                                        <TableHead className="w-1/12 text-center">Réduction</TableHead>
                                        <TableHead className="w-2/12 text-end">Prix total (HT)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.lines.map((ligne) => {
                                        const reductionValue = ligne.reductionValueType === ReductionValueType.PERCENTAGE 
                                        ? `${ligne.reductionValue} %`
                                        : ligne.reductionValueType == ReductionValueType.MONTANT
                                        ? `${ligne.reductionValue} €`
                                        : '-';
                                        vatValue += ligne.vat != 0 ? ligne.totalPriceInclTax - ligne.totalPriceExclTax : 0;
                                        
                                        const description = ligne.model.name;
                                        const image = ligne.model.img && ligne.model.img.length > 0
                                            ? <Image src={ligne.model.img.find(img => ligne.model.attributValues?.some(av => av.idAttributValue === img.attributeValueId) )?.url ?? noPicture} alt={description ?? 'no-image'} width={48} height={48} />
                                            : <Image src={noPicture} alt="no-image" width={48} height={48} />
                                        return <TableRow key={ligne.id}>
                                            <TableCell>
                                                {ligne.name}
                                                    <div className="flex items-center gap-2">
                                                        {image}
                                                        <div className="flex flex-col gap-1">
                                                            {description}
                                                            <div className="flex flex-row gap-1">
                                                                {ligne.model.attributValues?.map((item, index) => (
                                                                    <Badge key={index} variant="blue" size="sm">
                                                                    {item.attributValue?.nom}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Personnalisation*/}
                                                    {(ligne.textPersonnalisation || ligne.typePersonnalisation)&&
                                                    <div className="mt-3">
                                                      <div>Personnalisation</div>
                                                      {ligne.textPersonnalisation && (
                                                        <div>Texte : {ligne.textPersonnalisation}</div>
                                                      )}
                                                       {ligne.typePersonnalisation && (
                                                        <div>Type : {ligne.typePersonnalisation}</div>
                                                       )}

                                                    </div>
                                                    }

                                            </TableCell>
                                            <TableCell className="text-center">{ligne.quantity}</TableCell>
                                            <TableCell className="text-center">{ligne.unitPriceExclTax.toFixed(2)} €</TableCell>
                                            <TableCell className="text-center">{reductionValue}</TableCell>
                                            <TableCell className="text-end">{ligne.totalPriceInclTax.toFixed(2)} €</TableCell>
                                        </TableRow>
                                    })}
                                    <TableRow>
                                        <TableCell colSpan={4} className="font-bold text-lg">Total TTC</TableCell>
                                        <TableCell className="text-end font-bold text-lg">{order.amount.toFixed(2)} €</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Information de paiement 
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <div>Statut: {order.status}</div>
                            <div>Type: {order.paymentMode}{order.paymentMode == PaymentMode.SYSTEMPAY ? `, autorisation n° ${order.authorisation}` : ''}</div>
                            <div>Date: {authorisationDate.toLocaleString()}</div>
                            <div>Montant: {order.amount.toFixed(2)} €, dont les taxes : {vat.toFixed(2)} €</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>    
                            <CardTitle>
                                Expédition
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>Mode: {order.deliveryMode}<br />{order.deliveryFees != 0 ? `Frais de port : ${order.deliveryFees.toFixed(2)} €` : ''}</div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-col gap-2 w-1/4">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Informations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <div><DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="py-2 font-normal w-full ps-0 justify-between px-3 overflow-hidden border-none shadow-none">
                                    {OrderStateBadges[order.status]}
                                    <ChevronDown className="opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {
                                    Object.keys(OrderStateBadges).map((status) => {
                                        const statusEnum = status as OrderStatus;
                                        return <DropdownMenuItem key={status} onClick={() => setOrderUpdate({...orderUpdate, status: statusEnum}) } >
                                            {OrderStateBadges[statusEnum]}
                                        </DropdownMenuItem>
                                    })
                                }
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2">Etat: 
                            <Select defaultValue={orderUpdate.state}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un état" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        Object.keys(OrderState)
                                            .map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)
                                    }
                                </SelectContent>
                        </Select></div>
                        <div>Commentaire interne: <textarea className="w-full bg-gray-100 rounded-md p-2" value={order.comment} onChange={(e) => setOrderUpdate({...orderUpdate, comment: e.target.value})} /></div>
                    </CardContent>
                </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Client
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <div className="text-blue-500"><a href={`/clients/${order.client?.clientNumber}`}>{order.client?.firstName} {order.client?.lastName}</a></div>
                            {
                                order.addresses?.map((address) => (
                                    <div key={address.type} className="flex flex-col">
                                        <b>{AddressType.FACTURATION == address.type ? 'Adresse de facturation' : 'Adresse de livraison'}</b>
                                        <div>{address.firstName} {address.lastName}</div>
                                        <div>{address.company}</div>
                                        <div>{address.address}</div>
                                        <div>{address.address2}</div>
                                        <div>{address.address3}</div>
                                        <div>{address.postCode} {address.city}</div>
                                        <div>{address.country}</div>
                                    </div>
                                ))
                            }
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}