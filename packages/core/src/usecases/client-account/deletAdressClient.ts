import { getInjection, UnauthorizedError } from "../../types";

export const deleteAdressClientUseCase = async (id:number): Promise<void> => {
     const deleteAdress = await getInjection('IClientRepository');
        const authService = await getInjection('IAuthenticationService');
    
        const user = await authService.getUser();
    
        if (!user) {
            throw new UnauthorizedError("User not found");
        }
         const deleteAdressClient = await deleteAdress.deletAdressClient(id)
         return deleteAdressClient;

}