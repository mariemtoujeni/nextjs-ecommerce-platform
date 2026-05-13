import { SignUpPayload } from "@repo/core/models";
import { ParticulierData } from "./types";

export function mapParticulierToSignUpPayload(data: ParticulierData): SignUpPayload {
  return {
    user: {
      email: data.email,
      password: data.password,
    },
    client: {
      lastName: data.nom,
      firstName: data.prenom,
      mobilePhone: data.portable || undefined,
      phone: data.telephone || undefined,
      birthDate: data.birthdate ? new Date(data.birthdate) : null,
      clubId: data.codeClub ? Number(data.codeClub) : undefined,
    },
    address: {
      civility: data.civilite,
      address: data.adresse,
      complement: data.complement || undefined,
      building: data.etage || undefined,
      postalCode: data.codePostal,
      city: data.ville,
      country: data.pays,
      company: data.societe || undefined,
    },
  };
}