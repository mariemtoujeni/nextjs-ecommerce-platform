"use client";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { signInAction } from "@repo/actions/auth";
import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";


export default function AuthLogin({
  dict,
  onSignup,
}: {
  dict: any;
  onSignup: () => void;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params?.lang || "fr";
  const redirectTo = searchParams.get("redirect") ?? "/";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    if (typeof email !== "string" || typeof password !== "string") return;

    try {
      const result = await signInAction({ email, password });
      if (result.success) {
        router.push(redirectTo);
      } else {
        setErrorMsg(dict.login.incorrect);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setErrorMsg(dict.login.incorrect);
    }
  }

  return (
    <>    
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <div className="flex flex-col justify-between gap-2">
            <Heading heading="4" className="font-extrabold">
              {dict.login.title}
            </Heading>
            <p className="text-neutral-500 text-md font-regular">
              {dict.login.subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-8 mt-8">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{dict.login.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={dict.login.emailPlaceholder}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{dict.login.password}</Label>
              <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={dict.login.passwordPlaceholder}
                className="pr-10"
              />
              <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {!showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={"/" + lang + "/forgot-password"}
                className="text-sm text-neutral-500 hover:underline"
              >
                {dict.login.forgot} 
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="mt-8">
            <Button
              className="w-full bg-lime text-black hover:bg-lime/90"
              type="submit"
            >
              {dict.login.button}
            </Button>
          </div>
          {errorMsg && (
            <p className="text-red-600 text-sm font-medium mt-2">{errorMsg}</p>
          )}
          <div className="mt-4 flex justify-between text-sm">
            <Link href="/" className="text-neutral-500 hover:underline">
              &larr; {dict.login.backToShop}
            </Link>
            <p className="text-neutral-500">
              {dict.login.noAccount}
              <button
                type="button"
                className="font-semibold text-black hover:underline ml-1"
                onClick={onSignup}
              >
                {dict.login.signup}
              </button>
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
