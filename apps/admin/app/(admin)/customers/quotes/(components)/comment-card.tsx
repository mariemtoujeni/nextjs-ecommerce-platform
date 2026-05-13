'use client';

import { useState } from "react";
import { Card, CardHeader, CardContent } from "~/components/ui";
import { Textarea } from "~/components/ui/textarea";
import { Quotation } from "@repo/core/models";

interface CommentCardProps {
  quotation: Quotation;
  isEditable: boolean;
  onQuotationChange: (quotation: Quotation) => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({ quotation, onQuotationChange, isEditable }: CommentCardProps) => {
  const [comment, setComment] = useState(quotation.clientComment ?? "");

  const handleBlur = () => {
    if (comment !== quotation.clientComment) {
      onQuotationChange({
        ...quotation,
        clientComment: comment,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="text-gray-700 font-bold">Commentaire du client</CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Aucun commentaire"
          className="bg-muted focus:bg-white"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={handleBlur}
          disabled={!isEditable}
        />
      </CardContent>
    </Card>
  );
};
