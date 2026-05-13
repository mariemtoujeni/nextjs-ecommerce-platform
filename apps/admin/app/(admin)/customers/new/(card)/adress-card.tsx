import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/components/ui/select";
import { Card, CardHeader, CardContent, Label, Input, CardTitle, Heading } from "~/components/ui";
import { ClientAddressInput } from "@repo/core/models";
import { MapPin, UserCircle } from "lucide-react";

type AdressCardProps = {
  address: ClientAddressInput;
  setAddress: React.Dispatch<React.SetStateAction<ClientAddressInput>>;
  countries: { code: string; name: string }[];
  refs: {
    addressRef: React.RefObject<HTMLInputElement | null>;
    postCodeRef: React.RefObject<HTMLInputElement | null>;
    cityRef: React.RefObject<HTMLInputElement | null>;
  };
};

export const AdressCard: React.FC<AdressCardProps> = ({ address, setAddress, countries, refs }: AdressCardProps) => {
  const handleChange = (key: keyof ClientAddressInput, value: string) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin size={24} className="text-blue-500" />
          <Heading heading="3" className="m-0 text-gray-700 font-bold">
            Adresse par défaut
          </Heading>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Entreprise</Label>
          <Input
            placeholder="Nom de l'entreprise"
            className="bg-muted focus:bg-white"
            value={address.company || ""}
            onChange={(e) => handleChange("company", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Pays/région</Label>
          <Select
            value={address.country || "FR"}
            onValueChange={(val) => handleChange("country", val)}
          >
            <SelectTrigger className="bg-muted focus:bg-white">
              <SelectValue placeholder="Sélectionner un pays" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {countries.map(({ code, name }) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label required>Adresse</Label>
          <Input
            ref={refs.addressRef}
            placeholder="Adresse"
            className="bg-muted focus:bg-white"
            value={address.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2 space-y-1">
            <Label required>Code postal</Label>
            <Input
              ref={refs.postCodeRef}
              placeholder="Code postal"
              className="bg-muted focus:bg-white"
              value={address.postCode || ""}
              onChange={(e) => handleChange("postCode", e.target.value)}
            />
          </div>
          <div className="w-1/2 space-y-1">
            <Label required>Ville</Label>
            <Input
              ref={refs.cityRef}
              placeholder="Ville"
              className="bg-muted focus:bg-white"
              value={address.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
