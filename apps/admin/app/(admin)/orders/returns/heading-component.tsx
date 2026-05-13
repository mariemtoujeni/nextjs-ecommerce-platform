'use client'

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui";
import { Heading } from "~/components/ui/heading";

export const HeaderComponent: React.FunctionComponent = () => {
    const router = useRouter();
    return <div className="flex flex-row justify-between w-100">
        <Heading key='page-title' heading={"2"} className="text-gray-700">Retours clients</Heading>
        <Button className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2" onClick={() => {
            router.push("/orders/returns/new");
        }}>
            <Plus /> Nouvelle demande de retour
        </Button>
    </div>;
}