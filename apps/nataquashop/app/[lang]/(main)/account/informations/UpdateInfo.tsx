"use client";
import {
  updateInformationClientAction,
  updatePasswordClientAction,
} from "@repo/actions/account-client";
import {
  Client,
  dataClientInput,
  passwordClientInput,
  passwordClientInputSchema,
  PasswordErrorType,
} from "@repo/core/models";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { dictionary } from "~/app/dictionaries";
import { Button, Input, Label } from "~/components/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface props {
  clientInfos: Client;
  translations: dictionary;
}

export default function UpdateInfo({ clientInfos, translations }: props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    lastName: clientInfos.lastName,
    firstName: clientInfos.firstName,
    email: clientInfos.email,
    mobilePhone: clientInfos.mobilePhone,
    phone: clientInfos.phone,
    birthDate: clientInfos.birthDate ? new Date(clientInfos.birthDate) : null,
    clientNumber: clientInfos.clientNumber,
  });
  const [password, setPassword] = useState({ password: "" });
  const [passwordError, setPasswordError] = useState<PasswordErrorType[]>([]);
  const errorMessages: Record<PasswordErrorType, string> = {
    TOO_SHORT: translations.costumerAccount.passwordError.TOO_SHORT,
    NO_UPPERCASE: translations.costumerAccount.passwordError.NO_UPPERCASE,
    NO_NUMBER: translations.costumerAccount.passwordError.NO_NUMBER,
    NO_SPECIAL: translations.costumerAccount.passwordError.NO_SPECIAL,
    NO_LOWERCASE: translations.costumerAccount.passwordError.NO_LOWERCASE,
  };
  const [showPassword, setShowPassword] = useState(false);
  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword({ password: value });

    try {
      passwordClientInputSchema.parse({ [name]: value });
      setPasswordError([]);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const codes = err.errors.map((e) => e.message as PasswordErrorType);
        setPasswordError(codes);
      }
    }
  };
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "birthDate" && value ? new Date(`${value}T00:00:00`) : value,
    }));
  };

  async function handleSubmit(newClientInformations: dataClientInput) {
    const newErrors: { [key: string]: string } = {};

    if (!newClientInformations.lastName?.trim()) {
      newErrors.lastName =
        translations.costumerAccount.dataClient.lastname +
        " " +
        translations.costumerAccount.dataClient.required;
    }

    if (!newClientInformations.firstName?.trim()) {
      newErrors.firstName =
        translations.costumerAccount.dataClient.firstname +
        " " +
        translations.costumerAccount.dataClient.required;
    }

    if (!newClientInformations.email?.trim()) {
      newErrors.email =
        translations.costumerAccount.dataClient.email +
        " " +
        translations.costumerAccount.dataClient.required;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      const result = await updateInformationClientAction(newClientInformations);
    } catch (error) {
      console.error(error);
    }
  }
  async function handleSubmitPassword(newPasswordClient: passwordClientInput) {
    try {
      await updatePasswordClientAction(newPasswordClient);
      setMessage(translations.costumerAccount.dataClient.message);
      setOpen(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="lastName">
            {translations.costumerAccount.dataClient.lastname}
          </Label>
          <Input
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="firstName">
            {translations.costumerAccount.dataClient.firstname}
          </Label>
          <Input
            id="firstName"
            name="firstName"
            value={form?.firstName}
            onChange={handleChange}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="email">
            {translations.costumerAccount.dataClient.email}
          </Label>
          <Input
            id="email"
            name="email"
            value={form?.email}
            type="email"
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="phone">
            {translations.costumerAccount.dataClient.phone}
          </Label>
          <Input
            id="phone"
            name="phone"
            value={form?.phone}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="mobilePhone">
            {translations.costumerAccount.dataClient.mobile}
          </Label>
          <Input
            id="mobilePhone"
            name="mobilePhone"
            value={form?.mobilePhone}
            onChange={handleChange}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="birthDate">
            {translations.costumerAccount.dataClient.birthdate}
          </Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            value={
              form.birthDate
                ? new Date(form.birthDate).toLocaleDateString("fr-CA")
                : ""
            }
            onChange={(e) => {
              const date = new Date(e.target.value);
              date.setHours(12, 0, 0, 0);
              setForm({ ...form, birthDate: date });
            }}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Label htmlFor="password">
            {translations.costumerAccount.dataClient.password}
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              placeholder="****"
              type={showPassword ? "text" : "password"}
              value={password.password}
              onChange={handleChangePassword}
              className="pr-10" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {!showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <ul className="text-red-500 text-sm mt-1">
            {passwordError.map((err) => (
              <li key={err} className="flex items-center gap-1">
                {errorMessages[err]}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="">
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="default"
                onClick={() =>
                  handleSubmitPassword({ password: password.password })
                }
                disabled={
                  passwordError.length > 0 || password.password.trim() === ""
                }
              >
                {translations.costumerAccount.dataClient.editPassword}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 text-center text-sm">
              {message}
            </PopoverContent>
          </Popover>
          <Button
            variant="default"
            size="default"
            onClick={() => handleSubmit(form)}
          >
            {translations.costumerAccount.dataClient.save}
          </Button>
        </div>
      </div>
    </>
  );
}
