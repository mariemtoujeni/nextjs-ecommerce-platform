import * as React from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { MegaMenu, MegaMenuV2 } from "~/components/mega-menu";
import Link from "next/link";
import Image from "next/image";
import { SearchBox, MobileSearchOverlay } from "./search-box";
import { User } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import CartButton from "./cart-indicator";
import { LanguageSelector } from "~/components/ui/language-selector";
import { NavbarScrollingText } from "./navbar-scrolling-text";
import { getStoreMenuAction } from "@repo/actions/stores";
import { Langs } from "~/app/utils";
import { getDictionary } from "~/app/dictionaries";
import { StoreMenu } from "@repo/core/models";

export type NavbarProps = {
  isUserSignedIn: boolean,
  lang: Langs,
  clubStore?: StoreMenu[] 
}

export async function Navbar({isUserSignedIn ,  lang, clubStore} : NavbarProps) {
  const stores = await getStoreMenuAction(lang);
  const dict = await getDictionary(lang);

  return (
    <div
      className={"flex flex-col gap-0 justify-stretch p-0 relative"}
    >
      <NavbarScrollingText />
      <div className="flex items-center justify-between mx-6 lg:my-4 my-2">
        <div className="flex items-center gap-4 w-full">
          <div className="order-1 lg:order-2">
            <MegaMenu stores={stores} lang={lang} clubStore={clubStore}/>
          </div>
          <div className="order-2 lg:order-1">
            <Link href={`/${lang}`}>
              <Image
                src="/images/logo/main-logo.svg"
                alt="Logo"
                height={50}
                width={150}
                priority
                className="lg:w-[200px] w-[100px]"
              /> 
            </Link>
          </div>   
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <SearchBox variant="desktop" className="hidden lg:block w-[250px]" dict={dict} lang={lang}/>
          <SearchBox variant="mobile" className="block lg:hidden" dict={dict} lang={lang}/>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-0">
            <Link href={isUserSignedIn ? `/${lang}/account` :`/${lang}/signin`}>
              <Button variant="ghost" size="icon" hasIcon={true} icon={User} />
            </Link>
            <LanguageSelector />
            <CartButton />
          </div>
        </div>
      </div>
      <MobileSearchOverlay dict={dict} lang={lang}/>
    </div>
  );
}
