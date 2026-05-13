import { FilterAttributeInput, Product, ProductFilterInput, ProductWithAdmin, productOptionsSchema } from "../../models";
import { BadRequestError, ReturnAll, getInjection } from "../../types";


export const listAllProductsUseCase = async (options?: ProductFilterInput, optionsFilterAttribute?: FilterAttributeInput[]): Promise<ReturnAll<ProductWithAdmin>> => {

    const validatedOptions = productOptionsSchema.safeParse(options || {});

    if(!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const productRepository = await getInjection('IProductRepository');

    const products = await productRepository.read(validatedOptions.data, optionsFilterAttribute);

    return products;
}