"use server"
import { Product } from "@repo/core/models";
import { readProductUseCase } from "@repo/core/usecases";


    export const readProductAction = async (productId: number): Promise<Product> => {
   
       try{
         const product = await readProductUseCase(productId);
         if(!product){
            throw new Error (`Product with ID {$productId} not found`)
         }
         return product;

       }catch(error){
        throw new Error('Failed to read product. ');

       }

        
    
}