'use client'

import { Loader2, PlusIcon } from "lucide-react"
import { Button, Heading } from "~/components/ui"
import { generateTrainingDataAction } from "@repo/actions/products"
import { useState } from "react"
import { useToast } from "~/hooks/use-toast"

export const HeadingComponent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    return (
        <div className="flex justify-between items-center">
            <Heading key='page-title' heading={"2"}>Configuration générale</Heading>
            <Button onClick={async () => {
                setIsLoading(true);
                const response = await generateTrainingDataAction();
                setIsLoading(false);
                if (response.item) {
                    toast({
                        title: "Données d'entraînement générées avec succès",
                        description: "Les données d'entraînement pour l'IA ont été générées avec succès",
                    })
                } else {
                    toast({
                        title: "Erreur lors de la génération des données d'entraînement",
                        description: response.error,
                        variant: "destructive",
                    })
                }
            }}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
                Générer les données d'entraînement pour l'IA
            </Button>
        </div>
    )
}