import { Heading } from "~/components/ui"
import { getConfsAction } from "@repo/actions/general-settings"
import { CardCompnent } from "./conf-component";
import { HeadingComponent } from "./heading-component";

const headerTitle = ["Configuration avoirs", "Configuration chèques cadeaux", "Configuration cashback", "Configuration emails de relance"]

export default async function GeneralConfiguration() {
    const generalSettings = await getConfsAction();

    return <div className="container h-[calc(100vh-80px)]">
        <HeadingComponent />
        <div className="grid grid-cols-2 gap-4 py-5">            
            {headerTitle.map((title, index) => {                     
                return <CardCompnent key={index} title={title} index={index} settings={generalSettings} />;                
            })}
        </div>
    </div>
}