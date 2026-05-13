// import { afterAll, beforeAll, describe, expect, it } from "vitest";
// import { populateClientDetailsUseCase } from "@repo/core/usecases";
// import { SupabaseClient } from "@supabase/supabase-js";
// import { signInTestUser, TestUser } from "../utils";
// import { getInjection } from "@repo/core/types";
// import { ClientType } from "@repo/core/models";

// describe("addClientUseCase", () => {
//   let supabase: SupabaseClient;
//   let clientNumber: number;

//   beforeAll(async () => {
//     await signInTestUser(TestUser.ADMIN);
//     supabase = await getInjection("ISupabaseClient");
//   });

//   afterAll(async () => {
//   });

//   it("should add a client", async () => {
//     const clientDataSample = {
//       firstName: "TESTJohn",
//       lastName: "TESTDoe",
//       email: "test.user.test1@example.com",
//       mobilePhone: "1234567890",
//       phone: "0987654321",
//       workPhone: "1122334455",
//       fidelityPoints: 150,
//       credit: 200,
//       type: ClientType.CLUB_PARTENAIRE,
//       marketingEmail: true,
//       marketingSMS: false,
//       clientNumber: 1234567,
//     };

//     const clientAddressSample = {
//       company: "TESTCompany",
//       country: "TESTCountry",
//       address: "123 TEST Street",
//       postCode: "TEST1234",
//       city: "TESTCity",
//     };

//     const clubSample = {
//       email: clientDataSample.email,
//       phone: clientDataSample.phone,
//       valid: true,
//       code: "CLB123",
//       name: clientDataSample.firstName,
//       president: "John Doe",
//       accountantAccount: "ACC456789",
//       paymentMode: 1, 
//       paymentDelay: 30, 
//       referent: "Jane Smith",
//       partner: false,
//       siren: "123456789",
//       tvaNumber: 987654321,
//     };

//     const clientData = await populateClientDetailsUseCase(clientDataSample, clientAddressSample, clubSample);

//     expect(clientData).toBeDefined();
//     expect(typeof clientData).toBe("object");

//     expect(clientData.firstName).toBe(clientDataSample.firstName);
//     expect(clientData.lastName).toBe(clientDataSample.lastName);
//     expect(clientData.email).toBe(clientDataSample.email);
//     expect(clientData.mobilePhone).toBe(clientDataSample.mobilePhone);
//     expect(clientData.phone).toBe(clientDataSample.phone);
//     expect(clientData.workPhone).toBe(clientDataSample.workPhone);
//     expect(clientData.fidelityPoints).toBe(clientDataSample.fidelityPoints);
//     expect(clientData.credit).toBe(clientDataSample.credit);
//     expect(clientData.type).toBe(clientDataSample.type);

//     expect(clientData.clientAddress).toBeDefined();
//     expect(clientData.clientAddress.country).toBe(clientAddressSample.country);
//     expect(clientData.clientAddress.address).toBe(clientAddressSample.address);
//     expect(clientData.clientAddress.postCode).toBe(clientAddressSample.postCode);
//     expect(clientData.clientAddress.city).toBe(clientAddressSample.city);

//     expect(clientData.club).toBeDefined();
//     expect(clientData.club.president).toBe(clubSample.president);
//     expect(clientData.club.referent).toBe(clubSample.referent);
//     expect(clientData.club.paymentDelay).toBe(clubSample.paymentDelay);
//     expect(clientData.club.paymentMode).toBe(clubSample.paymentMode);

//     clientNumber = clientData.clientNumber;
//   });
// });
