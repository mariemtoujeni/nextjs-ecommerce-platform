import { SignUpClub } from "@repo/core/models";
import { ClubData } from "./types";

export function mapClubToSignUpPayload(data: ClubData): SignUpClub {
    return {
    user: {
         email: data.email,
         password: data.password,
    },
    client: {
        lastName: data.nom ,
        firstName: data.prenom ,
    },
    address: {
        civility: data.civilite,
        address: data.adresse,
        postalCode:data.codePostal,
        city: data.ville,
        country: data.pays
    },
    club:{
        name: data.nomClub,
        president: data.president,
        referent: data.referent,
        siren: data.siren,
        tvaNumber: data.tva
    }
  };
}