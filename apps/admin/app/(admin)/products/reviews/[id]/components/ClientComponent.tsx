import { Opinion } from "@repo/core/models";

export interface GeneralComponentProps {
  opinion: Opinion;
  
}

export default function ClientComponent({ opinion }: any) {
  
  return (
    <section className="bg-white p-4 rounded-md">
      <h2 className="font-semibold ">Client</h2>
      <br />
      
      <p>{opinion.client.firstName } {opinion.client.lastName}</p>      
      <p className="text-blue-600">{opinion.client.email}</p>   
      <p>{opinion.client.mobilePhone||opinion.client.homePhone}</p>

    </section>
  );
}