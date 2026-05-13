import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setup, teardown } from "./_Setup";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { deleteAdressClientUseCase } from "../../../src/usecases";
import { SharedMemory } from "@repo/core/adapters/mock";

describe("updateAddressClientUseCase", () => {
     beforeEach(setup);
     afterEach(teardown),
           it("should throw UnauthorizedError if no user is logged in", async () => {
         await expect(deleteAdressClientUseCase(1)).rejects.toThrow(UnauthorizedError);
     });

     it('should delete address client', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("jean.dupont@email.com", "test");
        await deleteAdressClientUseCase(1);
        expect(SharedMemory.addresses).toHaveLength(0)

     })  
         
    

});