"use client";
import { sendEmailAction } from "@repo/actions/auth";
import { useState } from "react";
import { dictionary } from "~/app/dictionaries";
import { Button, Input, Label } from "~/components/ui";
interface Props {
  dict: dictionary;
}

export default function ForgotPassword({ dict }: Props) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "">("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email) return;

    try {
      
      const result = await sendEmailAction(email);

      if (!result.userExists) {
        setMsg(dict.forgotPassword.notFound);
        setMsgType("error");
        return;
      }

      if (result.success) {
        setMsg(dict.forgotPassword.sendEmail);
        setMsgType("success");
      } else {
        setMsg(dict.forgotPassword.unableSend);
        setMsgType("error");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
      setMsg(dict.forgotPassword.error);
      setMsgType("error");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-8 mt-8">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{dict.forgotPassword.emailLabel}</Label>
            <Input
              id="email"
              type="email"
              placeholder={dict.forgotPassword.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="mt-8">
          <Button
            type="submit"
            className="w-full bg-lime text-black italic font-bold rounded-none text-md py-4"
          >
            {dict.forgotPassword.submit}
          </Button>
        </div>
        {msg && (
          <p className={`text-sm font-medium mt-2 ${ msgType === "success" ? "text-green-600" : "text-red-600" }`} >
            {msg}
          </p>
        )}
      </div>
    </form>
  );
}
