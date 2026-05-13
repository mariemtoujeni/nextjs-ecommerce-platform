'use client'

import { GiftCardPresenter } from "@repo/core/models"
import logoNataqua from '~/public/logo-nataqua.png'
import { forwardRef } from 'react'

export interface GiftCardPreviewComponentProps {
    giftCard?: GiftCardPresenter
}

export const GiftCardPreviewComponent = forwardRef<HTMLDivElement, GiftCardPreviewComponentProps>(({ giftCard }, ref) => {
    
    return (
        <div className="w-full flex justify-center">
            <div
                ref={ref}
                className="bg-white p-6 text-sm text-black border rounded-lg shadow-sm mx-auto w-full max-w-4xl"
                style={{
                    maxHeight: 'calc(90vh - 120px)',
                    overflow: 'auto'
                }}
            >
                <div className="flex flex-col min-h-0">
                    {/* Header */}
                    <div className="flex flex-row justify-between items-center border-b pb-4 mb-4">
                        <h1 className="font-bold text-2xl text-gray-800">Chèque cadeau</h1>
                        <img src={logoNataqua.src} alt="logo Nataqua" crossOrigin="anonymous" width={140} className="h-10 object-contain"/>
                    </div>
                    
                    {giftCard && (
                        <div className="flex-1 space-y-6 overflow-y-auto">
                            {/* Section principale avec code et montant en évidence */}
                            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <div className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-700">Code du chèque cadeau</h2>
                                    <div className="text-3xl font-mono font-bold text-blue-600 tracking-wider bg-white p-3 rounded border">
                                        {giftCard.code}
                                    </div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {giftCard.value} €
                                    </div>
                                </div>
                            </div>
                            
                            {/* Informations détaillées */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <h3 className="font-semibold text-base text-gray-700 mb-3 border-b pb-2">Informations du chèque</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Code:</span>
                                                <span className="font-mono font-semibold">{giftCard.code}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Montant:</span>
                                                <span className="font-bold text-lg text-green-600">{giftCard.value} €</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Statut:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    giftCard.cancelled ? 'bg-red-100 text-red-700 border border-red-200' :
                                                    giftCard.used ? 'bg-green-100 text-green-700 border border-green-200' :
                                                    'bg-blue-100 text-blue-700 border border-blue-200'
                                                }`}>
                                                    {giftCard.cancelled ? 'Annulé' : giftCard.used ? 'Utilisé' : 'Non utilisé'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <h3 className="font-semibold text-base text-gray-700 mb-3 border-b pb-2">Informations associées</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Commande:</span>
                                                <span className="font-semibold">#{giftCard.commandId}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Client:</span>
                                                <span className="font-semibold">
                                                    {giftCard.client ? `${giftCard.client.firstName} ${giftCard.client.lastName}` : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Expiration:</span>
                                                <span className="font-semibold">
                                                    {giftCard.expirationDate ? new Date(giftCard.expirationDate).toLocaleDateString('fr-FR') : 'Indéfini'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Informations d'utilisation si utilisé */}
                            {giftCard.used && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h3 className="font-semibold text-lg text-blue-800 mb-3 border-b border-blue-200 pb-2">Informations d'utilisation</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        {giftCard.usedAt && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600 font-medium">Utilisé le:</span>
                                                <span className="font-semibold">
                                                    {new Date(giftCard.usedAt).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {giftCard.usedBy && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600 font-medium">Utilisé par:</span>
                                                <span className="font-semibold">
                                                    {giftCard.usedBy.firstName} {giftCard.usedBy.lastName}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {/* Footer */}
                            <div className="mt-auto pt-4 border-t text-center text-gray-500 text-xs">
                                <p>Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
})

GiftCardPreviewComponent.displayName = 'GiftCardPreviewComponent'