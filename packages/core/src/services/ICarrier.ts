import { ShippingData, ShippingLabelResult } from "../models";

export interface ICarrier {
    createShippingLabel(shippingData: ShippingData): Promise<ShippingLabelResult>;
    createReturnLabel(shippingData: ShippingData): Promise<ShippingLabelResult>;
    generateXml(data: any): string;
    generateQuery(data: any): string;
}