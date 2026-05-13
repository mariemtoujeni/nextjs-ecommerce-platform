"use client";
import { useState, useEffect, useActionState, startTransition } from "react";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogClose } from "~/components/ui/dialog";
import { Button, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, Input, Label, Popover, PopoverContent, PopoverTrigger, Switch } from "~/components/ui";
import { TAB_CONFIG, Tab } from "./tabConfig";
import { getCategoryAction, updateCategoryAction, deleteCategoryAction } from "@repo/actions/categories";
import { getSubCategoryAction, updateSubCategoryAction, deleteSubCategoryAction } from "@repo/actions/subcategories";
import { getStoreAction, updateStoreAction, deleteStoreAction } from "@repo/actions/stores";
import { ItemType } from "./list-component";
import { Club, Store } from "@repo/core/models";
import { getClubsAction } from "@repo/actions/clients";
import { ReturnAll } from "@repo/core/types";
import { ChevronsUpDown } from "lucide-react";
import { toast } from "~/hooks/use-toast";

type Props = {
  id: number;
  activeTab: Tab;
  onUpdate: (item: ItemType) => void;
  onDelete: (item: ItemType) => void;
  onClose: () => void;
};

function isStore(item: ItemType): item is Store {
  return (item as Store).clubId !== undefined;
}

export function CategoryDetail({ id, activeTab, onUpdate, onDelete, onClose }: Props) {
  const cfg = TAB_CONFIG[activeTab];
  const [item, setItem] = useState<ItemType | null>(null);
  const [name, setName] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [active, setActive] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedClub, setSelectedClub] = useState<{ id: number; name: string } | null>(null);
  const [openClubPopover, setOpenClubPopover] = useState(false);
  const [search, setSearch] = useState("");

  const [clubs, fetchClubs] = useActionState(
    (state: ReturnAll<Club>) => getClubsAction(),
    { total: 0, items: [], count: 0 }
  );

  useEffect(() => {
    startTransition(() => {
      fetchClubs();
    });
  }, []);

  const filteredClubs = clubs.items.filter(club =>
    club.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleClubSelect = async (club: Club, item: Store) => {
    setSelectedClub({ id: club.id, name: club.name });
    setOpenClubPopover(false);

    try {
      await updateStoreAction({
        id: item.id,
        name: item.name,
        active: item.active,
        order: item.order,
        clubId: club.id
      })
      toast({ title: "Succès", description: "Le club associé a été mis à jour" });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de magasin");
      toast({ title: "Erreur", description: "Erreur lors de la mis à jour de club associé" });
    }
    
  };

  useEffect(() => {
    (async () => {
      let data;
      if (activeTab === "Magasins") {
        data = await getStoreAction(id);
      } else if (activeTab === "Catégories") {
        data = await getCategoryAction(id);
      } else {
        data = await getSubCategoryAction(id);
      }

      if (data) {
        setItem(data);
        setName(data.name);
        setOrder(data.order);
        setActive(Boolean(data.active));

        if (activeTab === "Magasins" && isStore(data) && data.clubId) {
          setSelectedClub({ id: data.clubId, name: data.club?.name ?? "" });
        }
      }

      const img = new Image();
      img.src = cfg.imageUrl;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    })();
  }, [id, activeTab, cfg.imageUrl]);

  const handleSave = async () => {
    let updated;
    if (activeTab === "Magasins") {
      updated = await updateStoreAction({
        id,
        name,
        order,
        active: active ? 1 : 0,
        clubId: selectedClub?.id
      });
    } else if (activeTab === "Catégories") {
      updated = await updateCategoryAction({ id, name, order, active: active ? 1 : 0 });
    } else {
      updated = await updateSubCategoryAction({ id, name, order, active: active ? 1 : 0 });
    }
    onUpdate(updated);
    onClose();
  };

  const handleDelete = async () => {
    if (activeTab === "Magasins") {
      await deleteStoreAction(id);
    } else if (activeTab === "Catégories") {
      await deleteCategoryAction(id);
    } else {
      await deleteSubCategoryAction(id);
    }
    if (item) onDelete(item);
    onClose();
  };

  if (!item || !imageLoaded) return null;

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogTitle>{cfg.titleEdit}</DialogTitle>
        <img src={cfg.imageUrl} alt={cfg.titleEdit} className="mb-2" />

        <div className="flex flex-col gap-1">
          <Label>Nom</Label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>

        {activeTab === "Magasins" && isStore(item) && clubs.items.length > 0 && (
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
                        <CommandItem key={club.id} onSelect={() => handleClubSelect(club, item)}>
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

        <div className="flex flex-col gap-1 mt-2">
          <Label>Ordre</Label>
          <Input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} />
        </div>

        <div className="flex items-center gap-4 mt-2">
          <Label>Actif</Label>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>

        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!name.trim()}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
