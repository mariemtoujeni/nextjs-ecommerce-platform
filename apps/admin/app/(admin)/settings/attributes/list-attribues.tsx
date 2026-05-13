'use client'

import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { useState, useEffect } from "react";
import { Card, Heading, Input } from "~/components/ui";
import { useToast } from "~/hooks/use-toast";
import { Attribut } from "@repo/core/models";
import { DialogTrigger } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog";
import { ModalCreateAttributeContent } from "./modal-create-attribute";
import { Plus } from "lucide-react";
import { getAttributesAction } from "@repo/actions/attributes";
import { serializeEditorStateToHtml } from "~/components/editor/utils/lexical-html-serializer";
import React from "react";

// Fonction pour extraire le texte d'un objet Lexical
const extractTextFromLexical = (lexicalData: any): string => {
    if (!lexicalData?.root?.children) {
        return '';
    }

    const extractTextFromNode = (node: any): string => {
        if (node.type === 'text') {
            return node.text || '';
        }
        
        if (node.children && Array.isArray(node.children)) {
            return node.children.map(extractTextFromNode).join('');
        }
        
        return '';
    };

    return lexicalData.root.children.map(extractTextFromNode).join('');
};

// Fonction pour élider le texte après 250 mots
const truncateText = (text: string, maxWords: number = 35): string => {
    if (!text) return '';
    
    const words = text.split(/\s+/);
    if (words.length <= maxWords) {
        return text;
    }
    
    return words.slice(0, maxWords).join(' ') + '...';
};

export interface AttributeProps {
    attributes: Attribut[];
}

export const ListAttributes: React.FunctionComponent<AttributeProps> = ({attributes}) => {
    const [search, setSearch] = useState("");
    const { toast } = useToast();
    const [attributList, setAttributList] = useState<Attribut[]>(attributes);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setAttributList(attributes.filter((attribut) => attribut.nom.toLowerCase().includes(search.toLowerCase())));
    }, [search]);

    return <>
        <div className="flex flex-row justify-between w-100">
            <Heading key='page-title' heading={"2"}>Gestion des attributs</Heading>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger className="flex flex-row items-center px-4 py-1 bg-black text-white rounded-md gap-2">                    
                    <Plus /> Créer un attribut
                </DialogTrigger>       
                <ModalCreateAttributeContent onClose={async() => {
                    setIsOpen(false);
                    setSearch('');
                    const attributes = await getAttributesAction();
                    setAttributList(attributes);
                }} />
            </Dialog>             
        </div>
        <Card className="my-8">
            <div className="flex items-center p-2">
                <Input placeholder="Rechercher..." value={search} onChange={(e) => {                
                    setSearch(e.target.value);                    
                }} />
            </div>
            <Table>
                <TableHeader  className="bg-neutral-100">
                    <TableRow>
                        <TableHead className="text-base w-1/5">Titre</TableHead>
                        <TableHead className="text-base w-3/5">Légende</TableHead>
                        <TableHead className="text-base w-1/5">Ajouté par</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attributList.map((attribut) => {

                        // Check if attribut.legende is JSON format (Lexical editor state)
                        const isJson = typeof attribut.legende === 'string' && attribut.legende.startsWith('{') && attribut.legende.endsWith('}');
                        let legendeContent: string | React.ReactElement = attribut.legende;
                        
                        if(isJson) {
                            try {
                                const jsonData = JSON.parse(attribut.legende);
                                // Check if it's a valid Lexical editor state structure
                                if (jsonData.root && jsonData.root.children) {
                                    const textContent = extractTextFromLexical(jsonData);
                                    const truncatedText = truncateText(textContent);
                                    
                                    // Si le texte est tronqué, afficher seulement le texte tronqué
                                    if (truncatedText !== textContent) {
                                        legendeContent = truncatedText;
                                    } else {
                                        // Sinon, afficher le HTML complet
                                        const htmlContent = serializeEditorStateToHtml(jsonData);
                                        legendeContent = <div dangerouslySetInnerHTML={{ __html: htmlContent }} title={textContent} />;
                                    }
                                } else {
                                    // Fallback to text extraction if not a valid Lexical structure
                                    const textContent = extractTextFromLexical(jsonData);
                                    legendeContent = truncateText(textContent);
                                }
                            } catch (error) {
                                console.error('Erreur lors du parsing JSON:', error);
                                legendeContent = truncateText(attribut.legende);
                            }
                        } else {
                            // Pour le texte simple, appliquer l'élision
                            legendeContent = truncateText(attribut.legende);
                        }

                        return <TableRow key={attribut.id} className="cursor-pointer" onClick={() => {
                            window.location.href = `/settings/attributes/${attribut.id}`;
                        }}>
                            <TableCell className="text-base font-normal text-black px-2 py-3 text-sm/7 w-1/5">{attribut.nom}</TableCell>
                            <TableCell className="text-base font-normal text-black px-2 py-3 text-sm/7 w-3/5 max-w-0 break-words overflow-hidden">{legendeContent}</TableCell>
                            <TableCell className="text-base font-normal text-black px-2 py-3 text-sm/7 w-1/5">{'admin'}</TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </Card>
    </>
}