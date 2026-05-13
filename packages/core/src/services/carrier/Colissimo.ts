import { Carrier, Expediteur } from "./Carrier";
import { ShippingData, ShippingLabelResult } from "../../models";
import { Environment } from "../../types/utils";
import { InternalServerError } from "../../types/error";

const API_URL = "https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0";
const API_KEY = "CE7472858CB636EA60C7AB0CB98D9D97";
const FORMAT = "PDF_10x15_300dpi";

export class Colissimo extends Carrier {
    constructor(env: Environment) {
        super(env);
    }

    async createShippingLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        throw new Error("Not implemented");
    }

    async createReturnLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
        try {
            const depositDate = new Date();

            const request = {
                contractNumber: "875030",
                password: "nataquashop23",
                outputFormat: {
                    x: 0,
                    y: 0,
                    outputPrintingType: FORMAT,
                    dematerialized: true,
                    returnType: "SendPDFByMail",
                    printCODDocument: false
                },
                letter: {
                    service: {
                        productCode: "CORE",
                        depositDate: depositDate.toISOString(),
                        mailBoxPicking: false,                        
                        orderNumber: shippingData.orderId.toString(),
                        commercialName: "Nataquashop",
                        returnTypeChoice: 2,
                        reseauPostal: "0"
                    },                    
                    parcel: {
                        weight: shippingData.weight / 100
                    },
                    sender: {
                        senderParcelRef: shippingData.orderId.toString(),
                        address: {
                            companyName: shippingData.shippingAddress.companyName ? shippingData.shippingAddress.companyName : "",
                            lastName: shippingData.shippingAddress.lastName,
                            firstName: shippingData.shippingAddress.firstName,
                            line0: shippingData.shippingAddress.address2,
                            line1: shippingData.shippingAddress.address3,
                            line2: shippingData.shippingAddress.address,
                            line3: "",
                            countryCode: shippingData.shippingAddress.country,
                            city: shippingData.shippingAddress.city,
                            zipCode: shippingData.shippingAddress.postalCode,
                            phoneNumber: shippingData.shippingAddress.phone,
                            mobileNumber: shippingData.shippingAddress.mobile,
                            doorCode1: "",
                            doorCode2: "",
                            intercom: "",
                            email: DEBUG_EMAIL !== 'integration' ? `${shippingData.client?.email}` : `team@squaad.io`,//`technataqua+${shippingData.client?.clientNumber}@gmail.com`,
                            language: "fr",
                            stateOrProvinceCode: ""
                        }
                    },
                    addressee: {
                        addresseeParcelRef: shippingData.orderId.toString(),
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
                const response = JSON.parse(body?.trim() || "{}");
                return response;
            });

            if(parsedParts.length > 0 && parsedParts[0].messages.length > 0 && parsedParts[0].messages[0].type === 'ERROR') {
                throw new Error(`Format de la réponse du serveur incorrect | parsedParts.length: ${parsedParts.length}, parsedParts: ${parsedParts[0].body}`);
            }

            const trackingNumber = parsedParts[0].labelV2Response.parcelNumber;

            return {
                result: true,
                trackingNumber,
                label: parsedParts[0].messages
            }
        }   catch (error: any) {
            throw new InternalServerError(error.message);
        }
    }
}