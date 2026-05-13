import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";

export const setup = () => {
    SharedMemory.opinions = [
        { id: 1, productId: 1, userId: 1, pseudo: "John Doe", email: "test@test.com", title: "Great product!"
            , text: "I really loved this product. It exceeded my expectations.", rating: 5, createdAt: new Date()
            , modelId: 1, commandId: 1, responseAdmin: "", validated: true, actif: true
            , product: { id: 0  }, descriptions: [], images: [], client: { userId: "",email: "", firstName: "",
                lastName: "", phone: "", mobilePhone: "", clientNumber: 0 }
        },
        { id: 2, productId: 1, userId: 2, pseudo: "Jane Smith", email: "test@test.fr", title: "Not bad", text: "The product was okay, but I expected more."
            , rating: 3, createdAt: new Date(), modelId: 1, commandId: 2, responseAdmin: "", validated: true, actif: true
            , product: { id: 0  }, descriptions: [], images: [], client: { userId: "",email: "", firstName: "",
                lastName: "", phone: "", mobilePhone: "", clientNumber: 0 } 
        },
    ];
}
export const teardown = () => {
    SharedMemory.clear();
}