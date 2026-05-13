"use client";

import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const NavBack = () => {
    const router = useRouter();
    
    return <Button onClick={() => {
        if("" !== document.referrer) {
            router.replace(document.referrer)
        } else {
            router.replace("/dashboard")
        }
    }}>
        <ArrowLeft />Retour à la page précédente
    </Button>
}