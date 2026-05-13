import { SharedMemory } from "@repo/core/adapters/mock";
import { UserRoles } from "../../../src/models";

export const setup = () => {
    SharedMemory.users = [
        { id: "1", email: "admin@admin.com", user_role: UserRoles.SUPER_ADMIN, first_name: "Admin", last_name: "Admin", password: "admin", is_anonymous: false },
    ]

    SharedMemory.stocks = [
        {
            idModel: 1,
            locked: 1,
            indisponible: 0,
            disponible: 9,
            updatedAt: new Date().toISOString()
        },
        {
            idModel: 2,
            locked: 2,
            indisponible: 0,
            disponible: 8,
            updatedAt: new Date().toISOString()
        },
        {
            idModel: 3,
            locked: 3,
            indisponible: 0,
            disponible: 7,
            updatedAt: new Date().toISOString()
        }
    ]
}

export const teardown = () => {
    SharedMemory.stocks = [];
}