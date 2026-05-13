import {Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/components/ui/select"; 
import { Card, CardHeader, CardContent, Label, Input, CardTitle, Heading } from "~/components/ui";
import { ClubInput } from "@repo/core/models";
import { Users } from "lucide-react";

type InfoClubCardProps = {
  club: ClubInput;
  setClub: React.Dispatch<React.SetStateAction<ClubInput>>;
};

export const InfoClubCard: React.FC<InfoClubCardProps> = ({ club, setClub }: InfoClubCardProps) => {
  const handleChange = (key: keyof ClubInput, value: string | boolean | number | null) => {
    setClub((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={24} className="text-blue-500" />
          <Heading heading="3" className="m-0 text-gray-700 font-bold">
            Informations du club
          </Heading>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label required>Nom du club</Label>
          <Input
            placeholder="Nom du club"
            className="bg-muted focus:bg-white"
            value={club.name || ''}
            onChange={(e) => handleChange("name", e.target.value)}            
          />
        </div>

        <div className="space-y-1">
          <Label>Nom du président</Label>
          <Input
            placeholder="Nom du président"
            className="bg-muted focus:bg-white"
            value={club.president || ''}
            onChange={(e) => handleChange("president", e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2 space-y-1">
            <Label>Email du club</Label>
            <Input
              placeholder="Email du club"
              className="bg-muted focus:bg-white"
              value={club.email || ''}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="w-1/2 space-y-1">
            <Label>Numéro compte comptable</Label>
            <Input
              placeholder="Numéro compte comptable"
              className="bg-muted focus:bg-white"
              value={club.accountantAccount || ''}
              onChange={(e) => handleChange("accountantAccount", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2 space-y-1">
            <Label required>Mode de paiement</Label>
            <Select 
              value={club.paymentMode !== null && club.paymentMode !== undefined ? club.paymentMode.toString() : "-"}
              onValueChange={(val) => {
                if (val === "-") {
                  handleChange("paymentMode", null);
                } else {
                  handleChange("paymentMode", parseInt(val, 10));
                }
              }}
              required>
              <SelectTrigger className="bg-muted focus:bg-white">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-">--</SelectItem>
                <SelectItem value="1">Chèque</SelectItem>
                <SelectItem value="2">Liquide</SelectItem>
                <SelectItem value="3">Carte bancaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-1/2 space-y-1">
            <Label required>Délai de paiement</Label>
            <Select
              value={club.paymentDelay !== null && club.paymentDelay !== undefined ? club.paymentDelay.toString() : "-"}
              onValueChange={(val) => {
                if (val === "-") {
                  handleChange("paymentDelay", null);
                } else {
                  handleChange("paymentDelay", parseInt(val, 10));
                }
              }}
              required>
              <SelectTrigger className="bg-muted focus:bg-white">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-">--</SelectItem>
                <SelectItem value="1">Totalité de la commande</SelectItem>
                <SelectItem value="2">À la livraison</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2 space-y-1">
            <Label>Nom référent</Label>
            <Input
              placeholder="Nom référent"
              className="bg-muted focus:bg-white"
              value={club.referent || ''}
              onChange={(e) => handleChange("referent", e.target.value)}
            />
          </div>
          <div className="w-1/2 space-y-1">
            <Label>Téléphone référent</Label>
            <Input
              placeholder="Téléphone référent"
              className="bg-muted focus:bg-white"
              value={club.phone || ''}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
