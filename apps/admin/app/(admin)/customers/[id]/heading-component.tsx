"use client";

import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "~/components/ui/popover";
import { Client } from "@repo/core/models";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Heading, Button, Card } from "~/components/ui";

interface HeadingProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}

export const HeadingComponent: React.FC<HeadingProps> = ({ client, onEdit, onDelete }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-row justify-between items-start w-full">
      {/* LEFT SIDE */}
      <div className="flex items-start gap-3">
        <Card
          className="flex justify-center items-center p-2 bg-gray-100 cursor-pointer h-[36px]"
          onClick={() => router.push("/customers")}
        >
          <ArrowLeft size={16} />
        </Card>
        <Heading heading="2" className="text-gray-700 leading-tight">
          {client.lastName} {client.firstName}
          <br />
          <span className="text-sm text-gray-500">{client.clientNumber}</span>
        </Heading>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-row gap-3 items-start">
        <Button variant="outline" onClick={() => router.push("/customers")} size="lg">
          Annuler
        </Button>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              disabled={client.email === "non-compte@nataquashop.com"}
            >
              Supprimer
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <p className="text-sm mb-4">
              Êtes-vous sûr de vouloir supprimer toutes les données de ce client ?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete();
                  setOpen(false);
                  router.push("/customers");
                }}
              >
                Confirmer
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="default" size="lg" onClick={onEdit}>
          Modifier
        </Button>
      </div>
    </div>
  );
};



