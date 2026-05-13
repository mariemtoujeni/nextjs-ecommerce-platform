"use client";

import { ChevronRight, Plus } from "lucide-react";
import { Badge, Button, Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "~/components/ui";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProductButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const productTypes = [
    {
      title: "Produit simple",
      description: "Un produit classique sans options particulières",
      buttonLabel: "Simple",
      isPackage: false,
    },
    {
      title: "Produit pack",
      description: "Un produit composé de plusieurs autres produits",
      buttonLabel: "Pack",
      isPackage: true,
    },
  ];

  const handleClick = async (index: number, isPackage: boolean) => {
    setLoadingIndex(index);
    router.push(`/products/add?isPackage=${isPackage}`);
  };


  return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2">
            <Plus /> Nouveau produit
          </Button>
        </DialogTrigger>

        <DialogContent> 
          <DialogTitle className="font-semibold text-lg">
            Créer un nouveau produit
          </DialogTitle>

          <div className="mt-6 space-y-4">
            {productTypes.map((item, index) => (
              <button
                key={index}
                onClick={() => handleClick(index, item.isPackage)}
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
  );
}

      
