import { SharedMemory } from "@repo/core/adapters/mock";
import { UserRoles } from "../../../src/models";
export const setup = async () =>  {
  SharedMemory.users = [
      { id: "1", email: "admin@admin.com", user_role: UserRoles.SUPER_ADMIN, first_name: "Admin", last_name: "Admin", password: "admin", is_anonymous: false },
  ]
  SharedMemory.categories = Array.from({ length: 10 }, (_, i) => ({
    id: 100 + i + 1,
    name: `Category ${i + 1}`,
    active: i % 2,
    order: i + 1,
  }));
};

export const teardown = async () =>  {
  SharedMemory.categories = [];
};
