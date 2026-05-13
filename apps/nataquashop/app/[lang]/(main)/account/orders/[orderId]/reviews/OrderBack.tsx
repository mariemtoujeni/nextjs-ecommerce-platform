"use client"


import Link from "next/link";
import { dictionary } from "~/app/dictionaries";
import { Button } from "~/components/ui";
interface Props {
  translations: dictionary;
}

export default function OrderBack({translations}:Props){
    
    return(
      <Link href={"/account/orders"}>
        <Button variant="link" size="sm" className="mb-5"  >
        ← {translations.costumerAccount.review.back}
      </Button>
      </Link>
    )

}