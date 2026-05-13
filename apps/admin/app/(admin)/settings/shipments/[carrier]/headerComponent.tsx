'use client'

import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { Button, Card, Heading } from "~/components/ui";

export interface HeaderComponentProps {
    expediteur: string
}

export const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = ({expediteur}) => {
    return <div className="flex flex-row justify-between w-100">
                <div className="flex flex-row gap-3 items-center h-[26px]">              
                    <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => {
                        window.location.href = `/settings/shipments`;
                    }}>                        
                        <ArrowLeft style={{ width: '16px', height: '16px' }}/>
                    </Card>                    
                    <Heading key='page-title' heading={"2"} className="text-gray-700 mt-3">Configuration des zones {expediteur}</Heading>
                </div>
            </div>
}