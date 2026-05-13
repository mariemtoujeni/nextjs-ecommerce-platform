import { Expediteur, ICarrier, ShippingData, ShippingLabelResult } from "./CarrierInterface.ts";
import { Environment } from "./index.ts";
import { md5 } from "jsr:@takker/md5";
import { encodeHex } from "jsr:@std/encoding@1/hex";
// import { encode } from "https://denopkg.com/chiefbiiko/std-encoding@v1.1.1/mod.ts";
import { xml2js } from "https://deno.land/x/xml2js@1.0.0/mod.ts";

type MondialRelayAuth = {
    login: string;
    password: string;
    customerId: string;
    apiUrl: string;
}
const credentials: Record<Environment, MondialRelayAuth> = {
    [Environment.TEST]: {
        login: "BDTEST@business-api.mondialrelay.com",
        password: "'2crtPDo0ZL7Q*3kLumB",
        customerId: "BDTEST",
        apiUrl: "https://connect-api-sandbox.mondialrelay.com/api/shipment"
    },
    [Environment.PROD]: {
        login: "",
        password: "",
        customerId: "",
        apiUrl: "https://connect-api.mondialrelay.com/api/shipment"
    }
}

export class MondialRelay extends ICarrier {
    private credentials: MondialRelayAuth;

    constructor(env: Environment) {
        super(env);
        this.credentials = credentials[env];

        this.startQuery = `<?xml version="1.0" encoding="utf-8"?>
<ShipmentCreationRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.example.org/Request">`;

        this.endQuery = `</ShipmentCreationRequest>`;
    }

    async createShippingLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        return await this.createLabel(shippingData, 'CCC');
    }

    async createReturnLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        return await this.createLabel(shippingData, 'LCC');
    }

    private async createLabel(shippingData: ShippingData, mode: string): Promise<ShippingLabelResult> {
        try {

            const mdRelayRequest = {
                Context: {
                    Login: this.credentials.login,
                    Password: this.credentials.password,
                    CustomerId: this.credentials.customerId, 
                    Culture: "fr-FR",
                    VersionAPI: "1.0"
                },
                OutputOptions: {
                    OutputFormat: "10x15",
                    OutputType: "PdfUrl"
                },
                ShipmentsList: {
                    Shipment: {
                        OrderNo: shippingData.id_commande,
                        CustomerNo: shippingData.numero_client,
                        ParcelCount: "1",
                        DeliveryMode: [
                            { key: "Mode", value: "24R" }   ,
                            { key: "Location", value: `${shippingData.livraison.pays}-${shippingData.livraison.id_relais}` }
                        ],
                        CollectionMode: [
                            { key: "Mode", value: mode },
                            { key: "Location", value: "" }
                        ],
                        Parcels: {
                            Parcel: {
                                Content: "Sportwear",
                                Weight: [
                                    { key: "Value", value: shippingData.poids },
                                    { key: "Unit", value: "gr" }
                                ],
                                Length: [
                                    { key: "Value", value: "40" },
                                    { key: "Unit", value: "cm" }
                                ],
                                Width: [
                                    { key: "Value", value: "40" },
                                    { key: "Unit", value: "cm" }
                                ],
                                Depth: [
                                    { key: "Value", value: "40" },
                                    { key: "Unit", value: "cm" }
                                ]
                            }
                        },
                        DeliveryInstruction: "",
                        Sender: "CCC" === mode ? {
                            Address: {
                                Title: Expediteur.nom,
                                Firstname: "",
                                Lastname: "",
                                Streetname: Expediteur.adresse,
                                HouseNo: Expediteur.adresse2,
                                CountryCode: "FR",
                                PostCode: Expediteur.code_postal,
                                City: Expediteur.ville,
                                AddressAdd1: "",
                                AddressAdd2: "",
                                AddressAdd3: "",
                                PhoneNo: Expediteur.telephone,
                                MobileNo: Expediteur.portable,
                                Email: Expediteur.email
                            }
                        } : {
                            Address: {
                                Title: "Mr",
                                Firstname: shippingData.facturation.prenom,
                                Lastname: shippingData.facturation.nom,
                                Streetname: shippingData.facturation.adresse,
                                HouseNo: shippingData.facturation.adresse2,
                                CountryCode: shippingData.facturation.pays,
                                PostCode: shippingData.facturation.code_postal,
                                City: shippingData.facturation.ville,
                                AddressAdd1: shippingData.facturation.adresse3,
                                AddressAdd2: "",
                                AddressAdd3: "",
                                PhoneNo: shippingData.facturation.telephone,
                                MobileNo: shippingData.facturation.portable,
                                Email: shippingData.facturation.email
                            }
                        },
                        Recipient: "CCC" === mode ? {
                            Address: {
                                Title: "Mr",
                                Firstname: shippingData.facturation.prenom,
                                Lastname: shippingData.facturation.nom,
                                Streetname: shippingData.facturation.adresse,
                                HouseNo: shippingData.facturation.adresse2,
                                CountryCode: shippingData.facturation.pays,
                                PostCode: shippingData.facturation.code_postal,
                                City: shippingData.facturation.ville,
                                AddressAdd1: shippingData.facturation.adresse3,
                                AddressAdd2: "",
                                AddressAdd3: "",
                                PhoneNo: shippingData.facturation.telephone,
                                MobileNo: shippingData.facturation.portable,
                                Email: shippingData.facturation.email
                            }
                        } : {
                            Address: {
                                Title: Expediteur.nom,
                                Firstname: "",
                                Lastname: "",
                                Streetname: Expediteur.adresse,
                                HouseNo: Expediteur.adresse2,
                                CountryCode: "FR",
                                PostCode: Expediteur.code_postal,
                                City: Expediteur.ville,
                                AddressAdd1: "",
                                AddressAdd2: "",
                                AddressAdd3: "",
                                PhoneNo: Expediteur.telephone,
                                MobileNo: Expediteur.portable,
                                Email: Expediteur.email
                            }
                        }
                    }
                }
            };

            const xml = this.generateQuery(mdRelayRequest);

            const res = await fetch(this.credentials.apiUrl, { method: 'POST', body: xml, headers: { 'Content-Type': 'text/xml; charset=utf-8' } });
            
            if(!res.ok) {
                return {
                    result: false,
                    trackingNumber: ``,
                    label: new Uint8Array()
                }
            } else {
                const xmlResponse = await res.text();
                
                // deno-lint-ignore no-explicit-any
                const obj: any = JSON.parse(xmlResponse);
                const labelUrl = obj['shipmentsListField'][0]['labelListField']['labelField']['outputField'];
                const trackingNumber = obj['shipmentsListField'][0]['shipmentNumberField'];

                const pdf = await fetch(labelUrl);
                if(!pdf.ok)
                    throw new Error(`Erreur de récupération de l'étiquette ${labelUrl}`);

                const blob = await pdf.blob();
                const uintArray = new Uint8Array(await blob.arrayBuffer());

                return {
                    result: true,
                    trackingNumber: trackingNumber,
                    label: uintArray
                }
            }            
        } catch(e) {
            throw e;
        }
    }


}