import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";
import { InventoryStatus } from "@repo/core/models"; 

export const setup = () => {
    SharedMemory.inventory = [
        {
            id: 1,
            name: "Warehouse A",
            valorisation: "15000.50",
            createdAt: new Date("2024-12-01T10:15:00Z").toISOString(),
            status: InventoryStatus.EN_ATTENTE,
        },
        {
            id: 2,
            name: "Warehouse B",
            valorisation: "9200.00",
            createdAt: new Date("2025-01-15T08:30:00Z").toISOString(),
            status: InventoryStatus.VALIDE,
        },
        {
            id: 3,
            name: "Storage Facility C",
            valorisation: "21000.75",
            createdAt: new Date("2025-02-20T14:00:00Z").toISOString(),
            status: InventoryStatus.VALIDE,
        },
        {
            id: 4,
            name: "Depot D",
            valorisation: "5000.00",
            createdAt: new Date("2025-03-10T09:45:00Z").toISOString(),
            status: InventoryStatus.VALIDE,
        },
        {
            id: 5,
            name: "Warehouse E",
            valorisation: "12000.00",
            createdAt: new Date("2025-04-25T11:20:00Z").toISOString(),
            status: InventoryStatus.EN_ATTENTE,
        },
        {
            id: 6,
            name: "Central Stock F",
            valorisation: "18000.33",
            createdAt: new Date("2025-05-30T17:10:00Z").toISOString(),
            status: InventoryStatus.ARCHIVE,
        },
    ];
}

export const teardown = () => {
    SharedMemory.clear();
}
