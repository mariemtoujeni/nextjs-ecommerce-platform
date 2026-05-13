'use client'
import { addDiscountAction } from "@repo/actions/discounts";
import { DiscountCombination } from "@repo/core/models";
import { Plus, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Badge } from "~/components/ui";
import { Dialog, DialogTitle, DialogContent, DialogTrigger, DialogClose } from "~/components/ui/dialog";
import { useToast } from "~/hooks/use-toast";

export const DiscountSelect: React.FC = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const reductions = [
      {
        title: "Montant de réduction sur les produits",
        description: "Offrez une réduction sur des produits ou collections de produits spécifiques",
        buttonLabel: "Réduction produit",
        path: "/discounts/products",
        type: DiscountCombination.PRODUIT,
      },
      // {
      //   title: "X pour le prix de Y",
      //   description: "Offrez une réduction sur des produits en fonction de l’achat d’un(e) client(e).",
      //   buttonLabel: "Réduction produit",
      //   path: "/discounts/xfory",
      //   type: DiscountCombination.PRODUIT,
      // },
      {
        title: "Montant de la réduction sur la commande",
        description: "Offrez une réduction sur le montant total de la commande",
        buttonLabel: "Réduction commande",
        path: "/discounts/orders",
        type: DiscountCombination.COMMANDE,
      },
    ];

    const handleClick = async (index: number, type: DiscountCombination, path: string) => {
      setLoadingIndex(index);
      try {
        const discount = await addDiscountAction(type); 
        toast({
          title: "Succès",
          description: type === DiscountCombination.PRODUIT
            ? "Réduction produit créé avec succès !"
            : "Réduction commande créé avec succès !"
        });
        router.push(`${path}/${discount.item.id}`);
      } catch (error) {
        console.error(error)
        toast({title: "Erreur", description: "Erreur lors de la création de réduction"});
      } finally {
        setLoadingIndex(null);
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2">
            <Plus /> Créer une réduction
          </Button>
        </DialogTrigger>
        <DialogContent> 
          <DialogTitle className="font-semibold text-lg">
            Sélectionner un type de réduction
          </DialogTitle>
          <div className="mt-6 space-y-4">
            {reductions.map((item, index) => (
              <button
                key={index}
                onClick={() => handleClick(index, item.type, item.path)}
                className="w-full flex justify-between items-center p-5 border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                disabled={loadingIndex === index}
              >
                <div className="flex flex-col">
                  <div className="font-medium text-sm mb-2">{item.title}</div>
                  <div className="text-gray-500 text-xs">{item.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={"blue"} size={"sm"} className="whitespace-nowrap">{item.buttonLabel}</Badge>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
          <DialogClose asChild>
            <Button variant={"outline"} className="ml-auto mt-4">
              Annuler
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    )
}