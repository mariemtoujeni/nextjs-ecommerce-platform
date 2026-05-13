'use client';

import { ChevronsUpDown } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, Heading, Button, Input } from "~/components/ui";
import { useState, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Client, Quotation } from "@repo/core/models";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "~/components/ui/command";
import { ReturnAll } from "@repo/core/types";

interface ClientCardProps {
  quotation: Quotation;
  isEditable: boolean;
  onQuotationChange: (quotation: Quotation) => void;
  clients: ReturnAll<Client> | null;
  onSearchClient: (searchTerm: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ quotation, onQuotationChange, isEditable, clients, onSearchClient }: ClientCardProps) => {
  const [openClientPopover, setOpenClientPopover] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [displayedClientName, setDisplayedClientName] = useState(quotation?.club?.name || "Sélectionner un client");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (value.length > 0) {
        onSearchClient(value);
      }
    }, 300); 
  };

  const handleSelectClient = (client: Client) => {
    setSearchTerm(""); 
    setOpenClientPopover(false); 
    setDisplayedClientName(client.club?.name || "Sélectionner un client");
    onQuotationChange({
      ...quotation,
      clientNumber: client.clientNumber,
      clubId: client.club?.id ?? 0,
    });
  };


  return (
    <Card className="mt-8">
      <CardHeader className="text-gray-700 font-bold">
        <CardTitle>
          <Heading heading="3" className="text-gray-700 font-bold">
            Client
          </Heading>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-7 w-full">
          <div className="flex flex-col gap-2">
          { isEditable ?
          <Popover open={openClientPopover} onOpenChange={setOpenClientPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openClientPopover}
                className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500"
              >
                {displayedClientName || "Sélectionner un client"}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 max-h-[200px] overflow-y-auto">
              <Command>
                <CommandInput
                  placeholder="Rechercher un client..."
                  className="h-9"
                  value={searchTerm}
                  onValueChange={handleSearchChange}
                />
                <CommandEmpty>Aucun client trouvé</CommandEmpty>
                <CommandGroup>
                  {(clients?.items ?? []).map((client) => (
                  <CommandItem
                    key={client.clientNumber}
                    value={client.club?.name}
                    onSelect={() => handleSelectClient(client)}
                  >
                    {client.club?.name}
                  </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
            : <Input type="text" disabled={true} value={quotation?.club?.name ?? ''}/>
          }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};