"use client";

import { useState, useTransition } from "react";
import { Diamond } from "lucide-react";
import { Button, Input } from "./ui";
import { subscribeNewsletterAction } from "@repo/actions/clients";

interface NewsletterProps {
  newsletter: boolean;
  dict: any;
}

export default function Newsletter({ newsletter, dict }: NewsletterProps) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");

  if (newsletter) {
    return (
      <div className="font-thin text-sm">
        <p>{dict.globalfooter.newsletterTrueA}</p>
        <p>{dict.globalfooter.newsletterTrueB}</p>
      </div>
    );
  }

  const handleSubscribe = () => {
    startTransition(async () => {
      if (!email) return;
      try {
        await subscribeNewsletterAction(email);
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <div className="relative gap-2 flex items-center w-full py-3 px-4 max-w-md rounded-full bg-white max-h-[50px]">
      <Input
        placeholder={dict.globalfooter.emailPlaceholder}
        className="w-2/3 border-none text-black outline-none bg-white hover:bg-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        className="w-1/3 gap-1 rounded-full text-sm text-black hover:translate-y-0 translate-x-[13px]"
        variant="default"
        onClick={handleSubscribe}
        disabled={isPending || !email}
      >
        {isPending
          ? `${dict.globalfooter.subscribeBtn}...`
          : dict.globalfooter.subscribeBtn}
      </Button>
    </div>
  );
}
