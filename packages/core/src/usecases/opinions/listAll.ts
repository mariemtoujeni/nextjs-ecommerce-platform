import { Opinion, OpinionFilterInput, opinionOptionsSchema } from "../../models";
import { getInjection, ReturnAll, BadRequestError } from "../../types";

export const listAllOpinionsUseCase = async (options?: OpinionFilterInput): Promise<ReturnAll<Opinion> >=> {

    const validatedOptions = opinionOptionsSchema.safeParse(options || {});
    
        if(!validatedOptions.success) {
            throw new BadRequestError("Invalid options");
        }
    
        const opinionRepository = await getInjection('IOpinionRepository');
    
        const Opinions = await opinionRepository.read(validatedOptions.data)
        return Opinions;
}