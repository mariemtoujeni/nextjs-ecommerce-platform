import { Expediteur, ICarrier, ShippingData, ShippingLabelResult } from "./CarrierInterface.ts";
import { Environment } from "./index.ts";


const API_URL = "https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0";
const API_KEY = "CE7472858CB636EA60C7AB0CB98D9D97";
const FORMAT = "PDF_10x15_300dpi";

export class Colissimo extends ICarrier {
    constructor(env: Environment) {
        super(env);
    }

    async createShippingLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        try {
            const depositDate = new Date();

            const request = {
                contractNumber: "875030",
                password: "nataquashop23",
                outputFormat: {
                    x: 0,
                    y: 0,
                    outputPrintingType: "PDF_10x15_300dpi",
                    dematerialized: true,
                    returnType: "SendPDFByMail",
                    printCODDocument: false
                },
                letter: {
                    service: {
                        productCode: "DOM",
                        depositDate: depositDate.toISOString(),
                        mailBoxPicking: false,
                        transportationAmount: shippingData.frais_port ? shippingData.frais_port : 0,
                        totalAmount: shippingData.total ? shippingData.total * 100 : 0,
                        orderNumber: shippingData.id_commande.toString(),
                        commercialName: "Nataquashop",
                        returnTypeChoice: 2,
                        reseauPostal: "0"
                    },
                    parcel: {
                        insuranceValue: 0,
                        weight: shippingData.poids / 100,
                        nonMachinable: false,
                        returnReceipt: false,
                        instructions: "",
                        pickupLocationId: "",
                        ftd: false,
                        ddp: false,
                        disabledDeliveryBlockingCode: "1",
                        cod: false,
                        codamount: 0,
                        codcurrency: "EUR"
                    },
                    sender: {
                        senderParcelRef: shippingData.id_commande.toString(),
                        address: {
                            companyName: Expediteur.nom,
                            lastName: "",
                            firstName: "",
                            line0: "",
                            line1: "",
                            line2: Expediteur.adresse,
                            line3: "",
                            countryCode: Expediteur.pays,
                            city: Expediteur.ville,
                            zipCode: Expediteur.code_postal,
                            phoneNumber: Expediteur.telephone,
                            mobileNumber: Expediteur.portable,
                            doorCode1: "",
                            doorCode2: "",
                            intercom: "",
                            email: Expediteur.email,
                            language: "fr",
                            stateOrProvinceCode: ""
                        }
                    },
                    addressee: {
                        addresseeParcelRef: shippingData.id_commande.toString(),
                        codeBarForReference: false,
                        serviceInfo: "",
                        promotionCode: "",
                        address: {
                            companyName: shippingData.livraison.societe ? shippingData.livraison.societe : "",
                            lastName: shippingData.livraison.nom,
                            firstName: shippingData.livraison.prenom,
                            line0: shippingData.livraison.adresse2,
                            line1: shippingData.livraison.adresse3,
                            line2: shippingData.livraison.adresse,
                            line3: "",
                            countryCode: shippingData.livraison.pays,
                            city: shippingData.livraison.ville,
                            zipCode: shippingData.livraison.code_postal,
                            phoneNumber: shippingData.livraison.telephone,
                            mobileNumber: shippingData.livraison.portable,
                            doorCode1: "",
                            doorCode2: "",
                            intercom: "",
                            email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `team+${shippingData.numero_client}@squaad.io` : shippingData.livraison.email,
                            language: "FR",
                            stateOrProvinceCode: ""
                        }
                    }
                }
            };

            const res = await fetch(`${API_URL}/generateLabel`, {
                method: 'POST'
                , body: JSON.stringify(request)
                , headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY }
            });

            const contentType = res.headers.get('Content-Type') || "";
            const boundaryMatch = contentType.match(/boundary="(.*)";/);
            if (!boundaryMatch) {
                throw new Error('Erreur lors de la lecture de la réponse du serveur')
            }

            const boundary = boundaryMatch[1];
            const buffer = await res.arrayBuffer();
            const responseText = new TextDecoder().decode(buffer);
            
            const parts = responseText.split(`--${boundary}`);
            const filteredParts = parts.filter(part => part.trim() && !part.includes("--"));
            const parsedParts = filteredParts.map(part => {
                const [headersPart, body] = part.split("\r\n\r\n", 2);
                const headers: any = {}
                headersPart.split("\r\n").forEach(header => {
                    const [key, value] = header.split(": ");
                    headers[key] = value;
                });

                return { headers, body: body.trim() };
            });

