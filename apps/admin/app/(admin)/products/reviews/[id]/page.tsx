'user client';
import { getOpinionById } from "@repo/actions/opinions";
import { notFound } from "next/navigation";
import ReviewDetailPage from "./components/ReviewDetailPage";


export type Props ={
  params:Promise< { id: string }>;
}

export default async function ReviewDetailPageWrapper(props: Props) {
  const { id } = await props.params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) return notFound();

  const opinion = await getOpinionById(idNum);
  if (!opinion) return notFound();

  return <ReviewDetailPage opinion={opinion} />;
}
