import { Heading } from "~/components/ui";
import { OpinionList } from "./opinionList";
import { SearchParams } from "@repo/core/types";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page } = await searchParams;

  return (
    <div className="container">
      <div className="flex flex-row justify-between w-full">
        <Heading key="page-title" heading="2">
          Avis
        </Heading>
      </div>
      <OpinionList
        filters={[
          {
            key: "validated",
            text: "État",
            values: [
              { id: "Vérifié", name: "Vérifié" },
              { id: "Non vérifié", name: "Non vérifié" },
            ],
          },
          {
            key: "actif",
            text: "Statut",
            values: [
              { id: "Visible", name: "Visible" },
              { id: "Non Visible", name: "Non Visible" },
            ],
          },
          {
            key: "createdAt",
            text: "Date d'ajout",
            values: [
              { id: "La plus récente", name: "La plus récente" },
              { id: "La plus ancienne", name: "La plus ancienne" },
            ],
          },
          /*{
            key: "site",
            text: "Site",
            values: [
              { id: "Nataquashop", name: "Nataquashop" },
              { id: "Swimwear", name: "Swimwear" },
              { id: "Crazyswim", name: "Crazyswim" },
            ],
          },*/
        ]}
        defaultPage={page ? parseInt(page) : 1}
      />
    </div>
  );
}