            if(parsedParts.length < 2) {
                throw new Error(`Format de la réponse du serveur incorrect`);
            }

            const jsonResponse = JSON.parse(parsedParts[0].body);

            if(!res.ok) {
                throw new Error(jsonResponse.messages.map( (m: any) => m.messageContent).join('. '));
            }

            const trackingNumber = jsonResponse.labelV2Response.parcelNumber;

            return {
                result: true,
                trackingNumber,
                label: new Uint8Array(buffer),
            }
        } catch (e) {
            throw e;
        }
    }

    async createReturnLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        try {
            const depositDate = new Date();

            const request = {
                contractNumber: "875030",
                password: "nataquashop23",
                outputFormat: {
                    x: 0,
                    y: 0,
                    outputPrintingType: "PDF_10x15_300dpi",
                    dematerialized: true,
                    returnType: "SendPDFByMail",
                    printCODDocument: false
                },
                letter: {
                    service: {
                        productCode: "CORE",
                        depositDate: depositDate.toISOString(),
                        mailBoxPicking: false,                        
                        orderNumber: shippingData.id_commande.toString(),
                        commercialName: "Nataquashop",
                        returnTypeChoice: 2,
                        reseauPostal: "0"
                    },                    
                    parcel: {
                        weight: shippingData.poids / 100
                    },
                    sender: {
                        senderParcelRef: shippingData.id_commande.toString(),
                        address: {
                            companyName: shippingData.livraison.societe ? shippingData.livraison.societe : "",
                            lastName: shippingData.livraison.nom,
                            firstName: shippingData.livraison.prenom,
                            line0: shippingData.livraison.adresse2,
                            line1: shippingData.livraison.adresse3,
                            line2: shippingData.livraison.adresse,
                            line3: "",
                            countryCode: shippingData.livraison.pays,
                            city: shippingData.livraison.ville,
                            zipCode: shippingData.livraison.code_postal,
                            phoneNumber: shippingData.livraison.telephone,
                            mobileNumber: shippingData.livraison.portable,
                            doorCode1: "",
                            doorCode2: "",
                            intercom: "",
                            email: ("true" == Deno.env.get('DEBUG_EMAIL')!) 
                            ? `team+${shippingData.numero_client}@squaad.io`
                            : "" !== shippingData.livraison.email ? shippingData.livraison.email : Expediteur.email,
                            language: "fr",
                            stateOrProvinceCode: ""
                        }
                    },
                    addressee: {
                        addresseeParcelRef: shippingData.id_commande.toString(),
                        codeBarForReference: false,
                        serviceInfo: "",
                        promotionCode: "",
                        address: {
                            companyName: Expediteur.nom,
                            lastName: "",
                            firstName: "",
                            line0: "",
                            line1: "",
                            line2: Expediteur.adresse,
                            line3: "",
                            countryCode: Expediteur.pays,
                            city: Expediteur.ville,
                            zipCode: Expediteur.code_postal,
                            phoneNumber: Expediteur.telephone,
                            mobileNumber: Expediteur.portable,
                            doorCode1: "",
                            doorCode2: "",
                            intercom: "",
                            email: Expediteur.email,
                            language: "FR",
                            stateOrProvinceCode: ""
                        }
                    }
                }
            };

            const res = await fetch(`${API_URL}/generateLabel`, {
                method: 'POST'
                , body: JSON.stringify(request)
                , headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY }
            });

            const contentType = res.headers.get('Content-Type') || "";
            const boundaryMatch = contentType.match(/boundary="(.*)";/);
            if (!boundaryMatch) {
                throw new Error('Erreur lors de la lecture de la réponse du serveur')
            }

            const boundary = boundaryMatch[1];
            const responseText = await res.text();
            const parts = responseText.split(`--${boundary}`);
            const filteredParts = parts.filter(part => part.trim() && !part.includes("--"));            
            const parsedParts : any = filteredParts.map(part => {
                const [headersPart, body] = part.split("\r\n\r\n", 2);
                const response = JSON.parse(body.trim());
                return response;
            });
            
            if(parsedParts.length > 0 && parsedParts[0].messages.length > 0 && parsedParts[0].messages[0].type === 'ERROR') {
                throw new Error(`Format de la réponse du serveur incorrect | parsedParts.length: ${parsedParts.length}, parsedParts: ${parsedParts[0].body}`);
            }

            const trackingNumber = parsedParts[0].labelV2Response.parcelNumber;

            return {
                result: true,
                trackingNumber
            }
        }   catch (e) {
            throw e;
        }
    }

}