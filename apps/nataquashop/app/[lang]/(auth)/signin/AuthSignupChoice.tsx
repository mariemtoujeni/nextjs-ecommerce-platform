"use client";
import { Heading } from "~/components/ui/heading";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { dictionary } from "~/app/dictionaries";

interface Props {
  dict: dictionary;
  onParticulier: () => void;
  onClub: () => void;
  onLogin: () => void;
}

export default function AuthSignupChoice({ dict, onParticulier, onClub, onLogin }: Props) {
  return (
    <>
      <div className="flex flex-col gap-4">
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
        <div className="flex flex-col gap-2">
          <Heading heading="4" className="font-extrabold">
            {dict.signup.title}
          </Heading>
          <p className="text-neutral-500">
            {dict.signup.choice.subtitle}            
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-8">
          <div className="font-bold">{dict.signup.choice.title}</div>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              variant="outline"
              className="w-full hover:bg-neutral-200"
              onClick={onParticulier}
            >
              {dict.signup.choice.particulier.button}
            </Button>
            <Button
              onClick={onClub}
            >
              {dict.signup.choice.club.button}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-between text-sm mt-8">
        <Link href="/" className="text-neutral-500 hover:underline">
          &larr; {dict.login.backToShop}
        </Link>
        <p className="text-neutral-500">
          <span className="hidden md:inline">{dict.signup.alreadyAccount}</span>
          <button type="button" className="font-semibold text-black hover:underline ml-1" onClick={onLogin}>
            {dict.signup.login}
          </button>
        </p>
      </div>
    </>
  );
} 