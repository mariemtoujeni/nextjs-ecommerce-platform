"use client";

import { validatePayment } from "@repo/actions/cart";
import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from "~/components/ui/dialog";
import { Button } from "~/components/ui";
import { AlertCircle } from "lucide-react";

// const PROD_ORIGINS = [
//   "https://nataquashop.com",
//   "https://dev.nataquashop.com",
// ];

// export const ALLOWED_ORIGINS = process.env.NODE_ENV === "production" ? PROD_ORIGINS : ["*"];


export function CartPaymentListener() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogIcon, setDialogIcon] = useState<JSX.Element | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const handlePaymentMessage = async (event: MessageEvent) => {
      // if (!ALLOWED_ORIGINS.includes(event.origin) && ALLOWED_ORIGINS[0] !== "*") {
      //   console.error("Rejected message from origin:", event.origin);
      //   return;
      // }
      if (event.data?.type === "payment-submitted") {
        try {
          const orderId = await validatePayment("SYSTEMPAY", event.data.data);
          router.push(`/cart/remerciement?orderId=${orderId.item}`);
        } catch (error) {
          console.error("Error validating payment:", error);
          setDialogTitle("Erreur de paiement");
          setDialogMessage(
            "Une erreur est survenue lors de la validation du paiement. Veuillez réessayer."
          );
          setDialogIcon(<AlertCircle className="w-6 h-6 text-red-600" />);
          setDialogOpen(true);
        }
      } else if (event.data?.type === "payment-error") {
        console.error("KR payment error:", event.data.error);
        setDialogTitle("Erreur de paiement");
        setDialogMessage(
          "Une erreur est survenue lors du paiement. Veuillez réessayer."
        );
        setDialogIcon(<AlertCircle className="w-6 h-6 text-red-600" />);
        setDialogOpen(true);
      }
    };

    window.addEventListener("message", handlePaymentMessage);
    return () => {
      window.removeEventListener("message", handlePaymentMessage);
    };
  }, [router]);

  return (
  <>
    <iframe
      key={iframeKey}
      src="/cart/payment/iframe-form"
      style={{ width: "100%", height: "600px", border: "none" }}
      title="Formulaire de paiement Krypton"
    />
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-6 shadow-lg">
        <DialogHeader className="flex items-center gap-2">
          {dialogIcon}
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{dialogMessage}</DialogDescription>
        <DialogFooter>
          <Button variant="secondary" onClick={() => { 
            setIframeKey((k) => k + 1); 
            setDialogOpen(false); }}
          > Réessayer 
          </Button>
          <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}
