"use client";

import { Label } from "~/components/ui/label";
import { WYSIWYG } from "~/components/wysiwyg";
import { Input } from "~/components/ui/input";
import { langMap } from "~/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { updateDescriptionAction } from "@repo/actions/products";
import { Loader2 } from "lucide-react";
import { ProductDescription } from "@repo/core/models";

type Props = {
  title: string;
  description: string;
  lang: string;
  pending: boolean;
  productId?: number; 
  onChange?: (desc: ProductDescription) => void; 
};

export default function Description({
  title,
  description,
  lang,
  productId,
  pending,
  onChange,
}: Props) {
  const { toast } = useToast();

  const [titleInput, setTitleInput] = useState(title);
  const [descriptionInput, setDescriptionInput] = useState(description);

  const [debouncedTitle, setDebouncedTitle] = useState(title);
  const [debouncedDescription, setDebouncedDescription] = useState(description);

  const [isPending, setIsPending] = useState(pending);

  const userTypingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInProgressRef = useRef(false);
  const lastSavedRef = useRef({ title, description });
  const lastExternalRef = useRef({ title, description });
  const lastChangeOriginRef = useRef<"user" | "external" | null>(null);

  // 1) Sync external props (AI updates, etc.)
  useEffect(() => {
    const changedExternally =
      title !== lastExternalRef.current.title ||
      description !== lastExternalRef.current.description;
    if (!changedExternally) return;

    lastExternalRef.current = { title, description };

    if (!userTypingRef.current && !saveInProgressRef.current) {
      setTitleInput(title);
      setDescriptionInput(description);
      setDebouncedTitle(title);
      setDebouncedDescription(description);
      lastChangeOriginRef.current = "external";
      lastSavedRef.current = { title, description };
    }
  }, [title, description]);

  // 2) Debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedTitle(titleInput);
      setDebouncedDescription(descriptionInput);
      lastChangeOriginRef.current = "user";
      userTypingRef.current = false;
    }, 500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [titleInput, descriptionInput]);

  // 3) Save effect
  useEffect(() => {
    const originIsUser = lastChangeOriginRef.current === "user";
    const changedFromLastSaved =
      debouncedTitle !== lastSavedRef.current.title ||
      debouncedDescription !== lastSavedRef.current.description;

    if (!originIsUser || !changedFromLastSaved) return;

    if (onChange) {
      const updated: ProductDescription = {
        lang,
        title: debouncedTitle,
        description: debouncedDescription,
      };
      onChange(updated);
      lastSavedRef.current = {
        title: debouncedTitle,
        description: debouncedDescription,
      };
      lastChangeOriginRef.current = null;
    } else if (productId && !saveInProgressRef.current) {
      saveInProgressRef.current = true;

      (async () => {
        try {
          const success = await updateDescriptionAction(productId, {
            title: debouncedTitle,
            description: debouncedDescription,
            lang,
          });

          if (success) {
            lastSavedRef.current = {
              title: debouncedTitle,
              description: debouncedDescription,
            };
            toast({
              title: "Description mise à jour",
              description: "La description a été mise à jour avec succès",
            });
          } else {
            toast({
              title: "Erreur",
              description: "La description n'a pas été mise à jour",
              variant: "destructive",
            });
          }
        } finally {
          saveInProgressRef.current = false;
          lastChangeOriginRef.current = null;
        }
      })();
    }
  }, [debouncedTitle, debouncedDescription, productId, lang, toast, onChange]);

  // 4) Keep pending in sync
  useEffect(() => {
    setIsPending(pending);
  }, [pending]);

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    userTypingRef.current = true;
    setTitleInput(e.target.value);
  };
  const onDescriptionChange = (value: string) => {
    userTypingRef.current = true;
    setDescriptionInput(value);
  };

  return (
    <div key={lang} className="space-y-4">
      <div>
        <Label htmlFor={`title-${lang}`}>Titre {langMap[lang]}</Label>
        <Input id={`title-${lang}`} value={titleInput} onChange={onTitleChange} />
      </div>

      <div>
        <Label htmlFor={`description-${lang}`}>Description {langMap[lang]}</Label>
        {isPending ? (
          <div className="relative">
            <WYSIWYG
              content={descriptionInput}
              placeholder="Description du produit..."
              onChange={onDescriptionChange}
            />
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-50 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">
                Génération de la description en cours...
              </span>
            </div>
          </div>
        ) : (
          <WYSIWYG
            content={descriptionInput}
            placeholder="Description du produit..."
            onChange={onDescriptionChange}
          />
        )}
      </div>
    </div>
  );
}
