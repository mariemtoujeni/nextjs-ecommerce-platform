import AppBar from "~/components/appbar";
import { Separator } from "~/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { getUserAction } from "@repo/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserAction();
  return <SidebarProvider>
    <AppBar user={user} />
    <SidebarInset>
      <header className="bg-[#F1F1F1] flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </div>
      </header>
      <main className="bg-neutral-100 pb-8 px-8 min-h-screen"> 
        {children}
      </main>
    </SidebarInset>
  </SidebarProvider>;
}   