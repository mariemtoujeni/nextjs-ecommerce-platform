'use client';

import { useEffect, useRef, useState } from 'react';
import { HeadingComponent } from "./heading-component";
import { AdressCard } from "./(card)/adress-card";
import { ClientCard } from "./(card)/client-card";
import { InfoClubCard } from "./(card)/club-card";
import { addClientAction, updateClientAction } from "@repo/actions/clients";
import { Client, ClientAddressInput, ClientInput, ClientType, ClubInput } from "@repo/core/models";
import { toast } from '~/hooks/use-toast';
import { useParams, useRouter } from "next/navigation";

type CountryProps = {
  countries: { code: string; name: string }[];
  initialClient?: Client;
};

export const CreateCustomerPage: React.FC<CountryProps> = ({ countries, initialClient }: CountryProps) => {
  const [client, setClient] = useState<ClientInput>({
    clientNumber: 0,
    firstName: '',
    lastName: '',
    email: '',
    mobilePhone: '',
    phone: '',
    workPhone: '',
    fidelityPoints: 0,
    credit: 0,
    type: ClientType.CLIENT,
    marketingEmail: false,
    marketingSMS: false,
  });

  const [address, setAddress] = useState<ClientAddressInput>({
    company: '',
    country: 'FR',
    address: '',
    postCode: '',
    city: '',
  });

  const [club, setClub] = useState<ClubInput>({
    name: '',
    president: '',
    email: '',
    accountantAccount: '',
    paymentMode: 0,
    paymentDelay: 0,
    phone: '',
    partner: false,
    referent: '',
    siren: '',
    tvaNumber: "0",
    valid: false,
    code: '',
  });

  const router = useRouter();
  const params = useParams(); 
  const clientId = params?.id as string | undefined; 

  useEffect(() => {

  if (initialClient) {
    const {
      clientNumber,
      firstName,
      lastName,
      email,
      mobilePhone,
      phone,
      workPhone,
      fidelityPoints,
      credit,
      type,
      newsLetter,
      siteOffer,
      clientAddress,
      club: initialClub,  
    } = initialClient;

    setClient({
      clientNumber,
      firstName,
      lastName,
      email,
      mobilePhone,
      phone,
      workPhone,
      fidelityPoints,
      credit,
      type,
      marketingEmail: newsLetter,
      marketingSMS: siteOffer,
    });

    if (clientAddress && clientAddress.length > 0) {
      setAddress({
        company: clientAddress[0]?.societe ?? '',
        country: clientAddress[0]?.pays ?? 'FR',
        address: clientAddress[0]?.adresse ?? '',
        postCode: clientAddress[0]?.code_postal ?? '',
        city: clientAddress[0]?.ville ?? '',
      });
    } else {

    }

    if (initialClub) {

      setClub({
        name: initialClub.name ?? '',
        president: initialClub.president ?? '',
        email: initialClub.email ?? '',
        accountantAccount: initialClub.accountantAccount ?? '',
        paymentMode: initialClub.paymentMode ?? 0,
        paymentDelay: initialClub.paymentDelay ?? 0,
        phone: initialClub.phone ?? '',
        partner: initialClub.partner ?? false,
        referent: initialClub.referent ?? '',
        siren: initialClub.siren ?? '',
        tvaNumber: initialClub.tvaNumber ?? "0",
        valid: initialClub.valid ?? false,
        code: initialClub.code ?? '',
      });
    } else {

    }
  }
}, [initialClient]);


  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const addressRef = useRef<HTMLInputElement>(null);
  const postCodeRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);

  const nameClubRef = useRef<HTMLInputElement>(null);
  const paymentModeRef = useRef<HTMLSelectElement>(null);
  const paymentDelayRef = useRef<HTMLInputElement>(null);


  const validateFields = (): boolean => {
    if (!club.name.trim()) {
      toast({
        title: "Champ requis",
        description: "Le nom du club est requis.",
        variant: "destructive",
      });
      nameClubRef.current?.focus();
      return false;
    }
    if (club.paymentMode === 0) {
      toast({
        title: "Champ requis",
        description: "Le mode de paiement est requis.",
        variant: "destructive",
      });
      paymentModeRef.current?.focus();
      return false;
    }

    if (club.paymentDelay === 0) {
      toast({
        title: "Champ requis",
        description: "Le délai de paiement est requis.",
        variant: "destructive",
      });
      paymentDelayRef.current?.focus();
      return false;
    }
      

    if (!client.firstName.trim()) {
      toast({
        title: "Champ requis",
        description: "Le prénom est requis.",
        variant: "destructive",
      });
      firstNameRef.current?.focus();
      return false;
    }

    if (!client.lastName.trim()) {
      toast({
        title: "Champ requis",
        description: "Le nom est requis.",
        variant: "destructive",
      });
      lastNameRef.current?.focus();
      return false;
    }

    if (!client.email.trim()) {
      toast({
        title: "Champ requis",
        description: "L’email est requis.",
        variant: "destructive",
      });
      emailRef.current?.focus();
      return false;
    }
    
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(client.email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      emailRef.current?.focus();
      return false;
    }
    // Validate address fields
    if (!address.address.trim()) {
      toast({
        title: "Champ requis",
        description: "L'adresse est requise.",
        variant: "destructive",
      });
      addressRef.current?.focus();
      return false;
    }

    if (!address.postCode.trim()) {
      toast({
        title: "Champ requis",
        description: "Le code postal est requis.",
        variant: "destructive",
      });
      postCodeRef.current?.focus();
      return false;
    }

    if (!address.city.trim()) {
      toast({
        title: "Champ requis",
        description: "La ville est requise.",
        variant: "destructive",
      });
      cityRef.current?.focus();
      return false;
    }

    return true;
    
  };
  
  const handleSubmit = async () => {
    if (!validateFields()) return;

    try {
      if (clientId) {
        await addClientAction(client, address, club);
        toast({
          title: "Modifié avec succès",
          description: "Le compte client a été mis à jour.",
        });

        router.push("/customers");
      } else {
        await addClientAction(client, address, club);
        toast({
          title: "Création réussie",
          description: "Le compte client a été enregistré avec succès.",
        });
      }

      router.push("/customers");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer, une erreur est survenue.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container">
      <HeadingComponent onSubmit={handleSubmit} isEditMode={!!initialClient} />
      <div className="flex-1 space-y-4">
        <ClientCard client={client} setClient={setClient} refs={{ firstNameRef, lastNameRef, emailRef }} />
        <AdressCard address={address} setAddress={setAddress} countries={countries} refs={{ addressRef, postCodeRef, cityRef }}/>
        {(client.type === ClientType.CLUB || client.type === ClientType.CLUB_PARTENAIRE) && (
          <InfoClubCard club={club} setClub={setClub} />
        )}
      </div>
    </div>
  );
};
