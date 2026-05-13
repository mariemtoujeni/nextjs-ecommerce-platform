import { addProductAlertAction} from "@repo/actions/product-alerts"
import { getUserAction } from "@repo/actions/auth";
import { ModelWithAttributs, ModelWithProduct, Product } from "@repo/core/models";
import { useEffect, useState } from "react";
import { Button, Input } from "~/components/ui";
import { getSelectedModelId } from "../utils/product";
import { useProductSelection } from "./ProductSelectionContext";



interface StockProductProps {  
  product: Product;
  translations: {
    alertStock: string;
    outStock : string;
    notification: string
  }
}

export const StockProduct = ({ translations, product }: StockProductProps) => {
  const { selectedModelId } = useProductSelection();
  const [stockDisponible, setStockDisponible] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [alertSent, setAlertSent] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const userData = await getUserAction();
      if (!userData.is_anonymous) {
        setIsConnected(true);
      }      
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (!selectedModelId) {
      setStockDisponible(null);
      return;
    }

    const matchingModel = product.modelAttributs?.find((m) => m.id === selectedModelId) ?? null;
    if (matchingModel) {
      setStockDisponible(matchingModel.stock);
    } else {
      setStockDisponible(null);
    }
  }, [selectedModelId, product]);

  const handleAlertSubmit = async () => {

    if (!selectedModelId) {
      return;
    }

    if (!isConnected && !showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    if (!isConnected && !email) {
      return;
    }

    setLoading(true);
    try {
      await addProductAlertAction({
        idModel: selectedModelId,
        email: isConnected ? undefined : email,
      });
      setAlertSent(true);
      setShowEmailInput(false);
      setEmail("");
    } catch (err) {
      console.error("[StockProduct] Error submitting alert:", err);
    } finally {
      setLoading(false);
    }
  };

  if (stockDisponible === null) {
    return null;
  }

  if (stockDisponible <= product.minStock) {
    return (
      <div className="mt-3 space-y-2">
        <span className="text-red-600 font-semibold">{translations.outStock} !</span>

        {alertSent ? (
          <p className="text-green-600 text-sm">{translations.notification}</p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {!isConnected && showEmailInput && (
              <Input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
            <Button
              onClick={handleAlertSubmit}
              size="default"
              variant="secondary"
              disabled={loading || (!isConnected && showEmailInput && !email)}
            >
              {translations.alertStock}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return null;
};
