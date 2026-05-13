 // Usecase pour récupérer la liste des réductions du client connecté, triées du plus récent au plus ancien
import { Discount } from "../../models";
import { UnauthorizedError, getInjection } from "../../types";

export const getClientDiscountsUseCase = async (): Promise<Discount[]> => {
    const discountRepository = await getInjection('IDiscountRepository');
    const authService = await getInjection('IAuthenticationService');

    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    // On récupère les réductions de l'utilisateur connecté
    const discounts = await discountRepository.read(user.id);
    // Tri décroissant par date_debut
    return discounts.sort((a: Discount, b: Discount) => b.date_debut.getTime() - a.date_debut.getTime());
}
