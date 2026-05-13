import { listAllCountriesAction } from "@repo/actions/clients";
import { CreateCustomerPage } from "./create-customer-client";

export default async function NewCustomerPage() {
  const countries = await listAllCountriesAction(); 
  return <CreateCustomerPage countries={countries}/>;
}
