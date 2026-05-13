import { BrandFilterInput, brandOptionsSchema } from "../../repositories";
import { BadRequestError, getInjection } from "../../types";

export const listAllBrandsUseCase = async (options: BrandFilterInput) => {
    const validatedOptions = brandOptionsSchema.safeParse(options || {});

    if(!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const brandRepository = await getInjection("IBrandRepository")
    const brands = await brandRepository.readAll(validatedOptions.data);
    
    return brands;
}