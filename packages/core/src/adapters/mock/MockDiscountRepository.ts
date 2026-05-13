import { IDiscountRepository } from "../../repositories";
import { Discount, DiscountCombination, DiscountFilter, DiscountInput, DiscountLine, DiscountLineInput, DiscountState, OrderDiscount, OrderDiscountInput, TypeDiscount } from "../../models/Discount";
import { SharedMemory } from "./SharedMemory";
import { NotFoundError, ReturnAll } from "@repo/core/types";
import { ReductionType } from "../../models";

export class MockDiscountRepository implements IDiscountRepository {
  createOrderDiscount(orderDiscount: OrderDiscountInput): Promise<OrderDiscount> {
    throw new Error("Method not implemented.");
  }
  readDiscountLineById(id: number): Promise<DiscountLine> {
    throw new Error("Method not implemented.");
  }
  deleteDiscountLine(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async updateDiscountLine(discountLine: DiscountLine): Promise<DiscountLine> {
    const index = SharedMemory.discountLines.findIndex(d => d.id === discountLine.id);
    if (index === -1) {
      throw new NotFoundError(`discountLine ${discountLine.id} not found`);
    }
  const existing = SharedMemory.discountLines[index];
  if (!existing) throw new NotFoundError(`discountLine ${discountLine.id} not found`);

    const updated: DiscountLine = {
      ...existing,
      ...discountLine,
      id: discountLine.id,
      discount: existing.discount || {},
    };
    SharedMemory.discountLines[index] = updated;

    return updated;
  }

  async deleteDiscount(id: number): Promise<void> {
    SharedMemory.discountLines = SharedMemory.discountLines.filter(e => e.id_reduction !== id);

    const indexDiscount = SharedMemory.discounts.findIndex(e => e.id === id);
      if (indexDiscount === -1) {
        throw new Error("discount not found");
      }
    SharedMemory.events.splice(indexDiscount, 1);
  }

  async updateDiscount(discount: Discount): Promise<Discount> {
    const index = SharedMemory.discounts.findIndex(d => d.id === discount.id);
    if (index === -1) {
      throw new NotFoundError(`Discount ${discount.id} not found`);
    }

  const existing = SharedMemory.discounts[index];
  if (!existing) throw new NotFoundError(`Discount ${discount.id} not found`);

    const updated: Discount = {
      ...existing,
      ...discount,
      id: discount.id,
    };

    SharedMemory.discounts[index] = updated;

    return updated;
  }


  async readCampagneDiscount(): Promise<DiscountLine[]> {
    const now = new Date();

    const matchingDiscounts = SharedMemory.discounts.filter(discount => {
      if (discount.etat !== DiscountState.ACTIVE) return false;
      if (discount.type !== ReductionType.CAMPAGNE) return false;

      if (discount.date_fin) {
        return discount.date_debut <= now && discount.date_fin >= now;
      } else {
        return discount.date_debut <= now;
      }
    });

    const lines: DiscountLine[] = [];

    for (const discount of matchingDiscounts) {
      for (const line of discount.discountLines) {
        lines.push({ ...line, discount });
      }
    }

    return lines;
  }


  async readCodeDiscount(code: string): Promise<DiscountLine[]> {
    const now = new Date();
    return SharedMemory.discountLines.filter(line => {
      const d = line.discount;
      if (d.etat !== DiscountState.ACTIVE) return false;
      if (d.code !== code) return false;

      return d.date_fin ? d.date_debut <= now && d.date_fin >= now : d.date_debut <= now;
    });
  }


  async readDiscountById(id: number): Promise<Discount> {
    const found = SharedMemory.discounts.find(d => d.id === id);
    if (!found) throw new NotFoundError(`Discount ${id} not found`);
    return found;
  }

  async addDiscountLine(discountLine: DiscountLineInput): Promise<DiscountLine> {
    const parent = SharedMemory.discounts.find(d => d.id === discountLine.id_reduction);
    if (!parent) throw new NotFoundError(`Parent discount ${discountLine.id_reduction} not found`);

    const nextId = SharedMemory.discountLines.length > 0
      ? Math.max(...SharedMemory.discountLines.map(l => l.id)) + 1
      : 1;

    const newLine: DiscountLine = {
      id: nextId,
      ...discountLine,
      discount: parent
    };

    parent.discountLines.push(newLine); 
    SharedMemory.discountLines.push(newLine); 

    return newLine;
  }

  async readClubDiscount(id_club: number): Promise<DiscountLine[]> {
    const now = new Date();

    const matchingDiscounts = SharedMemory.discounts.filter(discount =>
      discount.etat === DiscountState.ACTIVE &&
      discount.id_club === id_club &&
      (discount.date_fin ? discount.date_debut <= now && discount.date_fin >= now : discount.date_debut <= now)
    );

    const lines: DiscountLine[] = [];

    for (const discount of matchingDiscounts) {
      for (const line of discount.discountLines) {
        lines.push({ ...line, discount });
      }
    }

    return lines;
  }


  async readAll(options: DiscountFilter): Promise<ReturnAll<Discount>> {
    const { limit, offset, sort } = options;

    const discounts = sort === "asc"
      ? [...SharedMemory.discounts].sort((a, b) => a.id - b.id).slice(offset, offset + limit)
      : [...SharedMemory.discounts].sort((a, b) => b.id - a.id).slice(offset, offset + limit);

    return {
      total: SharedMemory.discounts.length,
      count: discounts.length,
      items: discounts
    };
  }

  async addDiscount(discount: DiscountInput): Promise<Discount> {
    const nextId = SharedMemory.discounts.length > 0
      ? Math.max(...SharedMemory.discounts.map(d => d.id)) + 1
      : 1;

    const newDiscount: Discount = {
      ...discount,
      id: nextId,
      discountLines: [],
      id_club: 0,
      combinaison: DiscountCombination.PRODUIT,
      id_user: ""
    };

    SharedMemory.discounts.push(newDiscount);

    return newDiscount;
  }

  async read(userId: string): Promise<Discount[]> {
    return SharedMemory.discounts.filter(discount => discount.id_user === userId);
  }
}
