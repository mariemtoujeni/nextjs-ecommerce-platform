"use client"
import { signOutAction } from "@repo/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dictionary } from "~/app/dictionaries";


interface Props {
  translations: dictionary;}
export default function SidebarDesktop({translations}:Props){
      const menuItems = [
    { href: "/account/informations",label: translations.costumerAccount.sidebar.infos,segment: "informations"},
    { href: "/account/orders", label: translations.costumerAccount.sidebar.orders, segment: "orders" },
    { href: "/account/returns", label: translations.costumerAccount.sidebar.returs, segment: "returns" },
    { href: "/account/discounts", label: translations.costumerAccount.sidebar.creditNote, segment: "discounts" },
    { href: "/account/gift-vouchers", label: translations.costumerAccount.sidebar.giftVoucher, segment: "gift-vouchers"},
  ];
    return(
        <>
        <nav className="flex flex-col gap-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="py-2 px-4 border border-transparent hover:bg-lime"
                    >
                      {item.label}
                    </Link>
                  ))}

                </nav>
                <button 
          onClick={async () => { 
            try {
              await signOutAction(); 
            } catch (error)
            {
              console.error("Unable to signout")
            }
            
          }} 
          className="py-2 px-4 text-neutral-400 text-left hover:bg-lime hover:text-neutral-900">
          {translations.costumerAccount.sidebar.logOut}
        </button>
        </>
                

    )
}