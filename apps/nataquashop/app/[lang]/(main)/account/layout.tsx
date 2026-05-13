

import SidebarMobile from "./SidebarMobile";
import SidebarDesktop from "./SidebarDesktop";
import { Heading } from "~/components/ui";
import { LangParams } from "~/app/utils";
import { getDictionary } from "~/app/dictionaries";

export type Props = {
  params: Promise<LangParams>;
  children: React.ReactNode;
};

export default async function AccountLayout({ children, params }: Props) {
  const { lang } = await params; 
  const translations = await getDictionary(lang);
  
  return (
   <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Menu mobile (dropdown) */}
      <SidebarMobile translations={translations}/>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-neutral-200 p-8 flex-col gap-6">
        <Heading heading="4" className="text-black font-bold mb-4">{translations.costumerAccount.sidebar.account}</Heading>
       <SidebarDesktop translations={translations}/>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
} 