"use client"

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Heading, Button } from "~/components/ui";

export const HeadingComponent: React.FunctionComponent = () => {
  const router = useRouter();

  return (
    <div className="flex flex-row justify-between w-100">
      <Heading heading="2">Devis</Heading>
      <Button className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2"
      onClick={() => router.push("/customers/quotes/new")}>
        <Plus /> Créer un devis
      </Button>
    </div>
  );
}
