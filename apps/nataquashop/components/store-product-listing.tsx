import { Product } from "@repo/core/models";
import { ReactNode } from "react";

interface Props {
    products: Product[];
    nbPages: number;
    page: number;
    translations: any;
    breadCrumb: ReactNode;
}

export function StoreProductListing({ products }: Props) {
    return (
        <div>
            <h1>Store Product Listing</h1>
        </div>
    )
}