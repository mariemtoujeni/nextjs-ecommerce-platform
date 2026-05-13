import { SharedMemory } from "@repo/core/adapters/mock";
import { UserRoles } from "../../../src/models/User";

export const setup = () => {
    SharedMemory.users = [
        { id: "1", email: "admin@admin.com", user_role: UserRoles.SUPER_ADMIN, first_name: "Admin", last_name: "Admin", password: "admin", is_anonymous: false },
    ]
    SharedMemory.events = [
        {
            id: 1,
            name: "Spring Sale 2024",
            status: 1,
            image: "https://example.com/images/spring-sale.jpg",
            description: "Enjoy massive discounts during our Spring Sale event.",
            startDate: new Date("2024-03-01"),
            endDate: new Date("2024-03-31"),
            createdAt: new Date("2024-02-15"),
            url: "https://example.com/events/spring-sale-2024"
        },
        {
            id: 2,
            name: "Summer Launch",
            status: 2,
            image: "https://example.com/images/summer-launch.jpg",
            description: "Join us for our exciting summer product launch event.",
            startDate: new Date("2024-06-01"),
            endDate: new Date("2024-06-15"),
            createdAt: new Date("2024-05-10"),
            url: "https://example.com/events/summer-launch"
        }
    ];
};

export const teardown = () => {
    SharedMemory.clear();
};
