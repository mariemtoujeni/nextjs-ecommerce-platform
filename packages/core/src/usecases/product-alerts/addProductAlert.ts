import { CreateAlertInput, InsertedProductAlert } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const addProductAlertUseCase = async (productAlert: CreateAlertInput): Promise<InsertedProductAlert> => {
  const productAlertRepository = await getInjection("IProductAlertRepository");
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();
  if (!user) {
      throw new UnauthorizedError("User not found");
  }  
  const email = user.email || productAlert.email;
  if (!user.is_anonymous) {
    const clientRepository = await getInjection("IClientRepository");
    const client = await clientRepository.read(user.id);
    const createdProductAlert = await productAlertRepository.create({
      idModel: productAlert.idModel,
      email: email,
      clientNumber: client.clientNumber,
    });
    return createdProductAlert;
  }
  const createdProductAlert = await productAlertRepository.create({
      idModel: productAlert.idModel,
      email: email,
  });

  return createdProductAlert;
};
