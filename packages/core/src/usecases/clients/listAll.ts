import { Client, ClientFilterInput, clientOptionsSchema } from "../../models";
import { ErrorCodes, ReturnAll, getInjection } from "../../types";
import { UnauthorizedError, BadRequestError  } from "../../types/error";


export const listAllClientsUseCase = async (options?: ClientFilterInput): Promise<ReturnAll<Client>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    
    const validatedOptions = clientOptionsSchema.safeParse(options || {});
    if(!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const clientRepository = await getInjection('IClientRepository');
    const clients = await clientRepository.readAll(validatedOptions.data);    
    return clients;
}