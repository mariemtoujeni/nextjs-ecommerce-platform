"use client";
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import Link from "next/link";
import { type ParticulierData } from "./types";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  passwordClientInputSchema,
  PasswordErrorType,
} from "@repo/core/models";
import { dictionary } from "~/app/dictionaries";
import { z } from "zod";
interface props {
  dict: dictionary;
  data: ParticulierData;
  onChange: (data: ParticulierData) => void;
  onBack: () => void;
  onSubmit: () => void;
  error?: string;
  onLogin: () => void;
}

export default function SignupParticulierStep2({
  dict,
  data,
  onChange,
  onBack,
  onSubmit,
  error,
  onLogin,
}: props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<PasswordErrorType[]>([]);
  const errorMessages: Record<PasswordErrorType, string> = {
    TOO_SHORT: dict.costumerAccount.passwordError.TOO_SHORT,
    NO_UPPERCASE: dict.costumerAccount.passwordError.NO_UPPERCASE,
    NO_NUMBER: dict.costumerAccount.passwordError.NO_NUMBER,
    NO_SPECIAL: dict.costumerAccount.passwordError.NO_SPECIAL,
    NO_LOWERCASE: dict.costumerAccount.passwordError.NO_LOWERCASE,
  };
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    onChange({ ...data, [name]: type === "checkbox" ? checked : value });
    if (name === "password") {
      try {
        passwordClientInputSchema.parse({ [name]: value });
        setPasswordError([]);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const codes = err.errors.map((e) => e.message as PasswordErrorType);
          setPasswordError(codes);
        }
      }
    }
  }
  function handleCheckbox(checked: boolean) {
    onChange({ ...data, cgu: checked });
  }
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form
      onSubmit={handleFormSubmit}
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
            {dict.signup.particulier.step2.subtitle}
          </p>
        </div>
        <div className="font-bold mt-8">
          {dict.signup.particulier.step2.title}
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <Label htmlFor="email" required>
              {dict.signup.particulier.step2.fields.email}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={
                dict.signup.particulier.step2.fields.emailPlaceholder
              }
              value={data.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="emailConfirm" required>
              {dict.signup.particulier.step2.fields.emailConfirm}
            </Label>
            <Input
              id="emailConfirm"
              name="emailConfirm"
              type="email"
              placeholder={
                dict.signup.particulier.step2.fields.emailConfirmPlaceholder
              }
              value={data.emailConfirm}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="password" required>
              {dict.signup.particulier.step2.fields.password}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                placeholder={
                  dict.signup.particulier.step2.fields.passwordPlaceholder
                }
                value={data.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {!showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <ul className="text-red-500 text-sm mt-1">
              {passwordError.map((err) => (
                <li key={err} className="flex items-center gap-1">
                  {errorMessages[err]}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Label htmlFor="passwordConfirm" required>
              {dict.signup.particulier.step2.fields.passwordConfirm}
            </Label>
            <div className="relative">
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type={showConfirmPassword ? "text" : "password"}
                className="pr-10"
                placeholder={
                  dict.signup.particulier.step2.fields
                    .passwordConfirmPlaceholder
                }
                value={data.passwordConfirm}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {!showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="telephone">
              {dict.signup.particulier.step2.fields.telephone}
            </Label>
            <Input
              id="telephone"
              name="telephone"
              placeholder={
                dict.signup.particulier.step2.fields.telephonePlaceholder
              }
              value={data.telephone}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="portable" required>
              {dict.signup.particulier.step2.fields.portable}
            </Label>
            <Input
              id="portable"
              name="portable"
              placeholder={
                dict.signup.particulier.step2.fields.portablePlaceholder
              }
              value={data.portable}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="birthdate" required>
              {dict.signup.particulier.step2.fields.birthdate}
            </Label>
            <Input
              id="birthdate"
              name="birthdate"
              type="date"
              value={data.birthdate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="codeClub">
              {dict.signup.particulier.step2.fields.codeClub}
            </Label>
            <Input
              id="codeClub"
              name="codeClub"
              placeholder={
                dict.signup.particulier.step2.fields.codeClubPlaceholder
              }
              value={data.codeClub}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="cgu"
            checked={data.cgu}
            onCheckedChange={handleCheckbox}
            required
          />
          <Label htmlFor="cgu" className="text-xs" required>
            {dict.signup.particulier.step2.cgu}
          </Label>
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
            {dict.signup.particulier.step2.back}
          </Button>
          <Button
            type="submit"
            className="w-full bg-lime text-black font-bold hover:bg-lime/90"
          >
            {dict.signup.particulier.step2.submit}
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
