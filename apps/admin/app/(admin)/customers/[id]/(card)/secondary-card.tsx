'use client';

import { Client } from "@repo/core/models";
import { format } from "date-fns";
import { Info } from "lucide-react";
import { useEffect } from "react";
import { Card, CardHeader, CardContent, Label, CardTitle, Heading } from "~/components/ui";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/components/ui/select"; 

interface SecondaryCardProps {
  client: Client;
}

export const SecondaryCard: React.FC<SecondaryCardProps> = ({client}: SecondaryCardProps) => {
  const oldestOrder = client.order 
    ? [...client.order].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info size={24} className="text-blue-500" />
          <Heading heading="3" className="m-0 text-gray-700 font-bold">
            Autres informations
          </Heading>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Label >Date inscription</Label>
          <span className="text-muted-foreground">{format(new Date(client.createdAt ?? ""), "MM/dd/yyyy")}</span>
        </div>
        <div className="flex items-center gap-4">
          <Label >Date de la première commande</Label>
          <span className="text-muted-foreground"> {oldestOrder ? format(new Date(oldestOrder.createdAt), "MM/dd/yyyy") : "N/A"} </span>
        </div>
        <div className="flex items-center gap-4">
          <Label >Points de fidélité</Label>
          <span className="text-muted-foreground">{client.fidelityPoints}</span>
        </div>
        <div className="flex items-center gap-4">
          <Label >Crédit</Label>
          <span className="text-muted-foreground">{client.credit} €</span>
        </div>
        <div className="flex items-center gap-4">
          <Label className="w-1/3">Type de client</Label>
          <Select value={client.type} onValueChange={() => {}} disabled>
            <SelectTrigger >
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-">--</SelectItem>
              <SelectItem value="CLIENT">Client</SelectItem>
              <SelectItem value="CLUB">Club</SelectItem>
              <SelectItem value="CLUB_PARTENAIRE">Club Partenaire</SelectItem>
            </SelectContent>
          </Select>
        </div>
        { client.club &&        
        <div className="flex items-center gap-4">
          <Label >Club : </Label>
          <span className="text-muted-foreground">{client.club.name}</span>
        </div>
        }
      </CardContent>
    </Card>
  );
};
