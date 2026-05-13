import { Environment } from "./index.ts";


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

export type Address = {
    id_relais?: string;
    societe?: string;
    nom: string;
    prenom: string;
    adresse: string;
    adresse2: string;
    adresse3: string;
    code_postal: string;
    ville: string;
    pays: string;
    telephone: string;
    portable: string;
    email: string;
}

export type ShippingData = {
    id_commande: number;
    numero_client: number;
    poids: number;
    frais_port?: number;
    total?: number;
    livraison: Address;
    facturation: Address;
}

export type ShippingLabelResult = {
    result: boolean;
    trackingNumber: string;
    label?: Uint8Array;
}

export class ICarrier {
    protected env: Environment;
    protected startQuery: string = '';
    protected endQuery: string = '';

    constructor(env: Environment) {
        this.env = env;
    }

    createShippingLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        throw new Error("Not implemented");
    }
    
    createReturnLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        throw new Error("Not implemented");
    }

    private generateXml(data: any): string {
        return Object.entries(data).map(([key, value]) => {            
            if(Array.isArray(value)) {
                return  `<${key} ${value.map((item) => `${item.key}="${item.value}"`).join(' ')} />`
            } else if(typeof value === 'object') {
                return `<${key}>${this.generateXml(value)}</${key}>`
            } 

            return `<${key}>${value}</${key}>`
        }).join('\n');
    }

    // deno-lint-ignore no-explicit-any
    protected generateQuery(data: any): string {
        return `${this.startQuery}${this.generateXml(data)}${this.endQuery}`;
    }
}