import { getClientAction, listAllCountriesAction } from "@repo/actions/clients";
import { ClientDetailWrapper } from "./client-wrapper";

export type Props = {
  params: Promise<{ id: string }>;
};

export default async function DetailClientPage(props: Props) {
  const { id } = await props.params; 
  const clientId = parseInt(id);
  const client = await getClientAction(clientId);
  const countries = await listAllCountriesAction(); 
  return <ClientDetailWrapper initialClient={client} countries={countries} />;
}



