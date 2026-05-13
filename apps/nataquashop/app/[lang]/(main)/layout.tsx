import { getUserUseCase } from "@repo/core/usecases";
import { CartProvider } from "~/components/cart-context";
import { Footer } from "~/components/footer";
import { Navbar } from "~/components/navbar";
import { LangParams } from "~/app/utils";
import { getClientByUserIdAction } from "@repo/actions/clients";

export default async function MainLayout({ children, params, }: { children: React.ReactNode; params: Promise<LangParams> }) {
  const user = await getUserUseCase();
  const client = await getClientByUserIdAction(user.id);

  const { lang } = await params;
  return (
    <CartProvider>
      <div className="min-h-screen">
          <Navbar isUserSignedIn={!user.is_anonymous} lang={lang} clubStore={client.item.club?.clubStore ?? []} />      
        <main className="flex-1">
          {children}
        </main>
        <Footer lang={lang} isUserSignedIn={!user.is_anonymous}/>
      </div>
    </CartProvider>
  );
}   