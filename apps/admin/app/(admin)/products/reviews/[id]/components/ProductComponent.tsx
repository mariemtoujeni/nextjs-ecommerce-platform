import { Opinion } from "@repo/core/models";
import { Card } from "~/components/ui";

export interface GeneralComponentProps {
  opinion: Opinion;
}
export default function ProductComponent({ opinion }: GeneralComponentProps) {
  return (
    <Card className="">
      <section className="bg-white p-4 rounded-md shadow">
        <h2 className="font-semibold">Produit</h2>
        <br></br>
        <div className="flex items-center gap-3">
          <img
            src={opinion.images?.[0]?.url}
            alt="Product"
            className="w-[60px] h-[60px] object-cover rounded"
          />
          <span className="text-sm font-medium">
            {opinion.descriptions?.[0]?.title}
          </span>
        </div>
      </section>
    </Card>
  );
}
