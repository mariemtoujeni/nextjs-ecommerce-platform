'use client'

import { CheckoutPresenter, DiscountType, PaymentMethod } from "@repo/core/models"
import logoNataqua from '~/public/logo-nataqua.png'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

export interface CheckoutPreviewComponentProps {
    ref: React.RefObject<HTMLDivElement>
    checkout?: CheckoutPresenter    
}

export const CheckoutPreviewComponent: React.FunctionComponent<CheckoutPreviewComponentProps> = ({ checkout, ref }) => {
    return <div className="absolute -left-[10000px] top-0 pointer-events-none opacity-0">
        <div className="flex flex-row gap-3 items-center h-[26px]">
            <div
                ref={ref}
                className="bg-white max-w-4xl mx-auto p-10 text-[12px] text-black w-full"
            >
                <div className="flex flex-col gap-2">
                    <div className="mb-6 flex flex-row justify-between w-full">
                        <h1 className="font-bold text-2xl">Facture</h1>
                        <img src={logoNataqua.src} alt="logo Nataqua" crossOrigin="anonymous" width={200}/>
                    </div>
                    <div className="flex flex-row justify-start w-full">
                        <div className="flex flex-col gap-1">
                            {
                                checkout?.client ? <span className="font-bold text-sm">Numéro de client : {checkout?.client.clientNumber}</span> : <></>
                            }
                            <span className="font-bold text-sm">N° de caisse : {checkout?.id}</span>
                            <span className="font-bold text-sm">
                                Facture du : {checkout?.createdAt ? new Date(checkout.createdAt).toLocaleDateString('fr-FR') : ''}
                            </span>
                            <span className="font-bold text-sm">
                                Nom du point de vente : {checkout?.shop.name}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">                        
                        <Table className="w-full mt-8">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Unité</TableHead>
                                    <TableHead>Ref fournisseur</TableHead>
                                    <TableHead>Article</TableHead>
                                    <TableHead>Prix unitaire HT EUR</TableHead>
                                    <TableHead>Remise</TableHead>
                                    {/* <TableHead>TVA EUR</TableHead> */}
                                    <TableHead>TVA %</TableHead>
                                    <TableHead>Total TTC EUR</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {checkout?.lines?.map((line) => (
                                    <TableRow key={line.id}>
                                        <TableCell className="px-4 py-2">{line.quantity}</TableCell>
                                        <TableCell className="px-4 py-2">{line.modelProduct?.manufacturerReference}</TableCell>
                                        <TableCell className="px-4 py-2">{line.modelProduct?.name}</TableCell>
                                        <TableCell className="px-4 py-2">{(line.modelProduct?.price && line.VAT !== undefined)
                                            ? (line.modelProduct.price).toFixed(2)
                                            : '0.00'} €</TableCell>
                                        <TableCell className="px-4 py-2">{line.discountType === DiscountType.PERCENTAGE ? `${line.discount}%` : line.discountType === DiscountType.FIXED ? `${line.discount} €` : ''}</TableCell>                                        
                                        <TableCell className="px-4 py-2">{line.VAT} %</TableCell>
                                        <TableCell className="px-4 py-2">
                                            {
                                                (line.price * (line.quantity || 0) * (1 + line.VAT / 100)).toFixed(2)
                                            } €
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex flex-row justify-end w-full mt-8">
                            <div className="flex flex-col gap-1 mr-1">
                                <div className="flex flex-row justify-between w-full gap-8">
                                    <span className="text-sm">Montant Total HT EUR</span>
                                    <span className="text-sm">
                                        {
                                            checkout?.lines?.reduce((acc, line) => acc + (line.modelProduct?.price || 0) * (line.quantity || 0), 0)
                                        } €
                                    </span>
                                </div>
                                <div className="flex flex-row justify-between w-full gap-8">
                                    <span className="text-sm">Remise globale EUR</span>                                    
                                    <span className="text-sm">-{Number(checkout?.discountAmount).toFixed(2)} €</span>
                                </div>
                                {/* <div className="flex flex-row justify-between w-full gap-8">
                                    <span className="text-sm">Montant Total HT EUR</span>
                                    <span className="text-sm">{Number(checkout?.totalHT).toFixed(2)} €</span>
                                </div>*/}
                                <div className="flex flex-row justify-between w-full gap-8">
                                    <span className="text-sm">Montant Total TVA EUR</span>
                                    <span className="text-sm">{(Number(checkout?.lines?.reduce((acc, line) => acc + (line.modelProduct?.price || 0) * (line.quantity || 0), 0)) * Number(checkout?.VAT ?? 20) / 100).toFixed(2)} €</span>
                                </div>                                 
                                <div className="flex flex-row justify-between w-full gap-8">
                                    <span className="font-bold text-sm">Total TTC EUR</span>
                                    <span className="font-bold text-sm">{Number(checkout?.totalTTC).toFixed(2)} €</span>
                                </div>
                            </div>
                        </div>
                        <span className="text-sm mt-8">
                            Méthode de paiement choisie : {
                                checkout?.paymentMethod === PaymentMethod.CASH ? 
                                    'Espèces' : checkout?.paymentMethod === PaymentMethod.CREDIT_CARD ? 
                                        'Carte bancaire' : checkout?.paymentMethod === PaymentMethod.DEBIT_CARD ? 
                                            'Carte bancaire' : checkout?.paymentMethod === PaymentMethod.TRANSFER ? 
                                                'Virement' : checkout?.paymentMethod === PaymentMethod.CHECK ? 'Chèque' : 
                                                    checkout?.paymentMethod === PaymentMethod.OTHER ? 'Autre' : ''
                            }
                            <br />
                            <span className="font-bold text-sm mt-8">
                                À bientôt sur Nataquashop ! Merci pour votre confiance !
                            </span>
                        </span>
                    </div>
                </div>
            </div>

        </div>
    </div>
}