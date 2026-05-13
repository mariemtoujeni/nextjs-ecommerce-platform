'use client';

import { useState } from "react";
import { Button } from "~/components/ui/button";

export interface ExpandableListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    getKey?: (item: T, index: number) => React.Key;
    defaultVisible?: number; // number of items visible by default
    step?: number; // number of items to add on each click
    className?: string;
    layout?: 'grid' | 'vertical'; // Type de layout
    gridCols?: number; // Nombre de colonnes pour le layout grid
}

export default function ExpandableList<T>({
    items,
    renderItem,
    getKey,
    defaultVisible = 4,
    step = 4,
    className,
    layout = 'grid',
    gridCols = 4,
}: ExpandableListProps<T>) {
    const [visibleCount, setVisibleCount] = useState<number>(defaultVisible);

    const total = items.length;
    const limitedItems = items.slice(0, Math.min(visibleCount, total));
    const isAllVisible = visibleCount >= total;

    const handleToggle = () => {
        if (isAllVisible) {
            setVisibleCount(defaultVisible);
        } else {
            setVisibleCount(Math.min(visibleCount + step, total));
        }
    };

    const containerClass = layout === 'grid' 
        ? `grid grid-cols-${gridCols} gap-2` 
        : 'space-y-2';

    return (
        <div className={className}>
            <div className={containerClass}>
                {limitedItems.map((item, index) => (
                    <div key={getKey ? getKey(item, index) : index}>
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>
            {total > defaultVisible && (
                <Button
                    variant="link"
                    className="px-0 py-2 h-auto mt-1 text-purple-700"
                    onClick={handleToggle}
                >
                    {isAllVisible ? "Afficher moins" : "+ Voir plus"}
                </Button>
            )}
        </div>
    );
}


