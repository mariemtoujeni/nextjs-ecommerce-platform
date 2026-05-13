import { generateSecurePassword } from "../../types/utils";
import { Client, ClientAddressInput, ClientInput, ClientType, ClubInput, SignUpRequest, signUpSchema, } from "../../models";
import { getInjection } from "../../types/di";
import { BadRequestError } from "../../types/error";

export const populateClientDetailsUseCase = async ( client: ClientInput, address: ClientAddressInput, club?: ClubInput ): Promise<Client> => {
  const clientRepository = await getInjection("IClientRepository");

  const generatedPassword = generateSecurePassword(8);
  
  const userWithPassword: SignUpRequest = {
    password: generatedPassword,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    country: address.country,
    postCode: address.postCode,
    city: address.city,
    Address: address.address,
  };

  const validatedUser = signUpSchema.safeParse(userWithPassword);

  if (!validatedUser.success) {
    throw new BadRequestError("Invalid options");
  }

  const authService = await getInjection("IUserRepository");
  const userInfo = await authService.createUserByAdmin(validatedUser.data);

  if (!userInfo.isNew) {
    await authService.updateUserByAdmin(validatedUser.data, userInfo.numero_client);
  }

  // Handle CLUB and CLUB_PARTENAIRE logic (if exists update if not add a new)
  // for the type CLUB_PARTENAIRE the flag partner is set to true
  if ((client.type === ClientType.CLUB || client.type === ClientType.CLUB_PARTENAIRE) && club) {
    const existingClub = await clientRepository.readClubByClientNumber(userInfo.numero_client);

    if (existingClub) {
      await clientRepository.updateClub({ id: existingClub.id, ...club });
      if (client.type === ClientType.CLUB_PARTENAIRE) {
        client.clubMemberId = existingClub.id;
      } else {
        client.clubId = existingClub.id;
      }
    } else {
      const newClub: ClubInput = {
        ...club,
        ...(client.type === ClientType.CLUB_PARTENAIRE ? { partner: true } : {}),
      };

      const createdClub = await clientRepository.addClub(newClub);
      if (client.type === ClientType.CLUB_PARTENAIRE) {
        client.clubMemberId = createdClub.id;
      } else {
        client.clubId = createdClub.id;
      }
    }
  }

  if (client.type === ClientType.CLUB_PARTENAIRE && !client.clubMemberId) {
    throw new BadRequestError("Club partenaire must be assigned to an existing club (clubMemberId)");
  }

  const { clubId, clubMemberId, ...clientWithoutClubIds } = client;

  await clientRepository.updateClient({
    ...clientWithoutClubIds,
    ...address,
    clientNumber: userInfo.numero_client,
    ...(clubId ? { clubId } : {}),
    ...(clubMemberId ? { clubMemberId } : {}),
  });

  const updatedClient = await clientRepository.readByClientNumber(userInfo.numero_client);
  return updatedClient;
};
