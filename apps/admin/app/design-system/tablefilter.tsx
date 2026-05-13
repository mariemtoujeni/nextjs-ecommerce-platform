'use client';

import { TableFilter } from "~/components/TableFilter";

export const TableFilterDesignSystem = () => {
    return <TableFilter search={{ show: true, placeholder: "Updated placeholder..." }}
        items={{ total: 100, count: 20, defaultPage: 1 }}
        onPageChange={(page) => console.log(page)}
        onFiltersChange={(filter) => console.log(filter)}
        filters={[
            {key: "1", text: "Filter 1", values: [
                {id: "1", name: "Value 1"},
                {id: "2", name: "Value 2"},
                {id: "3", name: "Value 3"},
                {id: "4", name: "Value 4"},
                {id: "5", name: "Value 5"},
                {id: "6", name: "Value 6"},
                {id: "7", name: "Value 7"},
                {id: "8", name: "Value 8"},
                {id: "9", name: "Value 9"},
                {id: "10", name: "Value 10"},
                {id: "11", name: "Value 11"},
                {id: "12", name: "Value 12"},
                {id: "13", name: "Value 13"},
                {id: "14", name: "Value 14"},
                {id: "15", name: "Value 15"},
                {id: "16", name: "Value 16"},
                {id: "17", name: "Value 17"},
                {id: "18", name: "Value 18"},
                {id: "19", name: "Value 19"},
                {id: "20", name: "Value 20"},
                {id: "21", name: "Value 21"},
                {id: "22", name: "Value 22"},
                {id: "23", name: "Value 23"},
                {id: "24", name: "Value 24"},
            ]},
            {key: "2", text: "Attributs", children: [
                {key: "2.1", text: "Couleur", values: [{id: "2.1.1", name: "Value 2.1.1"}, {id: "2.1.2", name: "Value 2.1.2"}]},
                {key: "2.2", text: "Taille", values: [{id: "2.2.1", name: "Value 2.2.1"}, {id: "2.2.2", name: "Value 2.2.2"}]}
            ]}
        ]}
    />
}