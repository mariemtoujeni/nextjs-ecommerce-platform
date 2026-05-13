'use client'

import { WYSIWYG } from "~/components/wysiwyg";
import { Card, CardContent, CardHeader, CardTitle, Heading, Input, Label } from "~/components/ui";
import { useEffect, useRef, useState } from "react";
import { AttributDetail } from "@repo/core/models";

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export interface GeneralComponentProps {
    detail: AttributDetail
    onGeneralInfoChanged: (attribute: AttributDetail) => void
}

export const GeneralComponent: React.FunctionComponent<GeneralComponentProps> = ({ detail, onGeneralInfoChanged }) => {    
    // Safety check to prevent rendering with null detail
    if (!detail) {
        return null;
    }

    const [attribute, setAttribute] = useState<AttributDetail>(detail);
    const isInitialRender = useRef(true);
    
    // Update local state when detail prop changes (from parent)
    useEffect(() => {
        setAttribute(detail);
        isInitialRender.current = true;
    }, [detail]);
    
    // Debounce the attribute changes
    const debouncedAttribute = useDebounce(attribute, 500);
    
    // Call onGeneralInfoChanged when debounced value changes (but not on initial render)
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        onGeneralInfoChanged(debouncedAttribute);
    }, [debouncedAttribute, onGeneralInfoChanged]);

    const handleInputChange = (field: keyof AttributDetail, value: any) => {
        setAttribute(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return <div className="mt-5">
        <Card>
            <CardHeader>
                <CardTitle>
                    <Heading key={"titre2"} heading={"3"} className="text-gray-700 font-bolde">Général</Heading>
                </CardTitle>
            </CardHeader>    
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Titre</Label>
                        <Input value={attribute.name} onChange={(e) => {
                            handleInputChange('name', e.target.value);
                        }} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Légende</Label>
                        <WYSIWYG content={attribute.legend ? attribute.legend : ''} onChange={(value) => {
                            handleInputChange('legend', value);
                        }} />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
}