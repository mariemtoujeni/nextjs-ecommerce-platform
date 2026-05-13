"use client";
import {
  deleteAdressClientAction,
  updateAddressAction,
} from "@repo/actions/account-client";
import { Address, defaultAddress } from "@repo/core/models";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { dictionary } from "~/app/dictionaries";
import { Button, Checkbox, Input, Label } from "~/components/ui";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
interface Props {
  dataAdress: Address;
  translations: dictionary;
  defaultCount: number;
}

export default function UpdateAddress({
  dataAdress,
  translations,
  defaultCount,
}: Props) {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const router = useRouter();
  const [form, setForm] = useState({
    id: dataAdress.id,
    address: dataAdress.adresse,
    postalCode: dataAdress.code_postal,
    city: dataAdress.ville,
    default: dataAdress.default,
    designation: dataAdress.designation,
    country: dataAdress.pays,
  });
  const [isDefault, setIsDefault] = useState(form.default);
  const handleChangeSubmit = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  async function handleSubmit(address: defaultAddress) {
    try {
      const result = await updateAddressAction(address);
      router.refresh();
      return result;
    } catch (error) {
      console.error(error);
    }
  }

  const handleChange = async () => {
    try {
      await deleteAdressClientAction(dataAdress.id);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex justify-end mt-5"
          onClick={() => setSelectedAddress(dataAdress)}
        >
          <Pencil size={16} />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {translations.costumerAccount.updateAdress.title}
          </DialogTitle>
        </DialogHeader>
        {selectedAddress && (
          <>
            <Label htmlFor="adresse">
              {translations.costumerAccount.dataClient.address}
            </Label>
            <Input
              id="adresse"
              name="address"
              type="adresse"
              placeholder={translations.costumerAccount.dataClient.address}
              value={form.address}
              onChange={handleChangeSubmit}
            />
            <Label htmlFor="Code Postale">
              {translations.costumerAccount.dataClient.postcode}
            </Label>
            <Input
              id="Code Postale"
              name="postalCode"
              type="Code Postale"
              placeholder={translations.costumerAccount.dataClient.postcode}
              value={form.postalCode}
              onChange={handleChangeSubmit}
            />
            <Label htmlFor="ville">
              {translations.costumerAccount.dataClient.city}
            </Label>
            <Input
              id="ville"
              name="city"
              type="ville"
              placeholder={translations.costumerAccount.dataClient.city}
              value={form.city}
              onChange={handleChangeSubmit}
            />
            <Label htmlFor="designation">
              {translations.costumerAccount.dataClient.designation}
            </Label>
            <Input
              id="designation"
              name="designation"
              placeholder={translations.costumerAccount.dataClient.designation}
              value={form.designation}
              onChange={handleChangeSubmit}
              type="designation"
            />
            <Label htmlFor="pays">
              {translations.costumerAccount.dataClient.country}
            </Label>
            <Input
              id="pays"
              name="country"
              placeholder={translations.costumerAccount.dataClient.country}
              value={form.country}
              onChange={handleChangeSubmit}
              type="pays"
            />

            <div className="sm:text-base mt-6">
              {!(isDefault && defaultCount === 1) && (
                <>
                  {isDefault
                    ? translations.costumerAccount.updateAdress.deleteDefault
                    : translations.costumerAccount.updateAdress.addDefault}
                  <Checkbox
                    className="ml-1"
                    checked={isDefault}
                    onCheckedChange={(checked) => setIsDefault(!!checked)}
                  />
                </>
              )}
            </div>
          </>
        )}
        <DialogFooter>
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <DialogClose asChild>
              <Button
                variant="default"
                onClick={() => handleSubmit({ ...form, default: isDefault })}
              >
                {translations.costumerAccount.updateAdress.save}
              </Button>
            </DialogClose>

            <DialogClose asChild>
              <Button variant="secondary" onClick={handleChange}>
                {translations.costumerAccount.updateAdress.delete}
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
