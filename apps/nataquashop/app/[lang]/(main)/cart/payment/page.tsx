import { getDictionary } from "~/app/dictionaries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { CreditCard, Banknote, Copy } from "lucide-react";
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CartPaymentListener } from "./CartPaymentListener";
import { getCartSummaryAction } from "@repo/actions/cart";
import { LangParams } from "~/app/utils";
import { Button } from "~/components/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CartSummaryFooter } from "~/components/cart/CartSummaryFooter";

type Props = {
  params: Promise<LangParams>;
};

export default async function PaymentPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const cartSummary = await getCartSummaryAction();

  if (!dict) return null;

  return (
    <div className="relative pb-24">
      <div className="mb-4">
        <Link href={"/cart/shipping"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
      </div>

      <div>
        <Tabs defaultValue="card" className="border border-border w-full md:max-w-3xl">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="card" className="flex flex-col items-center gap-1">
              <CreditCard size={20} />
              {dict.cart.payment.card.title}
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex flex-col items-center gap-1">
              <Banknote size={20} />
              {dict.cart.payment.transfer.title}
            </TabsTrigger>
          </TabsList>

          {/* Onglet carte bancaire */}
          <TabsContent value="card">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full">
              <div className="flex flex-col md:p-6 p-4">
                <Heading heading="6">{dict.cart.payment.card.orderSummary}</Heading>
                <div>
                  <div className="flex flex-row w-full justify-between">
                    <div className="text-md text-neutral-500">{dict.cart.payment.summary.subtotalExclVAT}</div>
                    <p className="text-neutral-500">{cartSummary.item.subTotalWithoutVAT+ " €"}</p>
                  </div>
                  <div className="flex flex-row w-full justify-between">
                    <div className="text-md text-neutral-500">{dict.cart.payment.summary.subtotalIncVAT}</div>
                    <p className="text-neutral-500">{cartSummary.item.subTotalWithVAT+ " €"}</p>
                  </div>
                  <div className="flex flex-row w-full justify-between">
                    <div className="text-md text-neutral-500">{dict.cart.payment.summary.shipping}</div>
                    <p className="text-neutral-500">{cartSummary.item.deliveryTTC + " €"}</p>
                  </div>
                  <div className="flex flex-row w-full justify-between">
                    <div className="text-md text-neutral-500">{dict.cart.payment.summary.discount}</div>
                    <p className="text-neutral-500">-{cartSummary.item.discount+ " €"}</p>
                  </div>
                  <div className="flex flex-row w-full justify-between pt-4 mt-4 border-t border-border">
                    <div className="text-md font-bold text-dark">{dict.cart.payment.summary.total}</div>
                    <p className="font-bold text-dark">{cartSummary.item.total+ " €"}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:p-6 p-4 bg-accent">
                <CartPaymentListener />
              </div>
            </div>
            <CartSummaryFooter total={cartSummary.item.total.toFixed(2).toString()+ " €"} step="payment" dict={dict} paymentMethod="CB"/>
          </TabsContent>

          {/* Onglet transfert bancaire */}
          <TabsContent value="transfer">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full">
              <div className="flex flex-col md:p-6 p-4">
                <Heading heading="6">{dict.cart.payment.transfer.orderSummary}</Heading>
                <div>
                  <div className="flex flex-row w-full justify-between">
                    <div className="text-md text-neutral-500">{dict.cart.payment.summary.subtotalExclVAT}</div>
                    <p className="text-neutral-500">{cartSummary.item.subTotalWithoutVAT+ " €"}</p>
                  </div>
                  <div className="flex flex-row w-full justify-between">
                    <div className="text-md text-neutral-500">{dict.cart.payment.summary.subtotalIncVAT}</div>
                    <p className="text-neutral-500">{cartSummary.item.subTotalWithVAT+ " €"}</p>
                  </div>
                  <div className="flex flex-row w-full justify-between">
                    <div className="text-md text-neutral-500">{dict.cart.payment.summary.shipping}</div>
                    <p className="text-neutral-500">{cartSummary.item.deliveryTTC + " €"}</p>
                  </div>
                  <div className="flex flex-row w-full justify-between">
                    <div className="text-md text-neutral-500">{dict.cart.payment.summary.discount}</div>
                    <p className="text-neutral-500">-{cartSummary.item.discount+ " €"}</p>
                  </div>
                  <div className="flex flex-row w-full justify-between pt-4 mt-4 border-t border-border">
                    <div className="text-md font-bold text-dark">{dict.cart.payment.summary.total}</div>
                    <p className="font-bold text-dark">{cartSummary.item.total+ " €"}</p>
                  </div>
                </div>
              </div>
              <form id="virement-form" >
                <div className="flex flex-col gap-4 md:p-6 p-4 bg-accent">
                  <Heading heading="6">{dict.cart.payment.transfer.bankInfo}</Heading>
                  <p className="text-sm text-neutral-500">{dict.cart.payment.transfer.instructions}</p>
                  <div className="flex flex-col w-full gap-4">
                    <div className="flex flex-col">
                      <Label htmlFor="accountHolder">{dict.cart.payment.transfer.fields.accountHolder}</Label>
                      <Input type="text" name="accountHolder" placeholder={dict.cart.payment.transfer.fields.accountHolder} />
                    </div>
                    <div className="flex flex-row gap-4">
                      <div className="flex flex-col w-full">
                        <Label htmlFor="bankCode">{dict.cart.payment.transfer.fields.bankCode}</Label>
                        <Input type="text" name="bankCode" placeholder={dict.cart.payment.transfer.fields.bankCode} />
                      </div>
                      <div className="flex flex-col w-full">
                        <Label htmlFor="branchCode">{dict.cart.payment.transfer.fields.branchCode}</Label>
                        <Input type="text" name="branchCode" placeholder={dict.cart.payment.transfer.fields.branchCode} />
                      </div>
                    </div>
                    <div className="flex flex-row gap-4">
                      <div className="flex flex-col w-full">
                        <Label htmlFor="accountNumber">{dict.cart.payment.transfer.fields.accountNumber}</Label>
                        <Input type="text" name="accountNumber" placeholder={dict.cart.payment.transfer.fields.accountNumber} />
                      </div>
                      <div className="flex flex-col w-full">
                        <Label htmlFor="ribKey">{dict.cart.payment.transfer.fields.ribKey}</Label>
                        <Input type="text" name="ribKey" placeholder={dict.cart.payment.transfer.fields.ribKey} />
                      </div>
                    </div>
                    <div className="flex flex-col w-full">
                      <Label htmlFor="iban">{dict.cart.payment.transfer.fields.iban}</Label>
                      <div className="flex flex-row gap-2">
                        <Input type="text" name="iban" placeholder={dict.cart.payment.transfer.fields.iban} />
                        <Button variant="outline" size="icon">
                          <Copy size={12} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col w-full">
                      <Label htmlFor="bic">{dict.cart.payment.transfer.fields.bic}</Label>
                      <div className="flex flex-row gap-2">
                        <Input type="text" name="bic" placeholder={dict.cart.payment.transfer.fields.bic} />
                        <Button variant="outline" size="icon">
                          <Copy size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <CartSummaryFooter total={cartSummary.item.total.toFixed(2).toString()+ " €"} step="payment" dict={dict} paymentMethod="VB"/>
          </TabsContent>
        </Tabs>
        
      </div>
      
    </div>
  );
}
