import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/components/ui/select";
import { Card, CardHeader, CardContent, Label, Input, Switch, CardTitle, Heading } from "~/components/ui";
import { Textarea } from "~/components/ui/textarea";
import { ClientInput, ClientType } from "@repo/core/models";
import { StickyNote, UserCircle, UserIcon } from "lucide-react";

interface ClientCardProps {
  client: ClientInput;
  setClient: React.Dispatch<React.SetStateAction<ClientInput>>;
  refs: {
    firstNameRef: React.RefObject<HTMLInputElement | null>;
    lastNameRef: React.RefObject<HTMLInputElement | null>;
    emailRef: React.RefObject<HTMLInputElement | null>;
  };
};

export const ClientCard: React.FC<ClientCardProps> = ({ client, setClient, refs }: ClientCardProps) => {
  const handleChange = (key: keyof ClientInput, value: string | boolean | number) => {
    setClient(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle size={24} className="text-blue-500" />
          <Heading heading="3" className="m-0 text-gray-700 font-bold">
            Aperçu du client
          </Heading>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="w-1/2 space-y-1">
            <Label required>Prénom</Label>
            <Input
              ref={refs.firstNameRef}
              placeholder="Prénom du client"
              className="bg-muted focus:bg-white"
              value={client.firstName || ''}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
          </div>
          <div className="w-1/2 space-y-1">
            <Label required>Nom</Label>
            <Input
              ref={refs.lastNameRef}
              placeholder="Nom du client"
              className="bg-muted focus:bg-white"
              value={client.lastName || ''}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label required>Email</Label>
          <Input
            ref={refs.emailRef}
            placeholder="Adresse email"
            className="bg-muted focus:bg-white"
            value={client.email || ''}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/3 space-y-1">
            <Label>Téléphone domicile</Label>
            <Input
              placeholder="Téléphone domicile"
              className="bg-muted focus:bg-white"
              value={client.phone || ''}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div className="w-1/3 space-y-1">
            <Label>Téléphone portable</Label>
            <Input
              placeholder="Téléphone portable"
              className="bg-muted focus:bg-white"
              value={client.mobilePhone || ''}
              onChange={(e) => handleChange("mobilePhone", e.target.value)}
            />
          </div>
          <div className="w-1/3 space-y-1">
            <Label>Téléphone travail</Label>
            <Input
              placeholder="Téléphone travail"
              className="bg-muted focus:bg-white"
              value={client.workPhone || ''}
              onChange={(e) => handleChange("workPhone", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Type de client</Label>
          <Select
            value={client.type || ClientType.CLIENT}
            onValueChange={(value: ClientType) => handleChange("type", value)}
          >
            <SelectTrigger className="bg-muted focus:bg-white">
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLIENT">Client</SelectItem>
              <SelectItem value="CLUB">Club</SelectItem>
              <SelectItem value="CLUB_PARTENAIRE">Club Partenaire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2 space-y-1">
            <Label>Points de fidélité</Label>
            <Input
              type="number"
              placeholder="Points de fidélité"
              className="bg-muted focus:bg-white"
              min={0}  // Prevent negative input via UI
              value={client.fidelityPoints?.toString() || ''}
              onChange={(e) => {
                const value = Number(e.target.value);
                handleChange("fidelityPoints", value < 0 ? 0 : value);
              }}
            />
          </div>
          <div className="w-1/2 space-y-1">
            <Label>Crédit</Label>
            <Input
              type="number"
              placeholder="0"
              className="bg-muted focus:bg-white"
              min={0}  // Prevent negative input via UI
              value={client.credit?.toString() || ''}
              onChange={(e) => {
                const value = Number(e.target.value);
                handleChange("credit", value < 0 ? 0 : value);
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label>Le client a accepté de recevoir des emails marketing.</Label>
          <Switch
            checked={client.marketingEmail || false}
            onCheckedChange={(value) => handleChange("marketingEmail", value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Le client a accepté de recevoir des messages SMS marketing.</Label>
          <Switch
            checked={client.marketingSMS || false}
            onCheckedChange={(value) => handleChange("marketingSMS", value)}
          />
        </div>
      </CardContent>

      <CardHeader className="font-bold">          
        <CardTitle className="flex items-center gap-2">
          <StickyNote size={24} className="text-blue-500" />
          <Heading heading="3" className="m-0 text-gray-700 font-bold">
            Notes
          </Heading>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Ajouter un commentaire..."
          className="bg-muted focus:bg-white"
        />
      </CardContent>
    </Card>
  );
};
