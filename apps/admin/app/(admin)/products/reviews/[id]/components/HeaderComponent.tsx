"use client";
import { updateOpinion } from "@repo/actions/opinions";
import { Opinion } from "@repo/core/models";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { Button, Card, Heading } from "~/components/ui";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "~/components/ui/toast";

interface HeaderComponentProps {
  opinion: Opinion;
  onSave: () => void;
}

export default function HeaderComponent({
  opinion,
  onSave,
}: HeaderComponentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(opinion);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [localOpinion, setLocalOpinion] = useState(opinion);
  const [loading, setLoading] = useState(false);

  const handleAfficherClick = async () => {
    try {
      setLoading(true);
      await updateOpinion({
        ...localOpinion,
        validated: true,
        actif: true,
      });

      setToastMessage("Votre avis est maintenant visible.");
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMasquerClick = async () => {
    try {
      setLoading(true);
      const updatedOpinion = await updateOpinion({
        ...localOpinion,
        validated: true,
        actif: false,
      });
      setLocalOpinion(updatedOpinion);
      setToastMessage("Votre avis n’est plus visible.");
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToastProvider>
      <header className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Card
            className="p-2 bg-gray-100 cursor-pointer rounded hover:bg-gray-200"
            onClick={() => router.push("/products/reviews")}
          >
            <ArrowLeft size={16} />
          </Card>

          <Heading
            heading="2"
            className="inline-flex items-center text-gray-700"
          >
            #{current.id}
          </Heading>
        </div>

        <div className="flex items-center gap-3">
          {/* Masquer */}
          <Button variant="outline" size="lg" onClick={handleMasquerClick}>
            Masquer
          </Button>

          {/* Enregistrer */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="lg">
                Enregistrer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogDescription>
                  Souhaitez-vous confirmer la modification?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="outline" onClick={onSave}>
                    OK
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Afficher */}
          <Button variant="outline" size="lg" onClick={handleAfficherClick}>
            Afficher
          </Button>
        </div>
      </header>
      {toast && (
        <Toast open={toast} onOpenChange={setToast}>
          <div className="flex flex-col space-y-1">
            <ToastTitle>Modification enregistrée</ToastTitle>
            <ToastDescription>{toastMessage}</ToastDescription>
          </div>
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
