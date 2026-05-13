"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose, } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Heading } from "~/components/ui/heading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "~/components/ui/select";

interface CartAddressFormDialogProps {
  dict: any;
  onSubmit: (address: any) => void;
}

export const CartAddressFormDialog: React.FC<CartAddressFormDialogProps> = ({
  dict,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    designation: "",
    address: "",
    postalCode: "",
    city: "",
    complement: "",
    building: "",
    country: "France",
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [open, setOpen] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = () => {
    const requiredFields = ["address", "postalCode", "city"];
    const newErrors: { [key: string]: boolean } = {};

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.trim()) {
        newErrors[field] = true;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstMissing = Object.keys(newErrors)[0];
      if (firstMissing) {
        document.getElementById(firstMissing)?.focus();
      }
      return;
    }
    onSubmit(formData);
    setOpen(false);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          {dict.cart.shipping.address.add}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90%] md:w-[45%] max-w-2xl p-0">
        {/* Header */}
        <DialogTitle>
          <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-8 pb-4">
            <Heading heading="5">
              {dict.cart.shipping.addressForm.title}
            </Heading>
          </div>
        </DialogTitle>

        {/* Form */}
        <div className="px-4 md:px-8">
          <div className="space-y-4">
            {/* Adresse */}
            <div className="space-y-2">
              <Label
                htmlFor="address"
                required
                className={errors.address ? "text-red-500 font-semibold" : ""}
              >
                {dict.cart.shipping.addressForm.address}
              </Label>
              <Input
                id="address"
                className={errors.address ? "border-red-500 focus-visible:ring-red-500" : ""}
                placeholder={dict.cart.shipping.addressForm.addressPlaceholder}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            {/* Code postal et Ville */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="postalCode"
                  required
                  className={errors.postalCode ? "text-red-500 font-semibold" : ""}
                >
                  {dict.cart.shipping.addressForm.postalCode}
                </Label>
                <Input
                  id="postalCode"
                  className={errors.postalCode ? "border-red-500 focus-visible:ring-red-500" : ""}
                  placeholder={dict.cart.shipping.addressForm.postalCodePlaceholder}
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="city"
                  required
                  className={errors.city ? "text-red-500 font-semibold" : ""}
                >
                  {dict.cart.shipping.addressForm.city}
                </Label>
                <Input
                  id="city"
                  className={errors.city ? "border-red-500 focus-visible:ring-red-500" : ""}
                  placeholder={dict.cart.shipping.addressForm.cityPlaceholder}
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>
            </div>

            {/* Complément et Bâtiment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complement">
                  {dict.cart.shipping.addressForm.complement}
                </Label>
                <Input
                  id="complement"
                  placeholder={dict.cart.shipping.addressForm.complementPlaceholder}
                  value={formData.complement}
                  onChange={(e) => handleChange("complement", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="building">
                  {dict.cart.shipping.addressForm.building}
                </Label>
                <Input
                  id="building"
                  placeholder={dict.cart.shipping.addressForm.buildingPlaceholder}
                  value={formData.building}
                  onChange={(e) => handleChange("building", e.target.value)}
                />
              </div>
            </div>

            {/* Pays */}
            <div className="space-y-2">
              <Label htmlFor="country">
                {dict.cart.shipping.addressForm.country}
              </Label>
              <Select
                value={formData.country}
                onValueChange={(value) => handleChange("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={dict.cart.shipping.addressForm.countryPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="France">France</SelectItem>
                  {/* Add more countries if needed */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-4 py-4 md:px-8 md:py-8 mt-4">
          <DialogClose asChild>
            <Button variant="outline">
              {dict.cart.shipping.addressForm.cancel}
            </Button>
          </DialogClose>
          <Button variant="default" onClick={handleSubmit}>
            {dict.cart.shipping.addressForm.add}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
