"use client"
import {
  Button,
  Heading,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui";
import { ParticulierData } from "./types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Country } from "@repo/core/models";
import { listAllCountriesAction } from "@repo/actions/clients";
import Image from "next/image";

export default function SignupParticulierStep1({
  dict,
  data,
  onChange,
  onNext,
  onBack,
  error,
  onLogin,
}: {
  dict: any;
  data: ParticulierData;
  onChange: (data: ParticulierData) => void;
  onNext: () => void;
  onBack: () => void;
  error?: string;
  onLogin: () => void;
}) {
  const [countries, setCountries] = useState<Country[]>([]);
  useEffect(() => {
    const fetchCountries = async () => {
      const countryList = await listAllCountriesAction();
      setCountries(countryList);
    };

    fetchCountries();
  }, []);
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...data, [e.target.name]: e.target.value });
  }
  function handleCivilite(val: string) {
    onChange({ ...data, civilite: val });
  }
  function handlePays(val: string) {
    onChange({ ...data, pays: val });
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between h-full"
    >

            <div className="mb-4 flex ">
                               <Image
                                    src="/images/logo/main-logo.svg"
                                    alt="Logo"
                                    height={50}
                                    width={150}
                                    priority
                                    className="lg:w-[200px] w-[100px]"
                                  /> 
                            </div> 
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Heading heading="4" className="font-extrabold">
            {dict.signup.title}
          </Heading>
          <p className="text-neutral-500">
            {dict.signup.particulier.step1.subtitle}
          </p>
        </div>
        <div className="font-bold mt-8">
          {dict.signup.particulier.step1.title}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="nom" required>
              {dict.signup.particulier.step1.fields.nom}
            </Label>
            <Input
              id="nom"
              name="nom"
              placeholder={dict.signup.particulier.step1.fields.nomPlaceholder}
              value={data.nom}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="prenom" required>
              {dict.signup.particulier.step1.fields.prenom}
            </Label>
            <Input
              id="prenom"
              name="prenom"
              placeholder={
                dict.signup.particulier.step1.fields.prenomPlaceholder
              }
              value={data.prenom}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label required>{dict.signup.particulier.step1.fields.civilite}</Label>
            <Select
              value={data.civilite}
              onValueChange={handleCivilite}
              required
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    dict.signup.particulier.step1.fields.civilitePlaceholder
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monsieur">
                  {dict.common.civilities.monsieur}
                </SelectItem>
                <SelectItem value="Madame">
                  {dict.common.civilities.madame}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="societe">
              {dict.signup.particulier.step1.fields.societe}
            </Label>
            <Input
              id="societe"
              name="societe"
              placeholder={
                dict.signup.particulier.step1.fields.societePlaceholder
              }
              value={data.societe}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="adresse" required>
              {dict.signup.particulier.step1.fields.adresse}
            </Label>
            <Input
              id="adresse"
              name="adresse"
              placeholder={
                dict.signup.particulier.step1.fields.adressePlaceholder
              }
              value={data.adresse}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="codePostal" required>
              {dict.signup.particulier.step1.fields.codePostal}
            </Label>
            <Input
              id="codePostal"
              name="codePostal"
              placeholder={
                dict.signup.particulier.step1.fields.codePostalPlaceholder
              }
              value={data.codePostal}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="ville" required>
              {dict.signup.particulier.step1.fields.ville}
            </Label>
            <Input
              id="ville"
              name="ville"
              placeholder={
                dict.signup.particulier.step1.fields.villePlaceholder
              }
              value={data.ville}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="complement">
              {dict.signup.particulier.step1.fields.complement}
            </Label>
            <Input
              id="complement"
              name="complement"
              placeholder={
                dict.signup.particulier.step1.fields.complementPlaceholder
              }
              value={data.complement}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="etage">
              {dict.signup.particulier.step1.fields.etage}
            </Label>
            <Input
              id="etage"
              name="etage"
              placeholder={
                dict.signup.particulier.step1.fields.etagePlaceholder
              }
              value={data.etage}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <Label required>{dict.signup.particulier.step1.fields.pays}</Label>
            <Select value={data.pays} onValueChange={handlePays} required>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    dict.signup.particulier.step1.fields.paysPlaceholder
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country: { code: string; name: string }) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:mt-8 fixed bottom-0 left-4 right-4 p-4 bg-neutral-200 md:static md:bg-none md:p-0">
          <Button
            type="button"
            variant="outline"
            className="w-full border-black text-black font-bold bg-transparent hover:bg-neutral-200"
            onClick={onBack}
          >
            {dict.signup.particulier.step1.back}
          </Button>
          <Button
            type="submit"
            className="w-full bg-lime text-black font-bold hover:bg-lime/90"
          >
            {dict.signup.particulier.step1.next}
          </Button>
        </div>
        <div className="mt-4 md:mt-8 mb-32 md:mb-8 flex justify-between text-sm">
          <Link href="/" className="text-neutral-500 hover:underline">
            &larr; {dict.login.backToShop}
          </Link>
          <p className="text-neutral-500">
            <span className="hidden md:inline">
              {dict.signup.alreadyAccount}
            </span>
            <button
              type="button"
              className="font-semibold text-black hover:underline ml-1"
              onClick={onLogin}
            >
              {dict.signup.login}
            </button>
          </p>
        </div>
      </div>
    </form>
  );
}
