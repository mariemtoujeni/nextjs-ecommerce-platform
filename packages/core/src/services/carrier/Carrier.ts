import { ShippingData, ShippingLabelResult } from "../../models";
import { ICarrier } from "../ICarrier";
import { Environment } from "../../types/utils";

export enum DeliveryMode {
    NON_LIVRABLE= "NON_LIVRABLE",
    MANUEL= "MANUEL",
    EXPEDITOR= "EXPEDITOR",
    MONDIAL_RELAY= "MONDIAL_RELAY",
    EXAPAQ= "EXAPAQ",
    ICI_RELAIS= "ICI_RELAIS",
    CHRONOPOST= "CHRONOPOST",
    CHRONOPOST_RELAIS= "CHRONOPOST_RELAIS",
    AU_MAGASIN= "AU_MAGASIN",
    AU_CLUB= "AU_CLUB",
    SO_COLISSIMO= "SO_COLISSIMO",
    COLISSIMO= "COLISSIMO",
}

export const Expediteur = {
    nom: 'Nataquashop',
    adresse: 'Route d\'Aubusson',
    adresse2: '',
    code_postal: '23140',
    ville: 'JARNAGES',
    pays: 'FR',
    telephone: '0555804251',
    portable: '0555804251',
    email: 'nicolas@nataquashop.com'
}

export class Carrier implements ICarrier {
    protected env: Environment;
    protected startQuery: string = '';
    protected endQuery: string = '';

    constructor(protected p_env: Environment) {
        this.env = p_env;
    }

    createShippingLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        throw new Error("Not implemented");
    }

    createReturnLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        throw new Error("Not implemented");
    }

    generateXml(data: any): string {
        return Object.entries(data).map(([key, value]) => {            
            if(Array.isArray(value)) {
                return  `<${key} ${value.map((item) => `${item.key}="${item.value}"`).join(' ')} />`
            } else if(typeof value === 'object') {
                return `<${key}>${this.generateXml(value)}</${key}>`
            } 

            return `<${key}>${value}</${key}>`
        }).join('\n');
    }

    generateQuery(data: any): string {
        return `${this.startQuery}${this.generateXml(data)}${this.endQuery}`;
    }
}