import { ShippingData, ShippingLabelResult } from "../../models";
import { Carrier, Expediteur } from "./Carrier";
import { Environment } from "../../types/utils";
import { InternalServerError } from "../../types/error";


type MondialRelayAuth = {
    login: string;
    password: string;
    customerId: string;
    apiUrl: string;
}

const credentials: Record<string, MondialRelayAuth> = {
    'test': {
        login: "BDTEST@business-api.mondialrelay.com",
        password: "'2crtPDo0ZL7Q*3kLumB",
        customerId: "BDTEST",
        apiUrl: "https://connect-api-sandbox.mondialrelay.com/api/shipment"
    },
    'production': {
        login: "",
        password: "",
        customerId: "",
        apiUrl: "https://connect-api.mondialrelay.com/api/shipment"
    },
    'development': {
        login: "BDTEST@business-api.mondialrelay.com",
        password: "'2crtPDo0ZL7Q*3kLumB",
        customerId: "BDTEST",
        apiUrl: "https://connect-api-sandbox.mondialrelay.com/api/shipment"
    }
}

export class MondialRelay extends Carrier {
    private credentials: MondialRelayAuth;

    constructor(env: Environment) {
        super(env);
        const creds = credentials[env];
        if (!creds) {
            throw new Error(`No credentials found for environment: ${env}`);
        }
        this.credentials = creds;
        this.startQuery = `<?xml version="1.0" encoding="utf-8"?>
<ShipmentCreationRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.example.org/Request">`;
        this.endQuery = `</ShipmentCreationRequest>`;
    }

    async createShippingLabel(shippingData: ShippingData): Promise<ShippingLabelResult> {
        throw new Error("Not implemented");
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
                        OrderNo: shippingData.orderId,
                        CustomerNo: shippingData.clientNumber,
                        ParcelCount: "1",
                        DeliveryMode: [
                            { key: "Mode", value: "24R" }   ,
                            { key: "Location", value: `${shippingData.shippingAddress.country}-${shippingData.shippingAddress.idRelais}` }
                        ],
                        CollectionMode: [
                            { key: "Mode", value: mode },
                            { key: "Location", value: "" }
                        ],
                        Parcels: {
                            Parcel: {
                                Content: "Sportwear",
                                Weight: [
                                    { key: "Value", value: shippingData.weight },
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
                                Firstname: shippingData.shippingAddress.firstName,
                                Lastname: shippingData.shippingAddress.lastName,
                                Streetname: shippingData.shippingAddress.address,
                                HouseNo: shippingData.shippingAddress.address2,
                                CountryCode: shippingData.shippingAddress.country,
                                PostCode: shippingData.shippingAddress.postalCode,
                                City: shippingData.shippingAddress.city,
                                AddressAdd1: shippingData.shippingAddress.address3,
                                AddressAdd2: "",
                                AddressAdd3: "",
                                PhoneNo: shippingData.shippingAddress.phone,
                                MobileNo: shippingData.shippingAddress.mobile,
                                Email: shippingData.shippingAddress.email
                            }
                        },
                        Recipient: "CCC" === mode ? {
                            Address: {
                                Title: "Mr",
                                Firstname: shippingData.shippingAddress.firstName,
                                Lastname: shippingData.shippingAddress.lastName,
                                Streetname: shippingData.shippingAddress.address,
                                HouseNo: shippingData.shippingAddress.address2,
                                CountryCode: shippingData.shippingAddress.country,
                                PostCode: shippingData.shippingAddress.postalCode,
                                City: shippingData.shippingAddress.city,
                                AddressAdd1: shippingData.shippingAddress.address3,
                                AddressAdd2: "",
                                AddressAdd3: "",
                                PhoneNo: shippingData.shippingAddress.phone,
                                MobileNo: shippingData.shippingAddress.mobile,
                                Email: shippingData.shippingAddress.email
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
                throw new InternalServerError(`Erreur lors de la création de l'étiquette ${res.statusText}`);
            } else {
                const xmlResponse = await res.text();

                // deno-lint-ignore no-explicit-any
                const obj: any = JSON.parse(xmlResponse);
                const labelUrl = obj['shipmentsListField'][0]['labelListField']['labelField']['outputField'];
                const trackingNumber = obj['shipmentsListField'][0]['shipmentNumberField'];

                const pdf = await fetch(labelUrl);

                if(!pdf.ok) {
                    throw new Error(`Erreur de récupération de l'étiquette ${labelUrl}`);
                }

                const blob = await pdf.blob();

                const uintArray = new Uint8Array(await blob.arrayBuffer());

                return {
                    result: true,
                    trackingNumber: trackingNumber,
                    label: uintArray
                }
            }
        } catch(error: any) {
            throw new InternalServerError(error.message);
        }
    }
}