'use client';
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { Button } from "~/components/ui";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "~/components/cart-context";

export default function RemerciementPage() {
  const [animate, setAnimate] = useState(false);
  const router = useRouter();
  const { syncCartCount } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  useEffect(() => {
    setAnimate(true);
    startTransition(async () => {
      await syncCartCount();
      router.refresh();
    });
  }, []);

  return (
    <div className="flex flex-col bg-white text-center px-4 py-12">
      <div className="flex flex-col items-center justify-start">
        <svg
          className="w-32 h-32"
          viewBox="0 0 52 52"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: "#22c55e" }}
        >
          <circle cx="26" cy="26" r="23" className="stroke-current" style={{ stroke: "#22c55e" }} />
          <path d="M14 27l7 7 16-16" className={`stroke-current ${animate ? "checkmark-path" : ""}`} style={{ stroke: "#22c55e" }} />
        </svg>
        <h2 className="text-4xl font-bold mt-6 text-gray-800">
          Merci, votre paiement a bien été reçu.
        </h2>
        <h3 className="text-2xl font-bold mt-6 text-gray-800">
          Référence de votre commande : #{orderId}
        </h3>
        <div className="mt-6">
          <Link href="/">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour vers la page d&apos;accueil
            </Button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .checkmark-path {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: dash 2.5s ease-out forwards;
        }

        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
