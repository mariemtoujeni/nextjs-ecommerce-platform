import { SharedMemory } from "@repo/core/adapters/mock";

export const setup = async () =>  {

  SharedMemory.subCategories = Array.from({ length: 10 }, (_, i) => ({
    id: 300 + i + 1,
    name: `SubCategory ${i + 1}`,
    active: i % 2,
    order: (i % 5) + 1,
  }));
};

export const teardown = async () =>  {
  SharedMemory.subCategories = [];
};
