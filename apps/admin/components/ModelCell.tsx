"use client";

import { ModelProductDetail } from "@repo/core/models";
import noPicture from '~/public/no-picture.jpg';
import { Badge } from "./ui";

export interface ModelCellProps {
    model: ModelProductDetail
}

export const ModelCell: React.FunctionComponent<ModelCellProps> = ({model}) => {
    const image = model && model.image && model.image.length > 0 
        ? <img src={model.image ?? noPicture.src} alt={model.name ?? 'no-image'} width={58} height={58} />
        : <img src={noPicture.src} alt="no-image" width={58} height={58} />;
    return <div className="flex flex-row gap-4 w-full">
        <div className="border rounded-md w-fit h-fit">
            {image}
        </div>
        <div className="flex flex-col gap-1">
            <span className="font-medium">{model.name}</span>
            <div className="flex flex-row gap-1">
                {model.attributs?.map((attribut, index) => (
                    <Badge key={index} variant="blue" size="sm">{attribut}</Badge>
                ))}
            </div>
            <span className="text-sm text-blue-600">{model.price} €</span>
        </div>
    </div>
}