import { Opinion } from "@repo/core/models";
import { Pencil, Star } from "lucide-react";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Label,
} from "~/components/ui";
import { WYSIWYG } from "~/components/wysiwyg";

export interface GeneralComponentProps {
  opinion: Opinion;
  onChange: (opinion: Opinion) => void;
}

export default function GeneralComponent({
  opinion,
  onChange,
}: GeneralComponentProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [preview, setPreview] = useState(true);

  return (
    <Card className="mt-5 ">
      <CardHeader>
        <CardTitle>
          <Heading
            heading="3"
            className="inline-flex items-center text-gray-700 font-semibold"
          >
            <span className="mr-4">Avis</span>

            <div className="flex gap-1 items-center">
              {[...Array(5)].map((_, i) => {
                const index = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={preview}                    
                    onClick={() => onChange({ ...opinion, rating: index })}
                    className={preview ? "cursor-default" : "cursor-pointer"}
                  >
                    <Star
                     key={i}
                      size={20}
                      className={
                            i < opinion.rating
                              ? "fill-lemonYellow text-lemonYellow"
                              : "fill-grayLight text-grayLight"
                          }
                    />
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPreview((prev) => !prev)}
                title={
                      preview
                        ? "Cliquer pour activer la modification"
                        : "Cliquer pour désactiver la modification"
                    }
                className="text-gray-500 hover:text-gray-700"
              >
                <Pencil size={16} />
              </button>
            </div>
          </Heading>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 ">
          <Label>Titre</Label>
          <Input
            value={opinion.title || ""}
            onChange={(e) => onChange({ ...opinion, title: e.target.value })}
          />

          <div className="flex flex-col w-full">
            <div className="flex items-center  mb-2">
              <Label>Description</Label>

              <button
                type="button"
                onClick={() => setIsPreview((prev) => !prev)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <Pencil size={16} />
              </button>
            </div>

            <div className="w-full ">
              <WYSIWYG
                content={opinion.text ?? ""}
                onChange={(value) => {
                  onChange({ ...opinion, text: value });
                }}
                previewMode={isPreview}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
