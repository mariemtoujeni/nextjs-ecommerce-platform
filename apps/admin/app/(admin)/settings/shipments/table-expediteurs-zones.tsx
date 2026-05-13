'use client'

import Link from "next/link";
import React, { useState } from "react";
import { ShipmentModeZone } from "@repo/core/models";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "~/components/ui/table";
import { Card, Input } from "~/components/ui";

export interface ExpediteursListProps {
    expediteurs: ShipmentModeZone[];
}

export const ExpediteursList: React.FunctionComponent<ExpediteursListProps> = ({expediteurs}) => {    
    const [filteredExpediteurs, setFilteredExpediteurs] = useState<ShipmentModeZone[]>(expediteurs);
    const [search, setSearch] = useState<string>('');    


    return <div>
        <Card className="mt-8">
            <div className="flex items-center p-2">
                <Input placeholder="Rechercher..." value={search} onChange={(e) => {
                    setSearch(e.target.value);
                    setFilteredExpediteurs(expediteurs.filter(expediteur => expediteur.mode_livraison.toLowerCase().includes(e.target.value.toLowerCase())));
                }} />
            </div>
            <Table>
                <TableHeader  className="bg-neutral-100">
                    <TableRow>
                        <TableHead className="w-1/5">Expediteur</TableHead>
                        <TableHead className="w-4/5">Zone</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredExpediteurs.map((expediteur, index) => {
                        return <TableRow key={index} className="cursor-pointer" onClick={() => {
                            window.location.href = `/settings/shipments/${expediteur.mode_livraison}`;
                        }}>
                            <TableCell className="w-1/5">                          
                                    {expediteur.mode_livraison}                          
                            </TableCell>
                            <TableCell className="w-4/5">{expediteur.zone}</TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </Card>
    </div>
}