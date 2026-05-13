'use client'

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ShopPresenterWithModels } from "@repo/actions/orders";
import { useToast } from "~/hooks/use-toast";
import { ReturnOne } from "@repo/core/types";
import { useEffect, useRef, useState } from "react";
import { ShopLineWithModel } from "@repo/core/models";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { useRouter } from "next/navigation";
import { Card } from "~/components/ui";
import { ArrowLeft } from "lucide-react";

interface RestockingPreviewProps {
    shop: ReturnOne<ShopPresenterWithModels>;
}

export default function RestockingPreview({ shop }: RestockingPreviewProps) {
    const { toast } = useToast();   
    const ref = useRef<HTMLDivElement>(null);    
    const [shopLinesMap, setShopLinesMap] = useState<Map<string, ShopLineWithModel[]>>(new Map());
    const router = useRouter();

    useEffect(() => {
        if(shop.error) {
            toast({
                title: "Erreur",
                description: shop.error,
                variant: "destructive",
            });
        } else {
            const newMap = new Map<string, ShopLineWithModel[]>();
            
            shop.item.lines?.forEach((line, index) => {
                const key = line.model.storeNames?.join(" / ") ?? `${index}`;
                // If the key already exists, push to the array, otherwise create a new array
                if (!newMap.has(key)) {
                    newMap.set(key, [line]);
                } else {
                    const currentLine = newMap.get(key);
                    newMap.set(key, [
                        ...(currentLine ?? []),
                        line,
                    ]);
                }
            });
            
            setShopLinesMap(newMap);
        }
    }, [shop]);

    const handleDownload = async () => {
        const el = ref.current;
        if (!el) return;
        const canvas = await html2canvas(el, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("Reassort.pdf");
    };

    if(shop && (shop.error || !shop.item)) {
        toast({
            title: "Erreur",
            description:  "Une erreur est survenue lors de la récupération du point de vente, erreur : " + (shop.error || "Aucun point de vente trouvé"),
            variant: "destructive",
        });
    }
    
    return <div className="bg-[#f5f5f5] min-h-screen py-10 px-6">
        <div className="flex flex-row gap-3 items-center h-[26px]"> 
            <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                    router.push(`/orders/sales-points/${shop.item.id}`);
            }}>                        
                <ArrowLeft style={{ width: '16px', height: '16px' }}/>
            </Card>
        </div>
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => {
                    handleDownload();
                    router.push(`/orders/sales-points/${shop.item.id}`);
                }}
                className="bg-black text-white px-4 py-2 rounded mb-6"
            >
                Télécharger
            </button>
        </div>
        <div
            ref={ref}
            className="bg-white max-w-4xl mx-auto p-10 text-[12px] text-black"
        >
            <div className="mb-6">
                <h1 className="font-bold text-2xl">#{shop.item.id} - {shop.item.name} - {new Date(shop.item.createdAt).toLocaleDateString()}</h1>
            </div>
            <div className="mb-4 space-y-3">
                {[...shopLinesMap.entries()].map(([key, lines]) => (
                    <div key={key}>
                        {lines.filter((line) => line.soldQuantity > 0).length > 0 && (
                            <>
                            <h2 className="font-bold text-lg">{key}</h2>                            
                            <Table className="border border-black w-full mt-8">
                                <TableBody>
                                    {lines.map((line) => (
                                        line.soldQuantity > 0 && (      
                                            <TableRow key={line.idModel} className="border-b border-black">
                                                <TableCell className="border-r border-black w-16 text-center">{line.soldQuantity}</TableCell>
                                                <TableCell className="border-r border-black flex-1">{line.model?.name ?? "Nom du modèle inconnu"}</TableCell>
                                                <TableCell className="border-r border-black w-32 text-center">{line.model?.codeBar ?? "Code barre inconnu"}</TableCell>
                                            </TableRow>
                                        )
                                    ))}
                                </TableBody>
                            </Table>
                            </>
                        )}
                        
                    </div>
                ))}
            </div>
        </div>
    </div>;
}