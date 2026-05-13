'use client';
import { useState, useEffect } from 'react';
import AuthLogin from './AuthLogin';
import AuthSignupChoice from './AuthSignupChoice';
import SignupParticulierStep1 from './SignupParticulierStep1';
import SignupParticulierStep2 from './SignupParticulierStep2';
import SignupClubStep1 from './SignupClubStep1';
import SignupClubStep2 from './SignupClubStep2';
import { getDictionary } from '../../../dictionaries';
import { AuthView, type ParticulierData, type ClubData } from './types';

const initialParticulierData: ParticulierData = {
  nom: '', prenom: '', civilite: '', societe: '', adresse: '', codePostal: '', ville: '', complement: '', etage: '', pays: 'France',
  email: '', emailConfirm: '', password: '', passwordConfirm: '', telephone: '', portable: '', birthdate: '', codeClub: '', cgu: false
};

const initialClubData: ClubData = {
  nom: '', prenom: '', civilite: '', adresse: '', codePostal: '', ville: '', complement: '', etage: '', pays: 'France',
  nomClub: '', president: '', referent: '', email: '', emailConfirm: '', password: '', passwordConfirm: '', telephone: '', portable: '', siren: '', tva: '', cgu: false
};

export default function SigninPage({ dict }: { dict: any }) {

  const [view, setView] = useState<AuthView>(AuthView.LOGIN);
  const [particulierData, setParticulierData] = useState<ParticulierData>(initialParticulierData);
  const [clubData, setClubData] = useState<ClubData>(initialClubData);
  const [error, setError] = useState<string | undefined>(undefined);

  // Afficher un loader pendant le chargement du dictionnaire
  if (!dict) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  function validateParticulierStep1() {
    const { nom, prenom, civilite, adresse, codePostal, ville, pays } = particulierData;
    if (!nom || !prenom || !civilite || !adresse || !codePostal || !ville || !pays) {
      setError(dict.login.fillRequired);
      return false;
    }
    setError(undefined);
    return true;
  }

  function validateParticulierStep2() {
    const { email, emailConfirm, password, passwordConfirm, portable, birthdate, cgu } = particulierData;
    if (!email || !emailConfirm || !password || !passwordConfirm || !portable || !birthdate) {
      setError(dict.login.fillRequired);
      return false;
    }
    if (email !== emailConfirm) {
      setError(dict.login.emailMatch);
      return false;
    }
    if (password !== passwordConfirm) {
      setError(dict.login.passwordMatch);
      return false;
    }
    if (!cgu) {
      setError(dict.login.acceptCGU);
      return false;
    }
    setError(undefined);
    return true;
  }

  function validateClubStep1() {
    const { nom, prenom, civilite, adresse, codePostal, ville, pays } = clubData;
    if (!nom || !prenom || !civilite || !adresse || !codePostal || !ville || !pays) {
      setError(dict.login.fillRequired);
      return false;
    }
    setError(undefined);
    return true;
  }

  function validateClubStep2() {
    const { nomClub, president, referent, email, emailConfirm, password, passwordConfirm, portable, cgu } = clubData;
    if (!nomClub || !president || !referent || !email || !emailConfirm || !password || !passwordConfirm || !portable ) {
      setError(dict.login.fillRequired);
      return false;
    }
    if (email !== emailConfirm) {
      setError(dict.login.emailMatch);
      return false;
    }
    if (password !== passwordConfirm) {
      setError(dict.login.passwordMatch);
      return false;
    }
    if (!cgu) {
      setError(dict.login.acceptCGU);
      return false;
    }
    setError(undefined);
    return true;
  }

  let content = null;
  if (view === AuthView.LOGIN) {
    content = <AuthLogin dict={dict} onSignup={() => setView(AuthView.CHOICE)} />;
  } else if (view === AuthView.CHOICE) {
    content = <AuthSignupChoice
      dict={dict}
      onParticulier={() => setView(AuthView.PARTICULIER_STEP1)}
      onClub={() => setView(AuthView.CLUB_STEP1)}
      onLogin={() => setView(AuthView.LOGIN)}
    />;
  } else if (view === AuthView.PARTICULIER_STEP1) {
    content = <SignupParticulierStep1
      dict={dict}
      data={particulierData}
      onChange={setParticulierData}
      onNext={() => { if (validateParticulierStep1()) setView(AuthView.PARTICULIER_STEP2); }}
      onBack={() => setView(AuthView.CHOICE)}
      error={error}
      onLogin={() => setView(AuthView.LOGIN)}
    />;
  } else if (view === AuthView.PARTICULIER_STEP2) {
    content = <SignupParticulierStep2
      dict={dict}
      data={particulierData}
      onChange={setParticulierData}
      onBack={() => setView(AuthView.PARTICULIER_STEP1)}
      onSubmit={() => { if (validateParticulierStep2()) alert('Compte créé avec succès !'); }}
      error={error}
      onLogin={() => setView(AuthView.LOGIN)}
    />;
  } else if (view === AuthView.CLUB_STEP1) {
    content = <SignupClubStep1
      dict={dict}
      data={clubData}
      onChange={setClubData}
      onNext={() => { if (validateClubStep1()) setView(AuthView.CLUB_STEP2); }}
      onBack={() => setView(AuthView.CHOICE)}
      error={error}
      onLogin={() => setView(AuthView.LOGIN)}
    />;
  } else if (view === AuthView.CLUB_STEP2) {
    content = <SignupClubStep2
      dict={dict}
      data={clubData}
      onChange={setClubData}
      onBack={() => setView(AuthView.CLUB_STEP1)}
      onSubmit={() => { if (validateClubStep2()) alert('Compte club créé avec succès !'); }}
      error={error}
      onLogin={() => setView(AuthView.LOGIN)}
    />;
  }

  return content;
} 