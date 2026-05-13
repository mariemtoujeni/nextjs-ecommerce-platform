import { Heading, Button, Input, Label, Switch } from "~/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  getInformationClientAction,
 
} from "@repo/actions/account-client";
import { LangParams } from "~/app/utils";
import { redirect } from "next/navigation";
import UpdateInfo from "./UpdateInfo";
import AddFactAddress from "./AddFactAddress";
import { Client } from "@repo/core/models";
import AnonymizeClient from "./AnonymizeClient";
import { getDictionary } from "~/app/dictionaries";

import UpdateAddress from "./UpdateAddress";

export type Props = { params: Promise<LangParams> };

export default async function InformationsPage(props: Props) {
  const { lang } = await props.params;
  let client: Client;
  
  try {
    const clientResult = await getInformationClientAction();
    client = clientResult.item;
  } catch (error) {
    return redirect(`/${lang}/`);
  }

  const address = client?.clientAddress;
  
  const translations = await getDictionary(lang);

  return (
    <div className="flex flex-col gap-10">
  {/* Bannière */}
  <div
    className="relative w-full overflow-hidden mb-8"
    style={{
      background: "radial-gradient(ellipse at top, #bba1de 0%, #472063 100%)",
    }}
  >
    <div className="flex flex-col sm:flex-row items-center sm:items-start p-6 sm:p-8 gap-4 sm:gap-8">
      <div className="w-20 h-20 rounded-full  bg-lime flex items-center justify-center text-3xl font-bold text-white shrink-0">
        {/* Avatar */}
        {client.lastName[0]}{client.firstName[0]}
      </div>

      <div className="flex flex-col gap-1 sm:gap-2 text-center sm:text-left">
        <span className="text-white font-bold text-sm sm:text-base">
          {translations.costumerAccount.dataClient.clientNumber} : {client.clientNumber}
        </span>
        <span className="text-white/80 text-xs sm:text-sm">
          {translations.costumerAccount.dataClient.registered} :{" "}
          {new Date(client.createdAt).toLocaleDateString("fr-FR")}
        </span>
      </div>
      {
      client.clubMemberId && 
      <Button className="mt-4 sm:mt-0 sm:ml-auto" variant="outline" size="sm" style={{ background: "white" }} disabled >
        {translations.costumerAccount.dataClient.clubCode} : {client.clubMemberId}
      </Button>
      }
    </div>
  </div>

      {/* Informations du compte */}
      <section className="mb-8">
        <Heading heading="5" className="mb-4">
          {translations.costumerAccount.dataClient.accountInfo}
        </Heading>
        <div className="flex flex-col gap-4">
          <UpdateInfo clientInfos={client} translations={translations} />
        </div>
      </section>

     
    <section>
  <Heading heading="5" className="mb-4">
    {translations.costumerAccount.updateAdress.allAddress}
  </Heading>

  {/* Vue "cards" en mobile */}
  <div className="grid grid-cols-1 gap-4 sm:hidden">
          {address?.map((addr, index) => (
            <div className="flex items-center justify-between">
              
              <p>
                {addr.designation} {addr.adresse} {addr.code_postal} {addr.ville}, {addr.pays}
              </p>
              <UpdateAddress dataAdress={addr} translations={translations} defaultCount={client.clientAddress.filter(a => a.default).length}/>
            </div>
          ))}
        </div>

  {/* Tableau classique en desktop */}
  <div className="overflow-x-auto hidden sm:block">
    <Table className="min-w-[700px]">
      <TableHeader>
        <TableRow>
          <TableHead>{translations.costumerAccount.dataClient.designation}</TableHead>
          <TableHead>{translations.costumerAccount.dataClient.address}</TableHead>
          <TableHead>{translations.costumerAccount.dataClient.city}</TableHead>
          <TableHead>{translations.costumerAccount.dataClient.postcode}</TableHead>
          <TableHead>{translations.costumerAccount.dataClient.country}</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {address?.map((addr, index) => (
          <TableRow key={index}>
            <TableCell>{addr.designation}</TableCell>
            <TableCell>{addr.adresse}</TableCell>
            <TableCell>{addr.ville}</TableCell>
            <TableCell>{addr.code_postal}</TableCell>
            <TableCell>{addr.pays}</TableCell>
            <UpdateAddress dataAdress={addr} translations={translations} defaultCount={client.clientAddress.filter(a => a.default).length}/>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>

  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
    <AddFactAddress translations={translations}/>
   {/* <AnonymizeClient translations={translations} />*/}
  </div>
</section>


    </div>
  );
}
