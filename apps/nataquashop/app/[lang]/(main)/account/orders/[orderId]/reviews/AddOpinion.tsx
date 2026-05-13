"use client";

import {
  addOpinionClientAction,
  getTitleProductByOrderAction,
} from "@repo/actions/account-client";
import { InfoProductByOrder, opinionInput } from "@repo/core/models";
import { useEffect, useState } from "react";
import { dictionary } from "~/app/dictionaries";
import { Button, Select, SelectTrigger, SelectValue } from "~/components/ui";
import SelectTitle from "./SelectTitle";
import { CheckCircle, Star } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface Props {
  translations: dictionary;
  idNum: number;
  lang: string;
}

export default function AddOpinion({ translations, idNum, lang }: Props) {
  const [titles, setTitles] = useState<InfoProductByOrder[]>([]);
  const [note, setNote] = useState(3);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchTitles() {
      const dataReturned = await getTitleProductByOrderAction(idNum);
      const data = dataReturned.items;
      setTitles(data);
    }
    fetchTitles();
  }, [idNum]);
  const [formData, setFormData] = useState<opinionInput>({
    modelId: 0,
    commandId: idNum,
    productId: 0,
    title: "",
    text: "",
    rating: 0,
    createdAt: new Date(),
  });
  const handleSelectProduct = (value: string) => {
    const selected = titles.find((t) =>
      t.descriptions.some((d) => d.title === value)
    );
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        modelId: selected.modelId ?? null,
        productId: selected.productId ?? null,
        commandId: idNum,
      }));
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const [message, setMessage] = useState("");

  const handleRating = (rating: number) => {
    setNote(rating);
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async () => {
    if (formData.modelId && formData.productId) {
      try {
        const result = await addOpinionClientAction({
          ...formData,
          rating: note,
        });
        setMessage(translations.costumerAccount.review.reviewAdded);
        setOpen(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <>
      <div className="mt-5 w-full sm:w-2/3">
        <Select onValueChange={handleSelectProduct}>
          <SelectTrigger>
            <SelectValue
              placeholder={translations.costumerAccount.review.placeholder}
              className="text-black"
            />
          </SelectTrigger>
          <SelectTitle lang={lang} idNum={idNum} />
        </Select>
      </div>
      <p className="mt-5 text-sm sm:text-base">
        {translations.costumerAccount.review.addNote}
      </p>
      <div className="flex gap-1 mt-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={28}
            onClick={() => handleRating(i)}
            className={i <= note ? "text-lime" : "text-gray"}
            fill={i <= note ? "currentColor" : "none"}
          />
        ))}
      </div>
      <div className="mt-5">
        <label className="block text-sm font-medium mb-1">
          {translations.costumerAccount.review.titleReview}
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-lime-400"
          placeholder={translations.costumerAccount.review.placeholderTitle}
        />
      </div>
      <div className="mt-5">
        <label className="block text-sm font-medium mb-1">
          {translations.costumerAccount.review.review}
        </label>
        <textarea
          name="text"
          value={formData.text}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-md min-h-[100px] resize-none focus:outline-none focus:ring focus:ring-lime-400"
          placeholder={translations.costumerAccount.review.placeholderText}
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <Button variant="secondary">
          {translations.costumerAccount.review.cancel}
        </Button>
        <Button onClick={handleSubmit}>
          {translations.costumerAccount.review.publisheReview}
        </Button>

        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              router.push("/account/orders");
            }
          }}>
          <DialogContent className="sm:max-w-sm rounded-2xl p-6 shadow-lg">
            <DialogHeader className="flex items-center justify-center gap-2">
              <DialogTitle>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-center">
              {message}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
