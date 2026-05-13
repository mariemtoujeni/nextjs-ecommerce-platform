import { SharedMemory } from "@repo/core/adapters/mock"
import { ApiKey } from "@repo/core/models";

export const setup = () => {
    SharedMemory.apiKeys = [
        new ApiKey({
            id: 1, key: "api_key_arena", supplierId: 1, supplier: { id: 1, name: "ARENA", code: "ARENA", address: "1234567890", zipCode: "1234567890", city: "1234567890"
            , country: "1234567890", phone: "1234567890", email: "1234567890", siret: "1234567890" }
            , createdAt: "2024-01-01", updatedAt: "2024-01-01", expiresAt: ""
        })
    ]

    SharedMemory.models = [
        { id: 1, productId: 1, weight: 100, priceWithoutVat: 100, priceWithVat: 120, published: true, minStock: 0
            , purchasePrice: 80, barcode: "1111111111", supplierReference: "1111111111", manufacturerReference: "1111111111" 
            , attributValues: []
        }, 
        { id: 2, productId: 2, weight: 100, priceWithoutVat: 100, priceWithVat: 120, published: true, minStock: 0
            , purchasePrice: 80, barcode: "2222222222", supplierReference: "2222222222", manufacturerReference: "2222222222" 
            , attributValues: []
        }
    ]
}

export const teardown = () => {
    SharedMemory.clear();
}