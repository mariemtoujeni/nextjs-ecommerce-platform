"use client";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="link"
      size="sm"
      className="mb-5"
      onClick={() => router.push("/account/return-products/form")}
    >
      ← Retour
    </Button>
  );
}
