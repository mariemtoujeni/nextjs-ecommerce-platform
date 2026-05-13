"use client";

import { resetPasswordAction } from "@repo/actions/auth";
import { PasswordErrorType } from "@repo/core/models";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { dictionary } from "~/app/dictionaries";
import { Button, Input, Label } from "~/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface Props {
  dict: dictionary;
}

export default function ResetPassword({ dict }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const passwordsMatch = password === confirmPwd;
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrorType[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const getPasswordErrorMessages = (
    dict: any
  ): Record<PasswordErrorType, string> => ({
    TOO_SHORT: dict.costumerAccount.passwordError.TOO_SHORT,
    NO_UPPERCASE: dict.costumerAccount.passwordError.NO_UPPERCASE,
    NO_NUMBER: dict.costumerAccount.passwordError.NO_NUMBER,
    NO_SPECIAL: dict.costumerAccount.passwordError.NO_SPECIAL,
    NO_LOWERCASE: dict.costumerAccount.passwordError.NO_LOWERCASE,
  });
  const errorMessages = getPasswordErrorMessages(dict);
  const validatePassword = (pwd: string): PasswordErrorType[] => {
    const errors: PasswordErrorType[] = [];
    if (pwd.length < 8) errors.push("TOO_SHORT");
    if (!/[A-Z]/.test(pwd)) errors.push("NO_UPPERCASE");
    if (!/[a-z]/.test(pwd)) errors.push("NO_LOWERCASE");
    if (!/[0-9]/.test(pwd)) errors.push("NO_NUMBER");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push("NO_SPECIAL");
    return errors;
  };

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordErrors(validatePassword(value));
  };
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!token) {
      console.error("Recovery token is missing!");
      setErrorMessage(dict.forgotPassword.errorMissingToken);
      return;
    }

    try {
      const result = await resetPasswordAction(password, token);
      if (result.success) {
        setSuccessDialogOpen(true);
      } else {
        switch (result.error) {
          case "Invalid token":
            setErrorMessage(dict.forgotPassword.errorInvalidToken);
            break;
          case "Token expired":
            setErrorMessage(dict.forgotPassword.errorTokenExpired);
            break;
          default:
            setErrorMessage(dict.forgotPassword.errorResetFailed);
        }
      }
    } catch (error) {
      console.error("Erreur de la modification de mot de passe :", error);
      setErrorMessage(dict.forgotPassword.errorUnexpected);
    }
  }
  const handleSuccessClose = () => {
    setSuccessDialogOpen(false);
    router.push("/");
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-8 mt-8">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{dict.forgotPassword.password}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                placeholder={dict.forgotPassword.enter}
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {!showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordErrors.length > 0 && (
              <ul className="text-red-500 text-sm mt-1">
                {passwordErrors.map((err) => (
                  <li key={err}>{errorMessages[err]}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-8 mt-8">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{dict.forgotPassword.confirm}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showConfirmPassword ? "text" : "password"}
                className="pr-10"
                placeholder={dict.forgotPassword.confirmNew}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {!showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
          {!passwordsMatch && confirmPwd.length > 0 && (
            <span className="text-red-500 text-sm">
              {dict.forgotPassword.errorMismatch}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="mt-8">
            <Button
              type="submit"
              className="w-full bg-lime text-black italic font-bold rounded-none text-md py-4"
              disabled={passwordErrors.length > 0 || !passwordsMatch}
            >
              {dict.forgotPassword.submit}
            </Button>
          </div>
        </div>
      </form>
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-6 shadow-lg">
          <DialogHeader className="flex items-center justify-center gap-2">
            <DialogTitle>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center">
            {dict.forgotPassword.success}
          </DialogDescription>
          <DialogFooter>
            <div className="flex justify-center w-full">
              <Button onClick={handleSuccessClose}>
                {dict.forgotPassword.close}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
