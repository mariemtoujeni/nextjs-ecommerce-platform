'use client'

import { Club } from "@repo/core/models";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, Input, Label } from "~/components/ui";

interface InfoCardProps {
  quotationClub?: Club;
  isEditable: boolean;
  onClubChange?: (club: Club) => void; 
}

export const InfoCard: React.FC<InfoCardProps> = ({ 
  quotationClub, 
  isEditable,
  onClubChange 
}: InfoCardProps) => {
  const [siren, setSiren] = useState(quotationClub?.siren ?? "");
  const [tvaNumber, setTvaNumber] = useState(quotationClub?.tvaNumber ?? 0);

  useEffect(() => {
    if (quotationClub) {
      setSiren(quotationClub.siren ?? "");
      setTvaNumber(quotationClub.tvaNumber ?? 0);
    }
  }, [quotationClub]);
  
  const handleSirenChange = (value: string) => {
    setSiren(value);
    if (onClubChange && quotationClub) {
      onClubChange({ 
        ...quotationClub,
        siren: value 
      });
    }
  };

  const handleTvaNumberChange = (value: string) => {
    setTvaNumber(value);
    if (onClubChange && quotationClub) {
      onClubChange({ 
        ...quotationClub,
        tvaNumber: value 
      });
    }
  };


  return (
    <Card>
      <CardHeader className="text-gray-700 font-bold">Informations légales</CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col w-1/2 space-y-2">
            <Label>SIREN / SIRET</Label>
            <Input               
              placeholder="SIREN"
              value={siren}
              onChange={(e) => handleSirenChange(e.target.value)}
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-100" : ""}
            />
          </div>
          <div className="flex flex-col w-1/2 space-y-2">
            <Label>Numéro de TVA</Label>
            <Input               
              placeholder="000000000"
              type="number" min={0}
              value={tvaNumber}
              onChange={(e) => handleTvaNumberChange(e.target.value)}
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-100" : ""}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};