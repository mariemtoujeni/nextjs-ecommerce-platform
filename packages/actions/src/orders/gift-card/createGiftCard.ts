"use server"

import { GiftCardInput, GiftCard } from "@repo/core/models";
import { ReturnAll, ReturnOne } from "@repo/core/types";
import { createGiftCardUseCase, getConfsUseCase } from "@repo/core/usecases";

// Le code doit commencer par VIP et contenir 10 numéros aléatoires et se terminer par 3 lettres aléatoires. tous les caractères doivent être en majuscule
const generateGiftCardCode = (): string => {
    const code = 'VIP' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 5);
    return code.toUpperCase();
}

export const createGiftCardAction = async (giftCardToCreate: GiftCardInput, nbrGiftCard: number): Promise<ReturnAll<GiftCard>> => {
    try {
        const generalConf = await getConfsUseCase();
        const duree_validite_cheque_cadeau = generalConf.duree_validite_cheque_cadeau;
        const type_duree_validite_cheque_cadeau = generalConf.type_duree_validite_cheque_cadeau;

        const expirationDate = new Date();
        if(type_duree_validite_cheque_cadeau === 'JOUR') {
            expirationDate.setDate(expirationDate.getDate() + duree_validite_cheque_cadeau);
        } else if(type_duree_validite_cheque_cadeau === 'MOIS') {
            expirationDate.setMonth(expirationDate.getMonth() + duree_validite_cheque_cadeau);
        } else if(type_duree_validite_cheque_cadeau === 'ANNEE') {
            expirationDate.setFullYear(expirationDate.getFullYear() + duree_validite_cheque_cadeau);
        }

        const giftCards: GiftCard[] = [];
        for(let i = 0; i < nbrGiftCard; i++) {
            const giftCard = await createGiftCardUseCase({
                ...giftCardToCreate,
                code: generateGiftCardCode(),
                expirationDate: expirationDate
            });
            giftCards.push(giftCard.item);
        }
        return {
            items: giftCards,
            total: giftCards.length,
            count: giftCards.length
        };
    } catch (error: any) {
        return {
            items: [] as unknown as GiftCard[],
            total: 0,
            count: 0,
            error: error.message,
        };
    }
}