"use client";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui";
import { usePathname, useRouter } from "next/navigation";

export function SelectPage({ p, nbPages }: { p: string, nbPages: number }) {
    const router = useRouter();
    const pathname = usePathname();
    return (
        <Select onValueChange={(value) => {
            
            router.push(`${pathname}?p=${value}`);
        }}>
            <SelectTrigger className="w-[40px]" >
                <SelectValue placeholder={p ? p : "1"} defaultValue={p ? p : "1"} />
            </SelectTrigger>
            <SelectContent>
                {Array.from({ length: nbPages }, (_, i) => (
                    <SelectItem key={i} value={(i + 1).toString()} >
                        {i + 1}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}