"use client";
import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui";
import { ScanBarcode } from "lucide-react";
import { cn } from "~/lib/utils";

export type BarcodeReaderProps = {
    onBarcode?: (barcode: string) => void;
    tooltip?: boolean;
    icon?: boolean;
    className?: string;

}

export const BarcodeReader = ({onBarcode, tooltip, icon, className}: BarcodeReaderProps) => {
    const recordInput = useRef(false);
    const value = useRef('');
    const [open, setOpen] = useState(false);
    const hideRef = useRef<NodeJS.Timeout | null>(null);

    const listenKeyboard = (e: KeyboardEvent) => {
        if(!recordInput.current && "Shift" === e.key) {
            recordInput.current = true;
            value.current = '';
            return;
        } else if(recordInput.current && "Enter" === e.key) {
            recordInput.current = false;
            onBarcode?.(value.current);
            if(tooltip) {
                setOpen(true);
                    hideRef.current = setTimeout(() => {
                        setOpen(false);
                }, 2000);
            }
        } else {
            value.current += e.key;
        }
    }
    useEffect(() => { 
        document.addEventListener("keydown", listenKeyboard);
        return () => {
            document.removeEventListener("keydown", listenKeyboard);
        }
    }, []);

    return <div>
        <TooltipProvider>
            <Tooltip open={open}>
                <TooltipTrigger asChild>
                    { icon ? <ScanBarcode className={cn("text-gray-500 size-5", className)} /> : <span></span>}
                </TooltipTrigger>
                <TooltipContent>
                    {value.current}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

    </div>
};