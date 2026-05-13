import { Customization } from "@repo/core/models";

export function personnalization(customizations: Customization[]) :Record<string, Customization[]> {
    const grouped: Record<string, Customization[]> = {};
    for (const item of customizations) {
        const key = item.description;
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(item);
    }
    return grouped;

}