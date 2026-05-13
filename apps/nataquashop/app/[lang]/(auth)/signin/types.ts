export enum AuthView {
  LOGIN = 'login',
  CHOICE = 'choice',
  PARTICULIER_STEP1 = 'particulier-1',
  PARTICULIER_STEP2 = 'particulier-2',
  CLUB_STEP1 = 'club-1',
  CLUB_STEP2 = 'club-2'
}

export interface ParticulierData {
  nom: string;
  prenom: string;
  civilite: string;
  societe: string;
  adresse: string;
  codePostal: string;
  ville: string;
  complement: string;
  etage: string;
  pays: string;
  email: string;
  emailConfirm: string;
  password: string;
  passwordConfirm: string;
  telephone: string;
  portable: string;
  birthdate: string;
  codeClub: string;
  cgu: boolean;
}

export interface ClubData {
  nom: string;
  prenom: string;
  civilite: string;
  adresse: string;
  codePostal: string;
  ville: string;
  complement: string;
  etage: string;
  pays: string;
  nomClub: string;
  president: string;
  referent: string;
  email: string;
  emailConfirm: string;
  password: string;
  passwordConfirm: string;
  telephone: string;
  portable: string;
  siren: string;
  tva: string;
  cgu: boolean;
} 