"use client";
import { ModelUpdate, ModelWithProduct, ProductAttribute } from "@repo/core/models";
import { useEffect, useState } from "react";
import { Badge, Input } from "~/components/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { updateModelAction } from "@repo/actions/products";
import { useToast } from "~/hooks/use-toast";
import { useDeferredEffect } from "~/hooks/use-deffered-effect";

type RecursiveAttributesProps = {
    attributes: ProductAttribute[];
    currentIndex: number;
    modeles: ModelWithProduct[];
}

const Row = ({ model, currentAttributeId }: { model: ModelWithProduct, currentAttributeId: number }) => {
    const { toast } = useToast();
    const [modelUpdate, setModelUpdate] = useState<ModelUpdate>({...model});

    useDeferredEffect(() => {
        updateModelAction(model.id, modelUpdate)
        .then((success) => {
            if (success) {
                toast({
                    title: "Modèle mis à jour",
                    description: "Le modèle a été mis à jour avec succès",
                    variant: "default",
                });
            } else {
                toast({
                    title: "Erreur",
                    description: "Une erreur est survenue lors de la mise à jour du modèle",
                    variant: "destructive",
                });
            }
        })
    }, [modelUpdate]);

    return (
        <Table key={model.id}>
            <TableBody>
                <TableRow>
                    <TableCell className="w-2/12">
                        <Badge variant="blue" className="text-xs">
                        {model.attributValues?.filter(av => av.attributValue.id_attribut === currentAttributeId).map(av => av.attributValue.nom).join(', ')}
                        </Badge>
                        <span className="text-xs text-gray-500">&nbsp;{model.id}</span></TableCell>
                    <TableCell className="w-1/12">
                        <Input type="number" className="w-full" defaultValue={model.priceWithoutVat} onBlur={(e) => setModelUpdate({...modelUpdate, priceWithoutVat: parseFloat(e.target.value)})} />
                    </TableCell>
                    <TableCell className="w-1/12">
                        <Input type="number" className="w-full" defaultValue={model.purchasePrice} onBlur={(e) => setModelUpdate({...modelUpdate, purchasePrice: parseInt(e.target.value)})} />
                    </TableCell>
                    <TableCell className="w-1/12">
                        <Input type="number" className="w-full" defaultValue={model.minStock} onBlur={(e) => setModelUpdate({...modelUpdate, minStock: parseInt(e.target.value)})} />
                    </TableCell>
                    <TableCell className="w-2/12">
                        <Input type="text" className="w-full" defaultValue={model.supplierReference} onBlur={(e) => setModelUpdate({...modelUpdate, supplierReference: e.target.value})} />
                    </TableCell>
                    <TableCell className="w-2/12">
                        <Input type="text" className="w-full" defaultValue={model.manufacturerReference} onBlur={(e) => setModelUpdate({...modelUpdate, manufacturerReference: e.target.value})} />
                    </TableCell>
                    <TableCell className="w-2/12">
                        <Input type="text" className="w-full" defaultValue={model.barcode} onBlur={(e) => setModelUpdate({...modelUpdate, barcode: e.target.value})} />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}

export const RecursiveAttributes = ({ attributes, currentIndex, modeles }: RecursiveAttributesProps) => {
    const currentAttribute = attributes[currentIndex];
    const isLastAttribute = currentIndex === attributes.length - 1;

    if (!currentAttribute) return null;

    return (
        <div className="w-full">
            {currentAttribute.values.map((value) => {
                const filteredModeles = modeles.filter(model => 
                    model.attributValues?.some(av => av.idAttributValue === value.id)
                );

                return (
                    isLastAttribute ?
                        <div className="space-y-2" key={value.id}>
                        {filteredModeles.map(model => (
                            <Row key={model.id} model={model} currentAttributeId={currentAttribute.id} />
                        ))}
                    </div> :
                    <Accordion key={value.id}  type="single" collapsible >
                        <AccordionItem value={value.id.toString()}>
                            <AccordionTrigger className="px-4">
                                <Badge variant="blue" className="text-sm">{value.name}</Badge>
                            </AccordionTrigger>
                            <AccordionContent className="px-4">
                                
                                <RecursiveAttributes 
                                    attributes={attributes}
                                    currentIndex={currentIndex + 1}
                                    modeles={filteredModeles}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );
            })}
        </div>
    );
}