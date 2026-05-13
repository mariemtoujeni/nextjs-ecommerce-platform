import { Button, Card, Heading, Input } from "~/components/ui";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { Plus  } from "lucide-react";
import { ExpediteursList } from "./table-expediteurs-zones";
import { getShippingConfsAction, getCountriesWithoutTVAAction, getCountriesWithTVAAction } from "@repo/actions/shipping-manager";
import { CountriesWithoutTVAComponent } from "./table-country-without-tva";

export default async function ShippingManager() {
    const expediteurs = await getShippingConfsAction();
    const countriesWithoutTVA = await getCountriesWithoutTVAAction();
    const countriesWithTVA = await getCountriesWithTVAAction();
    return (
        <div className="container h-[calc(100vh-80px)]">
            <div className="flex flex-row justify-between w-100">
                <Heading key='page-title' heading={"2"} className="text-gray-700">Gestion des expéditions</Heading>                    
            </div>            
            <ExpediteursList expediteurs={expediteurs} />            
            <div className="mt-12">
                <CountriesWithoutTVAComponent id="1" />
            </div>
        </div>
        
    );
}