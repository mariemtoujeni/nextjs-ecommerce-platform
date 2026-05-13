"use client";
import { updateDiscountAction } from "@repo/actions/discounts";
import { Discount, ReductionType } from "@repo/core/models";
import { TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "~/components/ui";
import { generateRandomCode } from "~/lib/utils";

interface Props {
  discount: Discount;
}

export default function PrimaryCard({ discount }: Props) {
  const router = useRouter();

  const [method, setMethod] = useState(() => discount.code?.trim() ? "code" : "auto");
  const [code, setCode] = useState(discount.code ?? "");
  const [type, setType] = useState(discount.type);
  const [isUpdating, setIsUpdating] = useState(false);

  const isSyncingFromProps = useRef(false);
  const lastSavedCode = useRef(discount.code ?? "");

  const handleGenerateCode = useCallback(() => {
    const newCode = generateRandomCode();
    setCode(newCode);
    saveCode(newCode); 
  }, []);

  useEffect(() => {
    const newMethod = discount.code?.trim() ? "code" : "auto";
    const newCode = discount.code ?? "";

    if (method !== newMethod || code !== newCode) {
      isSyncingFromProps.current = true;
      setMethod(newMethod);
      setCode(newCode);
      lastSavedCode.current = newCode;
    }
  }, [discount.code]);

  const saveCode = async (newCode: string) => {
    if (newCode === lastSavedCode.current) return; // prevent duplicate saves
    lastSavedCode.current = newCode;

    setIsUpdating(true);
    try {
      await updateDiscountAction({
        type,
        code: newCode,
        id: discount.id,
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update discount:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBlur = () => {
    saveCode(code.trim());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <TagIcon size={20} className="text-blue-600 shrink-0" />
            <span className="text-lg font-bold text-gray-700">
              Type de la réduction
            </span>
          </CardTitle>
          <Badge className="text-sm text-gray-500 px-2 py-1 rounded">
            {discount.type === ReductionType.CAMPAGNE
              ? "Produit"
              : discount.type === ReductionType.COMMANDE
              ? "Commande"
              : discount.type === ReductionType.EXPEDITION
              ? "Expédition"
              : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="method" className="text-sm font-medium text-gray-700">
            Méthode
          </Label>
          <Select
            value={method}
            onValueChange={(value) => {
              setMethod(value);
              if (value === "auto") {
                setCode("");
                saveCode(""); // save immediately if switched to auto
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Auto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {method === "code" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="discount-code" className="text-sm font-medium text-gray-700" >
                Code de réduction
              </Label>
              <div className="flex items-center gap-3">
                {code && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => { setCode(""); saveCode(""); }}
                    className="text-red-600 hover:text-red-800 p-0 h-auto font-normal"
                  >
                    Supprimer le code
                  </Button>
                )}
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleGenerateCode}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
                >
                  Générer un code aléatoire
                </Button>
              </div>
            </div>
            <Input
              id="discount-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onBlur={handleBlur} 
              placeholder="Code"
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              Les clients doivent saisir ce code au moment du paiement.
            </p>
          </div>
        )}
        {isUpdating && (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            Mise à jour...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
