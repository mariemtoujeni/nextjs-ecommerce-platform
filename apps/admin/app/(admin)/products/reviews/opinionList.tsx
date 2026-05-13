"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import { Opinion, OpinionFilterInput } from "@repo/core/models";
import { Button, Card, CardHeader, Heading } from "~/components/ui";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { TableFilter } from "~/components/TableFilter";
import { ActiveFilter, GenericFilter, ReturnAll } from "@repo/core/types";
import {
  getListAllOpinionsAction,
  getOpinionByProductIdAction,
} from "@repo/actions/opinions";
import { useDebounce } from "~/hooks/use-debounce";

export const OpinionList = ({
  filters,
  defaultPage,
}: {
  filters: GenericFilter[];
  defaultPage: number;
}) => {
  const LIMIT = 100;
  const [opinions, fetchOpinions, pending] = useActionState(
    (state: ReturnAll<Opinion>, payload: OpinionFilterInput) =>
      getListAllOpinionsAction(payload),
    { total: 0, items: [], count: 0 }
  );
  const [searchText, setSearchText] = useDebounce();

  const [page, setPage] = useState(defaultPage);

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  useEffect(() => {
    startTransition(() => {
      fetchOpinions({
        offset: page - 1,
        limit: LIMIT,
        search: searchText,
        filters: activeFilters.map((filter) => ({
          key: filter.key,
          values:
            Array.isArray(filter.values) &&
            filter.values.every((v) => typeof v === "string")
              ? filter.values
              : (filter.values as ActiveFilter[]).map((f) => ({
                  key: f.key,
                  values: f.values as string[],
                })),
        })),
      });
    });
  }, [activeFilters, page, searchText]);
  useEffect(() => {
    setPage(1);
  }, [searchText]);


  const router = useRouter();

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <Card>
      <CardHeader className="flex justify-end flex-row">
        <TableFilter
          search={{
            show: true,
            onSearch: setSearchText,
            defaultSearch: "",
            placeholder: "Recherche par titre ou ID",
          }}
          items={{ total: opinions.total, count: LIMIT, defaultPage }}
          filters={filters}
          activeFilters={activeFilters}
          onFiltersChange={(filters) => {
            setActiveFilters(filters);
          }}
          onPageChange={(page) => setPage(page)}
        />
      </CardHeader>
      <div className="container mx-auto">
        <div className="border border-neutral-200 rounded-lg">
          <Table>
            <TableHeader className="bg-neutral-100">
              <TableRow>
                <TableHead className="w-1/12">#</TableHead>
                <TableHead className="w-3/12">Produit</TableHead>
                <TableHead className="w-2/12">Note</TableHead>
                <TableHead className="w-2/12">État</TableHead>
                <TableHead className="w-2/12">Statut</TableHead>
                <TableHead className="w-2/12">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opinions.items.map((opinion) => (
                <TableRow
                  key={opinion.id}
                  className="cursor-pointer hover:bg-neutral-50"
                  onClick={() => router.push(`/products/reviews/${opinion.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    router.push(`/products/reviews/${opinion.id}`)
                  }
                >
                  <TableCell>{opinion.id ? `#${opinion.id}` : "-"}</TableCell>
                  <TableCell>
                    {opinion.descriptions?.[0]?.title || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < opinion.rating
                              ? "fill-lemonYellow text-lemonYellow"
                              : "fill-grayLight text-grayLight"
                          }
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-md ${
                        opinion.validated
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {opinion.validated ? "Vérifié" : "Non vérifié"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-md ${
                        opinion.actif
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {opinion.actif ? "Visible" : "Non visible"}
                    </span>
                  </TableCell>
                  <TableCell>{opinion.createdAt ? formatDate(opinion.createdAt) : "-"}</TableCell>
                </TableRow>
              ))}

              {opinions.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center">
                    Aucune opinion trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};
