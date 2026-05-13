"use client";

import { Client } from "@repo/core/models";
import { MapPin, Megaphone, Phone } from "lucide-react";
import { Card, CardHeader, CardContent, Label, Input, CardTitle, Heading } from "~/components/ui";

interface SideCardProps {
  client: Client;
}

export const SideCard: React.FC<SideCardProps> = ({ client }: SideCardProps) => {
  const items = [
    { label: "Abonné à la newsletter", active: client.newsLetter },
    { label: "Offres site", active: client.siteOffer },
    { label: "Offres partenaire", active: client.partnerOffer },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone size={24} className="text-blue-500" />
          <Heading heading="3" className="m-0 text-gray-700 font-bold">
            Coordonnées
          </Heading>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <span className="text-blue-600">{client.email}</span>
        <div className="flex flex-col gap-2">
          <Label>Téléphone domicile</Label>
          <Input value={client.phone ?? ""} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Téléphone portable</Label>
          <Input value={client.mobilePhone ?? ""} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Téléphone travail</Label>
          <Input value={client.workPhone ?? ""}  disabled />
        </div>
      </CardContent>

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin size={24} className="text-blue-500" />
          <Heading heading="3" className="m-0 text-gray-700 font-bold">
            Adresse par défaut
          </Heading>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground">
          {client.lastName} {client.firstName}
        </div>
        
        <div className="text-muted-foreground">
          {client.clientAddress?.[0]?.adresse ?? ''}
        </div>

        <div className="text-muted-foreground">
          {client.clientAddress?.[0]?.adresse2 ?? ''}
        </div>

        <div className="text-muted-foreground">
          {client.clientAddress?.[0]?.adresse3 ?? ''}
        </div>

        <div className="text-muted-foreground">
          {client.clientAddress?.[0]?.code_postal ?? ''}, {client.clientAddress?.[0]?.ville ?? ''}
        </div>

        <div className="text-muted-foreground">
          {client.clientAddress?.[0]?.pays ?? ''}
        </div>
      </CardContent>

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone size={24} className="text-blue-500" />
          <Heading heading="3" className="m-0 text-gray-700 font-bold">
            Marketing
          </Heading>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-1">
          {items.map((item, index) => (
            <span key={index} className="flex items-center">
              <span className={`inline-block h-2 w-2 rounded-full mr-2 ${item.active ? "bg-green-500" : "bg-red-500"}`}/>
              {item.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
