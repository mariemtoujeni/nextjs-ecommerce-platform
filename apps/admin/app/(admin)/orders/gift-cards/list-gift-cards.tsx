'use client'

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { archiveGiftCardAction, deleteGiftCardAction, listGiftCardsAction } from "@repo/actions/orders";
import { GiftCardFilterInput, GiftCardPresenter } from "@repo/core/models";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Spinner } from "~/components/Spinner";
import { TableFilter } from "~/components/TableFilter";
import { Badge, Button, Card, CardContent, CardHeader } from "~/components/ui"
import { useToast } from "~/hooks/use-toast";
import { AlertTriangle, Calendar, Eye, Printer, Send, Trash2, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useRouter } from "next/navigation";
import { GiftCardPreviewComponent } from "./preview-gift-card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogFooter } from "~/components/ui/dialog";

export interface ListGiftCardsProps {
    filters: GenericFilter[];
    page: number;
}

const LIMIT = 100;

export const ListGiftCardsView: React.FunctionComponent<ListGiftCardsProps> = ({ filters, page: defaultPage }: ListGiftCardsProps) => {
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const previewRef = useRef<HTMLDivElement>(null);
    const [openPreview, setOpenPreview] = useState(false);
    const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCardPresenter | undefined>(undefined);

    const [giftCards, fetchGiftCards, pending] = useActionState(
        (state: ReturnAll<GiftCardPresenter>, payload: GiftCardFilterInput) => listGiftCardsAction(payload), 
        { total: 0, items: [], count: 0 }
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        startTransition(() => {
            fetchGiftCards({limit: LIMIT, offset: (page - 1), search: search, filters: activeFilters.map(filter => ({
                key: filter.key,
                values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                    ? filter.values 
                    : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
            }))});
        });
    }, [page, activeFilters, search]);

    useEffect(() => {
        if(giftCards && (giftCards.error || !giftCards.items)) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération des chèques cadeaux, erreur : " + (giftCards.error || "Aucun chèque cadeau trouvé"),
                variant: "destructive",
            });
        }
    }, [giftCards]);

    const handleRouterPush = (path: string) => {
        if (mounted && router) {
            router.push(path);
        }
    };

    const handlePreviewGiftCard = (giftCard: GiftCardPresenter) => {
        setSelectedGiftCard(giftCard);
        setOpenPreview(true);
    };

    // Fonction commune pour générer le PDF à partir d'un élément HTML
    const generatePDFFromElement = async (element: HTMLElement, giftCard: GiftCardPresenter) => {
        try {
            // Attendre que les images soient chargées
            const images = element.querySelectorAll('img');
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                })
            );

            // Capturer avec html2canvas
            const canvas = await html2canvas(element, { 
                scale: 1,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Générer le PDF
            const imgData = canvas.toDataURL("image/jpeg", 0.9);
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Cheque-cadeau-${giftCard.code}-${giftCard.id}.pdf`);

            toast({
                title: "Succès",
                description: "PDF généré avec succès",
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la génération du PDF",
                variant: "destructive",
            });
        }
    };

    // Fonction pour générer le PDF avec html2canvas à travers le bouton qui existe dans la prévisualisation du chèque cadeau
    const handleDownload = async () => {
        const el = previewRef.current;
        if (!el) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la récupération la création du PDF",
                variant: "destructive",
            });
            return;
        }
        
        if (!selectedGiftCard) {
            toast({
                title: "Erreur",
                description: "Aucun chèque cadeau sélectionné",
                variant: "destructive",
            });
            return;
        }

        await generatePDFFromElement(el, selectedGiftCard);
    };

    // Fonction pour générer le PDF avec ReactDOM à travers le bouton qui existe directement dans la liste des chèques cadeaux
    const generatePDFWithReactDOM = async (giftCard: GiftCardPresenter) => {
        try {
            // Créer un conteneur temporaire caché
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm';
            tempContainer.style.height = '297mm';
            tempContainer.style.backgroundColor = '#ffffff';
            document.body.appendChild(tempContainer);

            // Créer une ref pour le composant temporaire
            const tempRef = { current: null as HTMLDivElement | null };

            // Créer le composant temporaire
            const TempGiftCardComponent = () => (
                <GiftCardPreviewComponent 
                    ref={tempRef} 
                    giftCard={giftCard} 
                />
            );

            // Rendre le composant avec ReactDOM
            const root = createRoot(tempContainer);
            root.render(<TempGiftCardComponent />);

            // Attendre que le composant soit rendu
            await new Promise(resolve => setTimeout(resolve, 200));

            // Capturer l'élément
            const el = tempContainer.querySelector('div');
            if (!el) {
                throw new Error("Impossible de trouver l'élément à capturer");
            }

            // Utiliser la fonction commune pour générer le PDF
            await generatePDFFromElement(el as HTMLElement, giftCard);

            // Nettoyer
            root.unmount();
            document.body.removeChild(tempContainer);

        } catch (error) {
            console.error('Error generating PDF with ReactDOM:', error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la génération du PDF",
                variant: "destructive",
            });
        }
    };
    
    return (
            <div className="flex flex-col gap-4 mt-8">                                
                <Card>
                    <CardHeader>
                        <TableFilter search={{ show: true, placeholder: "Rechercher un stock", onSearch: (search) => {
                                setPage(1);
                                setSearch(search);
                            } }}

                            items={{total: giftCards.total, count: LIMIT, defaultPage: page}}
                            filters={filters}
                            activeFilters={activeFilters}
                            onFiltersChange={(filters) => {
                                setActiveFilters(filters);
                            }}
                            onPageChange={(page) => setPage(page)}
                        />
                    </CardHeader>
                    <CardContent>
                        {
                            pending ? (
                                <div className="flex justify-center items-center py-8">
                                    <Spinner variant="circle" size={32} />
                                </div>
                            ) : giftCards && giftCards.items && giftCards.items.length > 0 ? (
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader className="bg-neutral-100">
                                            <TableRow>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Commande</TableHead>                                        
                                                <TableHead>Client</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead>Valide jusqu'au</TableHead>
                                                <TableHead>Utilisation</TableHead>
                                                <TableHead>Montant</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {giftCards.items.map((giftCard) => (
                                                <TableRow key={giftCard.id}>
                                                    <TableCell>{giftCard.code}</TableCell>
                                                    <TableCell>
                                                        <span 
                                                            className="text-blue-500 underline underline-offset-8 flex flex-row gap-2 items-center cursor-pointer" 
                                                            onClick={() => {
                                                                handleRouterPush(`/orders/${giftCard.commandId}`);
                                                            }}
                                                        >
                                                            {giftCard.commandId}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span 
                                                            className="text-blue-500 underline underline-offset-8 flex flex-row gap-2 items-center cursor-pointer" 
                                                            onClick={() => {
                                                                handleRouterPush(`/customers/${giftCard.client?.clientNumber}`);
                                                            }}
                                                        >
                                                            {giftCard.client ? `${giftCard.client.firstName} ${giftCard.client.lastName}` : ""}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{
                                                        giftCard.cancelled ? 
                                                            <Badge variant="red">Annulé</Badge> : 
                                                                giftCard.used ? 
                                                                    <Badge variant="green">Utilisé</Badge> :
                                                                        giftCard.expirationDate && new Date(giftCard.expirationDate) < new Date() ?
                                                                        <Badge variant="orange">Expiré</Badge> :
                                                                            <Badge variant="blue">Non utilisé</Badge>
                                                    }
                                                    </TableCell>
                                                    <TableCell>{giftCard.expirationDate ? 
                                                        <div className="flex flex-row items-center gap-3">
                                                            <Calendar className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm text-gray-600 font-medium">
                                                            {new Date(giftCard.expirationDate).toLocaleDateString('fr-FR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        </div> : "Indéfini"}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-3">                                                            
                                                            
                                                            {/* Informations détaillées */}
                                                            {giftCard.used && (
                                                                <div className="space-y-2 pl-4">
                                                                    {giftCard.usedAt && (
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="w-3 h-3 text-gray-400" />
                                                                            <span className="text-sm text-gray-600 font-medium">
                                                                                {new Date(giftCard.usedAt).toLocaleDateString('fr-FR', {
                                                                                    day: '2-digit',
                                                                                    month: '2-digit',
                                                                                    year: 'numeric'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {giftCard.usedBy && (
                                                                        <div className="flex items-center gap-2">
                                                                            <User className="w-3 h-3 text-gray-400" />
                                                                            <span className="text-xs text-gray-600 font-medium">
                                                                                {giftCard.usedBy.firstName} {giftCard.usedBy.lastName}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{giftCard.value}</TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end flex-row gap-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon"
                                                                onClick={() => handlePreviewGiftCard(giftCard)}
                                                            >
                                                                <Eye />
                                                            </Button>
                                                            <Button 
                                                                variant="default" 
                                                                size="icon"
                                                                onClick={() => generatePDFWithReactDOM(giftCard)}
                                                            >
                                                                <Printer />
                                                            </Button>
                                                            {/* <Button variant="outline" size="icon">
                                                                <Send />
                                                            </Button> */}
                                                            <Button variant="destructive" size="icon" onClick={async () => {
                                                                const result = await archiveGiftCardAction({
                                                                    ...giftCard,
                                                                    cancelled: 1
                                                                });
                                                                if(!result.error) {
                                                                    toast({
                                                                        title: "Chèque cadeau archivé",
                                                                        description: "Le chèque cadeau a été archivé avec succès",
                                                                    });
                                                                    // Rafraîchir la liste des chèques cadeaux
                                                                    startTransition(() => {
                                                                        fetchGiftCards({limit: LIMIT, offset: (page - 1), search: search, filters: activeFilters.map(filter => ({
                                                                            key: filter.key,
                                                                            values: Array.isArray(filter.values) && filter.values.every(v => typeof v === 'string') 
                                                                                ? filter.values 
                                                                                : (filter.values as ActiveFilter[]).map(f => ({key: f.key, values: f.values as string[]}))
                                                                        }))});
                                                                    });
                                                                } else {
                                                                    toast({
                                                                        title: "Erreur",
                                                                        description: "Une erreur est survenue lors de la suppression du chèque cadeau, erreur : " + result.error,
                                                                        variant: "destructive",
                                                                    });
                                                                }
                                                            }}>
                                                                <Trash2  />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center py-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertTriangle className="w-10 h-10 text-gray-500" />
                                        <p className="text-sm text-gray-500">Aucun chèque cadeau trouvé</p>
                                    </div>
                                </div>
                            )
                        }                        
                    </CardContent>
                </Card>
                
                {/* Dialog unique pour la prévisualisation */}
                <Dialog open={openPreview} onOpenChange={setOpenPreview}>
                    <DialogContent className="max-w-[95vw] max-h-[90vh] w-auto h-auto">
                        <DialogTitle className="text-lg font-semibold mb-4">
                            Prévisualisation du chèque cadeau
                        </DialogTitle>
                        <GiftCardPreviewComponent 
                            ref={previewRef} 
                            giftCard={selectedGiftCard} 
                        />
                        <DialogFooter className="mt-6">
                            <Button 
                                variant="outline" 
                                onClick={() => setOpenPreview(false)}
                            >
                                Fermer
                            </Button>
                            <Button 
                                onClick={() => {
                                    handleDownload();
                                }}
                                disabled={!selectedGiftCard}
                            >
                                Télécharger PDF
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
    )
}