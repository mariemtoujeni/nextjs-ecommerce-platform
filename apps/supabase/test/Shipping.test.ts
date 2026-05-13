import { ShippingData } from '../functions/_shared/CarrierInterface.ts';
import { Colissimo } from '../functions/_shared/Colissimo.ts';
import { Environment } from '../functions/_shared/index.ts';
import { MondialRelay} from '../functions/_shared/MondialRelay.ts';
import { Buffer } from 'node:buffer';


const md = new MondialRelay(Environment.TEST);
const co = new Colissimo(Environment.TEST);

const data: ShippingData = {
    id_commande: 123,
    numero_client: 123,
    poids: 150,
    livraison: {
        id_relais: '099218',
        nom: 'Moreau',
        prenom: 'Sylvain',
        adresse: '60 Rue Lebrun',
        adresse2: '',
        adresse3: '',
        code_postal: '94400',
        ville: 'VITRY-SUR-SEINE',
        pays: 'FR',
        telephone: '0123456789',
        portable: '0123456789',
        email: ''
    },
    facturation: {
        id_relais: '',
        nom: 'Jane',
        prenom: 'Doe',
        adresse: '123 rue de la paix',
        adresse2: '',
        adresse3: '',
        code_postal: '75000',
        ville: 'Paris',
        pays: 'FR',
        telephone: '0123456789',
        portable: '0123456789',
        email: ''
    }
}

//const labelMd = await md.createShippingLabel(data);
//await Deno.writeFile(`${labelMd.trackingNumber}.pdf`, labelMd.label);
//
//const labelMdReturn = await md.createReturnLabel(data);
//await Deno.writeFile(`${labelMdReturn.trackingNumber}.pdf`, labelMdReturn.label);

const labelCo = await co.createShippingLabel(data);
await Deno.writeFile(`${labelCo.trackingNumber}.pdf`, labelCo.label);

const labelCoReturn = await co.createReturnLabel(data);
