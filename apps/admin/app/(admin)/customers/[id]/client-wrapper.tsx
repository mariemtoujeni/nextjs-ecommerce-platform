"use client";

import { useState } from "react";
import { Client } from "@repo/core/models";
import { HeadingComponent } from "./heading-component";
import { NoteCard } from "./(card)/note-card";
import { PrimaryCard } from "./(card)/primary-card";
import { SecondaryCard } from "./(card)/secondary-card";
import { SideCard } from "./(card)/side-card";
import { deleteClientAction } from "@repo/actions/clients";
import { useRouter } from "next/navigation";
import { CreateCustomerPage } from "../new/create-customer-client";


interface WrapperProps {
  initialClient: Client;
  countries: { code: string; name: string }[]; 
}

export const ClientDetailWrapper: React.FC<WrapperProps> = ({ initialClient, countries }: WrapperProps) => {
  const [clientData, setClientData] = useState<Client>(initialClient);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    const deleteClient = async () => {
      try {
        await deleteClientAction(clientData.clientNumber);
        router.push("/customers");
      } catch (err) {
        console.error("Failed to delete client:", err);
      }
    };

    deleteClient();
  };

  if (isEditing) {
    return (
      <CreateCustomerPage 
        countries={countries} 
        initialClient={clientData} 
      />
    );
  }

  return (
    <div className="container">
      <HeadingComponent client={clientData} onEdit={handleEdit} onDelete={handleDelete} />
      <div className="flex flex-row gap-5 mt-5">
        <div className="w-3/5 space-y-4">
          <PrimaryCard client={clientData} />
          <SecondaryCard client={clientData} />
        </div>

        <div className="w-2/5 space-y-4">
          <SideCard client={clientData} />
          <NoteCard />
        </div>
      </div>
    </div>
  );
};
