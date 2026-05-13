'use client';

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { ModalContent } from "./modal-create";
import { Heading } from "~/components/ui/heading";
import { Tab } from "./tabConfig";
import { ItemType } from "./list-component";

const HEADING_TITLES: Record<Tab, string> = {
  Magasins: "Gestion des magasins",
  Catégories: "Gestion des catégories",
  "Sous-Catégories": "Gestion des sous-catégories",
};

const BUTTON_LABELS: Record<Tab, string> = {
  Magasins: "Nouveau magasin",
  Catégories: "Nouveau catégorie",
  "Sous-Catégories": "Nouveau sous-catégorie",
};

interface HeadingCompProps {
  activeTab: Tab;
  onAdd: (newItem: Omit<ItemType, 'id'>) => void;
}

export const HeadingComp: React.FC<HeadingCompProps> = ({ activeTab, onAdd }: HeadingCompProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
      <Heading key="page-title" heading="2">
        {HEADING_TITLES[activeTab]}
      </Heading>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="flex items-center justify-center px-4 py-2 bg-black text-white rounded-md gap-2 w-full sm:w-auto" >
          <Plus /> {BUTTON_LABELS[activeTab]}
        </DialogTrigger>
        <ModalContent
          activeTab={activeTab}
          onClose={() => setOpen(false)}
          onAdd={onAdd}
        />
      </Dialog>
    </div>
  );
};
