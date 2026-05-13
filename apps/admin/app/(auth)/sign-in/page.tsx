import { Card, CardContent, CardHeader, Heading } from "~/components/ui";
import Image from "next/image";
import logoNata from '~/public/logo-nataqua.png'
import { SignInForm } from "./form";
import { Metadata } from "next";
import { InvitationForm } from "./formInvitation";

export const metadata: Metadata = {
  title: "Connexion - MLCN Sports backoffice",
  description: "Connectez-vous à votre compte pour accéder à l'espace administrateur",
}

export default async function SignInPage(props: { searchParams: Promise<{error?: string, code?: string}> }) { 
  const searchParams = await props.searchParams;

  return <div className="flex flex-col items-center justify-center h-screen" >
    <div className="flex flex-col items-center justify-center">
      <Card>
        <CardHeader>
          <Image src={logoNata} alt="logo" height={80} />
          <Heading heading="2">{searchParams.code ? "Invitation" : "Connexion"}</Heading>
          <span className="text-xs text-gray-500">{searchParams.code ? "Renseigner le mot de passe pour accéder à l'espace administrateur" : "Connectez-vous à votre compte pour accéder à l'espace administrateur"}</span>
        </CardHeader>
        <CardContent>
          {
            searchParams.code ? <InvitationForm code={searchParams.code} /> : <SignInForm message={searchParams.error} />
          }          
        </CardContent>
      </Card>
    </div>
  </div>;
}