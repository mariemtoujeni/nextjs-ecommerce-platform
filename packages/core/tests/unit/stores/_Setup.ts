import { SharedMemory } from "@repo/core/adapters/mock";

export const setup = async () =>  {
  SharedMemory.stores = Array.from({ length: 10 }, (_, i) => ({
    id: 600 + i + 1,
    name: `Store ${String.fromCharCode(65 + i)}`,
    active: i % 2,
    order: i + 1,
  }));
};

export const teardown = async () =>  {
  SharedMemory.stores = [];
};
