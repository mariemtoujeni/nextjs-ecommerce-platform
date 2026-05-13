"use client";
import { getTitleProductByOrderAction } from "@repo/actions/account-client";
import { InfoProductByOrder } from "@repo/core/models";
import { useEffect, useState } from "react";
import { SelectContent, SelectItem } from "~/components/ui";

type Props = {
  lang: string;
  idNum: number;
};

export default function SelectTitle({ lang, idNum }: Props) {
  const [titles, setTitles] = useState<InfoProductByOrder[]>([]);

  useEffect(() => {
    async function fetchTitles() {
      const dataReturned = await getTitleProductByOrderAction(idNum);
      const data = dataReturned.items;      
      setTitles(data);
    }
    fetchTitles();
  }, [idNum]);

  return (
    <SelectContent>
      {titles.map((item, index) => {       
        const desc = item.descriptions.find((d) => d.lang === lang);
        return (
          <SelectItem key={index} value={desc?.title || ""}>
            {desc?.title || ""}
          </SelectItem>
        );
      })}
    </SelectContent>
  );
}
