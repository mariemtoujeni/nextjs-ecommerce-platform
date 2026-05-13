"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Label, Popover, PopoverContent, PopoverTrigger, RadioGroup, RadioGroupItem } from "~/components/ui";
import { CheckCircleIcon, ChevronsUpDown } from "lucide-react";
import { getClubsAction } from "@repo/actions/clients";
import { updateDiscountAction } from "@repo/actions/discounts";
import { Club, Discount, ReductionType } from "@repo/core/models";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "~/components/ui/command";

interface Props {
  discount: Discount;
}

type DiscountRadioType = "all" | ReductionType.CLUB | ReductionType.ADHERENT_CLUB;

export const ClientTypeCard: React.FC<Props> = ({ discount }: Props) => {
  const router = useRouter();

  const mapDiscountTypeToRadio = (type: ReductionType): DiscountRadioType => {
    if (type === ReductionType.CLUB || type === ReductionType.ADHERENT_CLUB) return type;
    return "all";
  };

  const [type, setType] = useState<DiscountRadioType>(mapDiscountTypeToRadio(discount.type));
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [openClubPopover, setOpenClubPopover] = useState(false);

  const filteredClubs = useMemo(() => {
    if (!search.trim()) return clubs;
    const lowerSearch = search.toLowerCase();
    return clubs.filter((c) => c.name.toLowerCase().includes(lowerSearch));
  }, [clubs, search]);

  const handleTypeChange = async (val: DiscountRadioType) => {
    setType(val);
    if (val !== ReductionType.ADHERENT_CLUB) {
      setSelectedClub(null);
    }

    if (val === ReductionType.ADHERENT_CLUB && clubs.length === 0) {
      setLoadingClubs(true);
      try {
        const response = await getClubsAction();
        setClubs(response.items);
      } catch (err) {
        console.error("Failed to fetch clubs", err);
        setClubs([]);
      } finally {
        setLoadingClubs(false);
      }
    }

    await updateDiscountAction({
      id_club: val === ReductionType.ADHERENT_CLUB ? selectedClub?.id : undefined,
      id: discount.id,
      //type: val === "all" ? discount.type : val
    });
    router.refresh();
  };

  const handleClubSelect = async (club: Club) => {
    setSelectedClub(club);
    setOpenClubPopover(false);

    await updateDiscountAction({
      id_club: club.id,
      id: discount.id,
      //type: type === "all" ? discount.type : type
    });
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon size={20} className="text-blue-600 shrink-0" />
            <span className="text-lg font-bold text-gray-700">Admissibilité du client</span>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <RadioGroup
          value={type}
          onValueChange={handleTypeChange}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all_clients" />
            <Label htmlFor="all_clients" className="text-sm">
              Tous les clients
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={ReductionType.ADHERENT_CLUB} id="adherent_club" />
            <Label htmlFor="adherent_club" className="text-sm">
              Club (club + adhérent)
            </Label>
          </div>
        </RadioGroup>

        {type === ReductionType.ADHERENT_CLUB && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="client-name" className="text-sm text-gray-700">
              Club
            </Label>
            <Popover open={openClubPopover} onOpenChange={setOpenClubPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openClubPopover}
                  className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500"
                  disabled={loadingClubs}
                >
                  {selectedClub ? selectedClub.name : "Sélectionner un club..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0 max-h-[200px] overflow-y-auto">
                {loadingClubs ? (
                  <div className="p-4 text-center">Chargement des clubs...</div>
                ) : (
                  <Command>
                    <CommandInput
                      placeholder="Rechercher un club..."
                      className="h-9"
                      onValueChange={setSearch}
                    />
                    <CommandEmpty>Aucun club trouvé</CommandEmpty>
                    <CommandGroup>
                      {filteredClubs.map((club) => (
                        <CommandItem
                          key={club.id}
                          onSelect={() => handleClubSelect(club)}
                        >
                          {club.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
