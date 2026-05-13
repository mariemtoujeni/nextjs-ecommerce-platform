'use client'

import dynamic from "next/dynamic";
import { ReturnOne } from "@repo/core/types";
import { PurchaseOrderPresenter } from "@repo/core/models";
import { Spinner } from "~/components/Spinner";

const MainPanelComponent = dynamic(() => import("./main-panel-component").then(mod => ({ default: mod.MainPanelComponent })), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center py-8">
    <div className="flex flex-col items-center gap-2">
        <Spinner variant="circle" size={32} />
        <p className="text-sm text-gray-500">Chargement de la commande...</p>
    </div>
</div>
});

export interface ClientWrapperProps {
    purchaseOrder?: ReturnOne<PurchaseOrderPresenter>
}

export const ClientWrapper: React.FunctionComponent<ClientWrapperProps> = ({ purchaseOrder }) => {
    return <MainPanelComponent purchaseOrder={purchaseOrder} />;
};
