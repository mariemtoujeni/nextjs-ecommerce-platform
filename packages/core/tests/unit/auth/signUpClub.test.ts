import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setup, teardown } from "./_Setup";
import { AddressSignUpInput, clubSignUpInput, SignUpClubSchema, signUpInput, UserData } from "@repo/core/models";
import { signUpClubUseCase } from "src/usecases/auth/signUpClub";
import { SharedMemory } from "../../../../core/src/adapters/mock";

describe('SignUpUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);
    it('should create a new user and client', async () => {
    

    const userData: UserData = {
      email: 'newuser@test.com',
      password: 'Password123!'     
    };
    const signUpData: signUpInput ={
      lastName: "Dupont",
      firstName: "Marie",
     
    }
    const addressData: AddressSignUpInput = {
      civility: "Madame",
      address: "3 rue metz",
      postalCode: "75010",
      city: "paris",
      country: "france"
    }
    const clubData: clubSignUpInput= {
        name: "Club de Test",
        president: "President de Test",
        referent: "Test",
        siren: "sirenTest",
        tvaNumber: "tvaTest"
    };

    // Call use case
    const newUser = await signUpClubUseCase(SignUpClubSchema.parse({
      user: userData,
      client: signUpData,
      address: addressData,
      club:clubData
      
    }));

    // Assertions
    expect(newUser).toBeDefined();
    

    // Vérifier que l'utilisateur a été ajouté en mémoire
    const addedUser = SharedMemory.users.find(u => u.email === userData.email);
    expect(addedUser).toBeDefined();
    expect(addedUser?.email).toBe(userData.email);

    
  });
})