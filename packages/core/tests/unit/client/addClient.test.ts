import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { populateClientDetailsUseCase } from "../../../src/usecases";
import { setup, teardown } from "./_Setup";
import { ClientAddressInput, ClientInput, ClientType, ClubInput } from "../../../src/models";
import { getInjection } from "../../../src/types/di";

describe("addClientUseCase", () => {
  beforeAll(setup);
  afterAll(teardown);

  it("should add a client of type CLIENT", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    
    const mockClient: ClientInput = {
      firstName: "Test",
      lastName: "User",
      email: "testuser@nataquashop.com",
      mobilePhone: "+1-555-987-6543",
      fidelityPoints: 150,
      credit: 75.50,
      type: ClientType.CLIENT,
      marketingEmail: true,
      marketingSMS: false,
      clubId: 101,
      phone: "",
      workPhone: "",
      clientNumber: 0
    };

    const mockAddress: ClientAddressInput = {
      company: "Acme Corp HQ",
      country: "USA",
      address: "123 Elm Street",
      postCode: "90210",
      city: "Metropolis",
    };

    const client = await populateClientDetailsUseCase(mockClient, mockAddress);
    expect(client.mobilePhone).toBe(mockClient.mobilePhone);
    expect(client.type).toBe(mockClient.type);
  });
  it("should add a client of type CLUB and assign a clubId", async () => {
    const mockClient: ClientInput = {
      firstName: "Club",
      lastName: "Manager",
      email: "club@nataquashop.com",
      mobilePhone: "+1-555-000-0000",
      fidelityPoints: 0,
      credit: 0,
      type: ClientType.CLUB,
      marketingEmail: false,
      marketingSMS: false,
      phone: "",
      workPhone: "",
      clientNumber: 0,
    };

    const mockAddress: ClientAddressInput = {
      company: "Main Club",
      country: "FR",
      address: "10 Rue du Club",
      postCode: "75000",
      city: "Paris",
    };

    const mockClub: ClubInput = {
      name: "Nataqua Club",
      president: "Jean Clubber",
      email: "contact@nataqua.club",
      accountantAccount: "ACC-123456",
      paymentMode: 1,
      paymentDelay: 0,
      phone: "+33-1-23-45-67-89",
      partner: false,
      valid: true,
      code: "NC-001",
      referent: "Rémy",
      siren: "123456789",
      tvaNumber: "FR1234567890",
    };

    const result = await populateClientDetailsUseCase(mockClient, mockAddress, mockClub);

    expect(result.type).toBe(ClientType.CLUB);
    expect(result.clubId).toBeDefined();
  });
  it("should add a client of type CLUB_PARTENAIRE and assign an existing clubMemberId", async () => {
    const mockClient: ClientInput = {
      firstName: "Member",
      lastName: "Affiliated",
      email: "partner@nataquashop.com",
      mobilePhone: "+1-555-999-9999",
      fidelityPoints: 0,
      credit: 0,
      type: ClientType.CLUB_PARTENAIRE,
      marketingEmail: true,
      marketingSMS: true,
      phone: "",
      workPhone: "",
      clientNumber: 0,
      clubMemberId: 123, // simulate existing club ID
    };

    const mockAddress: ClientAddressInput = {
      company: "Partner Club",
      country: "FR",
      address: "5 Avenue des Partenaires",
      postCode: "69000",
      city: "Lyon",
    };

    const result = await populateClientDetailsUseCase(mockClient, mockAddress);

    expect(result.type).toBe(ClientType.CLUB_PARTENAIRE);
    expect(result.clubMemberId).toBe(mockClient.clubMemberId);
  });

});
