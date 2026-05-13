'use client'

import { Settings } from "@repo/core/models";
import { useState } from "react";
import { updateConfsAction } from "@repo/actions/general-settings"
import { Card, CardHeader, CardTitle, CardContent, Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui"

interface CardComponentProps {
    title: string;
    index: number;
    settings: Settings;
}

export const CardCompnent: React.FunctionComponent<CardComponentProps> = ({ title, index, settings }) => {
    const [cardContent, setCardContent] = useState({                
        ...settings
    });

    const updateConfsActionInServer = async (data: Settings) => {
        // we need to update the configuration settings when the input and select value changes
        await updateConfsAction(data);
    }

    const handleChange = async (e : React.ChangeEvent<HTMLInputElement>) => {
        // we need to update the state of the card content when the input and select value changes
        setCardContent({
            ...cardContent,
            [e.target.name]: parseInt(e.target.value)
        });

        // we need to update the configuration settings when the input and select value changes
        await updateConfsActionInServer({
            ...cardContent,
            [e.target.name]: parseInt(e.target.value)
        });
    }
      
    return (
        <Card key={index}>
            <CardHeader><CardTitle key='conf-avoirs' className="font-bold">{title}</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-5">
                    <div className="col-span-2">                            
                        <Label className="text-gray-500">Durée</Label>
                        <Input 
                            name={
                                title === "Configuration avoirs" ? 
                                    'duree_validite_avoir' :
                                title === "Configuration chèques cadeaux" ?
                                    'duree_validite_cheque_cadeau' :
                                title === "Configuration cashback" ?
                                    'duree_validite_cashback' :
                                title === "Configuration emails de relance" ?
                                    'duree_validite_email_relance' : ''
                            } 
                            type="text" 
                            className="w-full bg-gray-100" 
                            placeholder="Durée" 
                            value={
                                title === "Configuration avoirs" ? 
                                    cardContent.duree_validite_avoir :
                                title === "Configuration chèques cadeaux" ?
                                    cardContent.duree_validite_cheque_cadeau :
                                title === "Configuration cashback" ?
                                    cardContent.duree_validite_cashback :
                                title === "Configuration emails de relance" ?
                                    cardContent.duree_validite_email_relance : ''
                            } 
                            onChange={handleChange}
                        />                            
                    </div>
                    <div>
                        <div className="col-span-2">
                            <Label className="text-gray-500">Échelle de temps</Label>
                            <Select 
                                name={
                                    title === "Configuration avoirs" ? 
                                        'type_duree_validitee_avoir' :
                                    title === "Configuration chèques cadeaux" ?
                                        'type_duree_validite_cheque_cadeau' :
                                    title === "Configuration cashback" ?
                                        'type_duree_validite_cashback' :
                                    title === "Configuration emails de relance" ?
                                        'type_duree_validite_email_relance' : ''
                                } 
                                value={
                                    title === "Configuration avoirs" ? 
                                        cardContent.type_duree_validitee_avoir :
                                    title === "Configuration chèques cadeaux" ?
                                        cardContent.type_duree_validite_cheque_cadeau :
                                    title === "Configuration cashback" ?
                                        cardContent.type_duree_validite_cashback :
                                    title === "Configuration emails de relance" ?
                                        cardContent.type_duree_validite_email_relance : ''
                                } 
                                onValueChange={
                                    (value) => {
                                        setCardContent({
                                            ...cardContent,
                                            [title === "Configuration avoirs" ? 
                                                'type_duree_validitee_avoir' :
                                            title === "Configuration chèques cadeaux" ?
                                                'type_duree_validite_cheque_cadeau' :
                                            title === "Configuration cashback" ?
                                                'type_duree_validite_cashback' :
                                            title === "Configuration emails de relance" ?
                                                'type_duree_validite_email_relance' : '']: value
                                        });

                                        updateConfsActionInServer({
                                            ...cardContent,
                                            [title === "Configuration avoirs" ?
                                                'type_duree_validitee_avoir' :
                                            title === "Configuration chèques cadeaux" ? 
                                                'type_duree_validite_cheque_cadeau' :
                                            title === "Configuration cashback" ?
                                                'type_duree_validite_cashback' :
                                            title === "Configuration emails de relance" ?
                                                'type_duree_validite_email_relance' : '']: value
                                        });
                                }}
                            >
                                <SelectTrigger className="bg-gray-100">
                                    <SelectValue placeholder="Unité temporaire" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ANNEE">an(s)</SelectItem>
                                    <SelectItem value="MOIS">mois</SelectItem>
                                    <SelectItem value="JOUR">jour(s)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}