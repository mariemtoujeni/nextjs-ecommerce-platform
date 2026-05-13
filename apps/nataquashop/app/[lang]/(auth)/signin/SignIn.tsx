"use client";

import { useState } from "react";
import AuthLogin from "./AuthLogin";
import AuthSignupChoice from "./AuthSignupChoice";
import SignupClubStep1 from "./SignupClubStep1";
import SignupClubStep2 from "./SignupClubStep2";
import { AuthView, type ParticulierData, type ClubData } from "./types";
import { signInAction, signUpAction, signUpClubAction } from "@repo/actions/auth";
import { mapParticulierToSignUpPayload } from "./particulier";
import SignupParticulierStep1 from "./SignupParticulierStep1";
import SignupParticulierStep2 from "./SignupParticulierStep2";
import { mapClubToSignUpPayload } from "./club";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { Button } from "~/components/ui";
import { useRouter } from "next/navigation";

const initialParticulierData: ParticulierData = {
  nom: "",
  prenom: "",
  civilite: "",
  societe: "",
  adresse: "",
  codePostal: "",
  ville: "",
  complement: "",
  etage: "",
  pays: "France",
  email: "",
  emailConfirm: "",
  password: "",
  passwordConfirm: "",
  telephone: "",
  portable: "",
  birthdate: "",
  codeClub: "",
  cgu: false,
};

const initialClubData: ClubData = {
  nom: "",
  prenom: "",
  civilite: "",
  adresse: "",
  codePostal: "",
  ville: "",
  complement: "",
  etage: "",
  pays: "France",
  nomClub: "",
  president: "",
  referent: "",
  email: "",
  emailConfirm: "",
  password: "",
  passwordConfirm: "",
  telephone: "",
  portable: "",
  siren: "",
  tva: "",
  cgu: false,
};

export default function SignIn({ dict }: { dict: any }) {
  const [view, setView] = useState<AuthView>(AuthView.LOGIN);
  const [particulierData, setParticulierData] = useState<ParticulierData>(
    initialParticulierData
  );
  const [clubData, setClubData] = useState<ClubData>(initialClubData);
  const [error, setError] = useState<string | undefined>(undefined);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const router = useRouter();
  function validateParticulierStep1() {
    const { nom, prenom, civilite, adresse, codePostal, ville, pays } =
      particulierData;
    if (
      !nom ||
      !prenom ||
      !civilite ||
      !adresse ||
      !codePostal ||
      !ville ||
      !pays
    ) {
      setError(dict.login.fillRequired);
      return false;
    }
    setError(undefined);
    return true;
  }

  function validateParticulierStep2() {
    const {
      email,
      emailConfirm,
      password,
      passwordConfirm,
      telephone,
      portable,
      birthdate,
      cgu,
    } = particulierData;
    if (
      !email ||
      !emailConfirm ||
      !password ||
      !passwordConfirm ||      
      !portable ||
      !birthdate
    ) {
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
    const { nom, prenom, civilite, adresse, codePostal, ville, pays } =
      clubData;
    if (
      !nom ||
      !prenom ||
      !civilite ||
      !adresse ||
      !codePostal ||
      !ville ||
      !pays
    ) {
      setError(dict.login.fillRequired);
      return false;
    }
    setError(undefined);
    return true;
  }

  function validateClubStep2() {
    const {
      nomClub,
      president,
      referent,
      email,
      emailConfirm,
      password,
      passwordConfirm,
      telephone,
      portable,
      siren,
      cgu,
    } = clubData;
    if (
      !nomClub ||
      !president ||
      !referent ||
      !email ||
      !emailConfirm ||
      !password ||
      !passwordConfirm ||      
      !portable       
    ) {
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
  async function handleParticulierSignup() {
    try {
      const payload = mapParticulierToSignUpPayload(particulierData);
      const result = await signUpAction(payload);
        if (result.success) {
          setSuccessDialogOpen(true);
          await signInAction({
            password: payload.user.password,
            email: payload.user.email
          });
        } else {
          setError(result.error ?? "Erreur lors de la création du compte");
        }
    } catch (err: any) {
      console.error("Signup error", err);
      setError(err.message || "Erreur inconnue");
    }
  }
    async function handleClubSignup() {
    try {
      const payload = mapClubToSignUpPayload(clubData);
      const result = await signUpClubAction(payload);

      if (result) {
        setSuccessDialogOpen(true);
        await signInAction({
          password: payload.user.password,
          email: payload.user.email
        });
      } else {
        setError("Erreur lors de la création du compte");
      }
    } catch (err: any) {
      console.error("Signup error", err);
      setError(err.message || "Erreur inconnue");
    }
  }

  const handleSuccessClose = () => {
    setSuccessDialogOpen(false);
    router.push("/");
  };

  let mainView;
  if (view === AuthView.LOGIN) {
    mainView = <AuthLogin dict={dict} onSignup={() => setView(AuthView.CHOICE)} />;
  } else if (view === AuthView.CHOICE) {
    mainView = <AuthSignupChoice
      dict={dict}
      onParticulier={() => setView(AuthView.PARTICULIER_STEP1)}
      onClub={() => setView(AuthView.CLUB_STEP1)}
      onLogin={() => setView(AuthView.LOGIN)}
    />;
  } else if (view === AuthView.PARTICULIER_STEP1) {
    mainView = <SignupParticulierStep1
      dict={dict}
      data={particulierData}
      onChange={setParticulierData}
      onNext={() => { if (validateParticulierStep1()) setView(AuthView.PARTICULIER_STEP2); }}
      onBack={() => setView(AuthView.CHOICE)}
      error={error}
      onLogin={() => setView(AuthView.LOGIN)}
    />;
  } else if (view === AuthView.PARTICULIER_STEP2) {
    mainView = <SignupParticulierStep2
      dict={dict}
      data={particulierData}
      onChange={setParticulierData}
      onBack={() => setView(AuthView.PARTICULIER_STEP1)}
      onSubmit={() => { if (validateParticulierStep2()) handleParticulierSignup(); }}
      error={error}
      onLogin={() => setView(AuthView.LOGIN)}
    />;
  } else if (view === AuthView.CLUB_STEP1) {
    mainView = <SignupClubStep1
      dict={dict}
      data={clubData}
      onChange={setClubData}
      onNext={() => { if (validateClubStep1()) setView(AuthView.CLUB_STEP2); }}
      onBack={() => setView(AuthView.CHOICE)}
      error={error}
      onLogin={() => setView(AuthView.LOGIN)}
    />;
  } else if (view === AuthView.CLUB_STEP2) {
    mainView = <SignupClubStep2
      dict={dict}
      data={clubData}
      onChange={setClubData}
      onBack={() => setView(AuthView.CLUB_STEP1)}
      onSubmit={() => { if (validateClubStep2()) handleClubSignup(); }}
      error={error}
      onLogin={() => setView(AuthView.LOGIN)}
    />;
  }

  return (
    <>
      {mainView}

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-6 shadow-lg">
          <DialogHeader className="flex items-center gap-2">
            <DialogTitle>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center">Compte créé avec succès !</DialogDescription>
          <DialogFooter>
            <div className="flex justify-center w-full">
              <Button onClick={handleSuccessClose}>Fermer</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}