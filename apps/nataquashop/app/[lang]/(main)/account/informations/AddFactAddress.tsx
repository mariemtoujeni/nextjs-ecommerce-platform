"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui";
import { Country, FactAddressInput } from "@repo/core/models";
import { addFactAddressAction } from "@repo/actions/account-client";
import { listAllCountriesAction } from "@repo/actions/clients";
import { useRouter } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { dictionary } from "~/app/dictionaries";

interface Props {
  translations: dictionary;
}
export default function AddFactAddress({ translations }: Props) {
  const [formData, setFormData] = useState<FactAddressInput>({
    civility: "",
    lastName: "",
    firstName: "",
    designation: "",
    company: "",
    address: "",
    complement: "",
    building: "",
    postalCode: "",
    city: "",
    country: "",
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const router = useRouter();
  async function handleAddressSubmit(address: FactAddressInput) {    
      try{
        const result = await addFactAddressAction(address);
      if(result){
        router.refresh();
      }
      }catch(error){
        console.error(error);
      }
  }
  const [countries, setCountries] = useState<Country[]>([]);
    useEffect(() => {
      const fetchCountries = async () => {
        const countryList = await listAllCountriesAction();
        setCountries(countryList);
      };
  
      fetchCountries();
    }, []);
    const isFormValid = () => {
    return (
      formData.address.trim() !== "" &&
      formData.postalCode.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.country.trim() !== ""&&
      formData.civility.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.firstName.trim() !== ""
    );
  };
    
  return (
    <Dialog>
      <DialogTrigger asChild>
       <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
      <Button variant="default" size="default">
       {translations.costumerAccount.dataClient.title}
      </Button>
    </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> {translations.costumerAccount.dataClient.title}</DialogTitle>
        </DialogHeader>
    <>
      <div className="">
        <div className="flex-1">
          <Label htmlFor="fact-nom">{translations.costumerAccount.dataClient.lastname}<span className="text-red-500 text-sm"> *</span></Label>
          <Input id="fact-nom" name="lastName" placeholder={translations.costumerAccount.dataClient.lastname} value={formData.lastName} onChange={handleChange}/>
        </div>
        <div className="flex-1">
          <Label htmlFor="fact-prenom">{translations.costumerAccount.dataClient.firstname}<span className="text-red-500 text-sm"> *</span></Label>
          <Input id="fact-prenom" name ="firstName"placeholder={translations.costumerAccount.dataClient.firstname} value={formData.firstName} onChange={handleChange}/>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="fact-civilite">{translations.costumerAccount.dataClient.civility}<span className="text-red-500 text-sm"> *</span></Label>
          <Select  value={formData.civility}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, civility: value }))
              }>
            <SelectTrigger id="fact-civilite">
              <SelectValue placeholder={translations.costumerAccount.dataClient.Mr} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={translations.costumerAccount.dataClient.Mr}>{translations.costumerAccount.dataClient.Mr}</SelectItem>
              <SelectItem value={translations.costumerAccount.dataClient.Mrs}>{translations.costumerAccount.dataClient.Mrs}</SelectItem>
              <SelectItem value={translations.costumerAccount.dataClient.other}>{translations.costumerAccount.dataClient.other}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 mt-1">
          <Label htmlFor="fact-societe">{translations.costumerAccount.dataClient.company}</Label>
          <Input id="fact-societe" name="company" placeholder={translations.costumerAccount.dataClient.company} value={formData.company} onChange={handleChange} />
        </div>
      </div>
      <div className="flex-1">
          <Label htmlFor="adresse">{translations.costumerAccount.dataClient.address}<span className="text-red-500 text-sm"> *</span></Label>
          <Input
            id="adresse"
            name="address"
            placeholder={translations.costumerAccount.dataClient.address}
            value={formData.address}
            onChange={handleChange}
          />
   
        </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="fact-adresse">{translations.costumerAccount.dataClient.designation}</Label>
          <Input id="fact-adresse" name="designation" placeholder={translations.costumerAccount.dataClient.designation} value={formData.designation} onChange={handleChange} />
        </div>
        <div className="flex-1">
          <Label htmlFor="fact-ville">{translations.costumerAccount.dataClient.city}<span className="text-red-500 text-sm"> *</span></Label>
          <Input id="fact-ville" name="city" placeholder={translations.costumerAccount.dataClient.city} value={formData.city} onChange={handleChange} />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="fact-cp">{translations.costumerAccount.dataClient.postcode}<span className="text-red-500 text-sm"> *</span></Label>
          <Input id="fact-cp" name="postalCode" placeholder={translations.costumerAccount.dataClient.postcode} value={formData.postalCode} onChange={handleChange} />
        </div>
        <div className="flex-1">
          <Label htmlFor="fact-complement">{translations.costumerAccount.dataClient.complement}</Label>
          <Input id="fact-complement" name="complement" placeholder={translations.costumerAccount.dataClient.complement} value={formData.complement} onChange={handleChange} />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">          
          <Select
              value={formData.country}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, country: value }))
              }
            >
              <Label htmlFor="pays">{translations.costumerAccount.dataClient.country}<span className="text-red-500 text-sm"> *</span></Label>
              <SelectTrigger id="pays">
                <SelectValue placeholder={translations.costumerAccount.dataClient.country} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country: { code: string; name: string }) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="fact-etage">{translations.costumerAccount.dataClient.building}</Label>
          <Input id="fact-etage" placeholder={translations.costumerAccount.dataClient.building} name="building" value={formData.building} onChange={handleChange}/>
        </div>
      </div>
      <DialogClose asChild>
      <div className="flex justify-end mt-4">
        <Button variant="default" size="default"  onClick={() => handleAddressSubmit(formData)}  disabled={!isFormValid()}>
          {translations.costumerAccount.dataClient.save}
        </Button>
      
      </div>
      </DialogClose>
    </>
    
    </DialogContent>
    </Dialog>
  );
}
