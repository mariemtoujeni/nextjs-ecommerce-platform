"use client";
import { useRouter } from "next/navigation";
import { dictionary } from "~/app/dictionaries";

interface Props {
  dict: dictionary;
}

export default function CancelPage({ dict }: Props) {
  const router = useRouter();
  return (
    <button
      className="text-neutral-500 hover:underline"
      onClick={() => router.push("/signin")}
    >
      {dict.forgotPassword.cancel}
    </button>
  );
}
