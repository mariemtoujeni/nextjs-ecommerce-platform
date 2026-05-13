import { getInjection, UnauthorizedError } from "../../types";
import { Opinion, opinionInput, opinionInputSchema } from "../../models";


export const addOpinionClientUseCase = async (input: opinionInput): Promise<Opinion> => {   
    const clientRepository = await getInjection('IClientRepository');
    const opinionRepository = await getInjection('IOpinionRepository');
    const authService = await getInjection('IAuthenticationService');
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError("User not found");
    }
    const validateOpinion = opinionInputSchema.parse(input);
    const client = await clientRepository.read(user.id)    
    const savedOpinion  = await opinionRepository.addOpinion(validateOpinion,client)
    return savedOpinion ;

}