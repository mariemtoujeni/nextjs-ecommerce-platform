"use client";

import { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Button, Input, Label, Switch, Popover, PopoverTrigger, PopoverContent, Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "~/components/ui";
import { Tab, TAB_CONFIG } from "./tabConfig";
import { ItemType } from "./list-component";
import { Club } from "@repo/core/models";
import { getClubsAction } from "@repo/actions/clients";
import { useActionState, startTransition } from "react";
import { ChevronsUpDown } from "lucide-react";

type Props = {
  activeTab: Tab;
  onAdd: (item: Omit<ItemType, 'id'> & { clubId?: number }) => void;
  onClose: () => void;
};

export function ModalContent({ activeTab, onAdd, onClose }: Props) {
  const cfg = TAB_CONFIG[activeTab];
  const [name, setName] = useState("");
  const [order, setOrder] = useState("0");
  const [active, setActive] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Club association state
  const [clubs, fetchClubs] = useActionState(
    (state: { items: Club[] }) => getClubsAction(),
    { total: 0, items: [], count: 0 }
  );
  const [selectedClub, setSelectedClub] = useState<{ id: number; name: string } | null>(null);
  const [openClubPopover, setOpenClubPopover] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    startTransition(() => fetchClubs());
  }, []);

  const filteredClubs = clubs.items.filter(club =>
    club.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleClubSelect = (club: Club) => {
    setSelectedClub({ id: club.id, name: club.name });
    setOpenClubPopover(false);
  };

  useEffect(() => {
    const img = new Image();
    img.src = cfg.imageUrl;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true);
  }, [cfg.imageUrl]);

  const handleSubmit = async () => {
    const payload: Omit<ItemType, 'id'> & { clubId?: number } = {
      name,
      active: active ? 1 : 0,
      order: Number(order),
      ...(activeTab === "Magasins" && selectedClub ? { clubId: selectedClub.id } : {}),
    };
    onAdd(payload);
    onClose();
  };

  if (!imageLoaded) return null;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{cfg.titleAdd}</DialogTitle>
      </DialogHeader>

      <img src={cfg.imageUrl} alt={cfg.titleAdd} className="mb-2" />

      <Label>Nom</Label>
      <Input value={name} onChange={(e) => setName(e.target.value)} />

      {activeTab === "Magasins" && clubs.items.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <Label htmlFor="club" className="text-sm text-gray-700">Club</Label>
          <Popover open={openClubPopover} onOpenChange={setOpenClubPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openClubPopover}
                className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200"
              >
                {selectedClub?.name || "Sélectionner un club..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command className="overflow-hidden">
                <CommandInput
                  placeholder="Rechercher un club..."
                  className="h-9"
                  onValueChange={setSearch}
                />
                <CommandEmpty>Aucun club trouvé</CommandEmpty>
                <CommandGroup>
                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredClubs.map(club => (
                      <CommandItem key={club.id} onSelect={() => handleClubSelect(club)}>
                        {club.name}
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div>
        <Label>Ordre</Label>
        <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
      </div>

      <div className="flex items-center gap-4 mt-2">
        <Label className="text-base">Actif</Label>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          Ajouter
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
