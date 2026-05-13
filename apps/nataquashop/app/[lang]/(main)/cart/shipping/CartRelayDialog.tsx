import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { SelectButton } from "./(components)/SelectRelayPoint";


interface CartRelayDialogProps {
  dict: any;
}

export const CartRelayDialog: React.FC<CartRelayDialogProps> = ({ dict }: CartRelayDialogProps) => {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto text-neutral-500 underline">
          {dict.cart.shipping.relayPoint.select}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[80%] md:w-[95%] max-w-5xl p-0 overflow-visible">
          {/* Header */}
          <DialogTitle>
            <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-8">
              <Heading heading="5">{dict.cart.shipping.relayPointSelect.title}</Heading>
            </div>
          </DialogTitle>
          {/* Zone de recherche */}
          <div className="px-4 md:px-8">
            <div className="bg-muted w-full h-[495px]">
              <iframe
                src="/cart/shipping/iframe-mondialrelay"
                className="w-full h-full border-0"
                title="Sélection Point Relais"
              />
            </div>
          </div>
          {/* Footer avec boutons */}
          <div className="flex justify-end gap-4 px-4 pt-0 pb-4 md:px-8 md:pt-0 md:pb-8">
            <DialogClose asChild>
              <Button variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <SelectButton dict={dict}/>
          </div>
        </DialogContent>
    </Dialog>
  );
};