'use client'

import { Plus } from "lucide-react"
import { Heading } from "~/components/ui"
import { Dialog, DialogTrigger } from "~/components/ui/dialog"
import { ModalContent } from "./modal-component"
import { useState } from "react"
import { useRouter } from "next/navigation"

export const HeadingComponent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    
    return (
        <div className="flex flex-row justify-between w-100">
            <Heading key='page-title' heading={"2"}>Gestion des droits</Heading>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2">                    
                    <Plus /> Inviter à rejoindre
                </DialogTrigger>
                <ModalContent onClose={() => setIsOpen(false)} onRefresh={() => { router.refresh(); }}/>
            </Dialog>             
        </div>
    )
}