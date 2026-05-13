'use client'

import { Button, Heading, Popover, PopoverContent, PopoverTrigger, Calendar, Label } from "~/components/ui"
import React, { useState } from "react";
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { exportCheckoutsFile } from "@repo/actions/accounting";
import { useToast } from "~/hooks/use-toast";

export const HeaderComponent: React.FunctionComponent = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const { toast } = useToast();

    return (
        <div className="flex flex-row justify-between w-100">
            <Heading key='page-title' heading={"2"} className="text-gray-700">Caisses</Heading>     
            <div className="flex flex-row gap-3 items-center h-[26px]">
                <Button className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2" onClick={() => {
                    router.push("/orders/checkout/new");
                }}>
                    <Plus /> Nouveau ticket
                </Button>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2">
                            Exporter document comptable
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-100 p-3 flex flex-col gap-2">
                        <div className="flex flex-row gap-2">
                            <div className="flex flex-row gap-1 items-center">
                                <Label className="text-sm">Date de début:</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline">
                                            <CalendarIcon />
                                            {startDate ? format(startDate, "dd/MM/yyyy") : "Date de début"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex flex-row gap-1 items-center">
                                <Label className="text-sm">Date de fin:</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline">
                                            <CalendarIcon />
                                            {endDate ? format(endDate, "dd/MM/yyyy") : "Date de fin"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 justify-end mt-5">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Annuler
                            </Button>
                            <Button disabled={!startDate || !endDate} variant="default" onClick={async () => {
                                setOpen(false);
                                if (startDate && endDate) {
                                    const result = await exportCheckoutsFile(format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd"));
                                    if(result.success) {
                                        if (result.url) {
                                            // Use direct navigation for reliability across environments
                                            window.location.assign(result.url);
                                        }
                                    } else {
                                        toast({
                                            title: "Erreur lors de l'exportation",
                                            description: result.error as string,
                                            variant: "destructive"
                                        })
                                    }
                                }
                            }}>
                                Exporter
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}