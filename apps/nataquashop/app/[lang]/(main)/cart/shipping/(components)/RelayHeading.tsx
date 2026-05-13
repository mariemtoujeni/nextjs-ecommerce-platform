'use client';

import { Heading } from "~/components/ui/heading";
import { useValidation } from "~/components/cart/ValidationContext";

interface RelayHeadingProps {
  title: string;
  validationText: string;
}

export function RelayHeading({ title, validationText }: RelayHeadingProps) {
  const { relayError } = useValidation();

  return (
    <div>
      <Heading
        heading="6"
        id="relay-heading"
        className={
          relayError
            ? "border-2 border-amber-400 bg-amber-50 text-amber-800 px-3 py-2 rounded-md"
            : ""
        }
      >
        {title}
      </Heading>
      {relayError && (
        <div className="text-sm text-amber-700 mt-2" id="relay-helper">
          {validationText}
        </div>
      )}
    </div>
  );
}
