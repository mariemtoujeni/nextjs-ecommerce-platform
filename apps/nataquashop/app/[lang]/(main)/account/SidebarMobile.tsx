"use client";
import { signOutAction } from "@repo/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dictionary } from "~/app/dictionaries";
import {
  Heading,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui";

interface Props {
  translations: dictionary;}

export default function SidebarMobile({translations}:Props) {
  const router = useRouter();
  const menuItems = [
    { href: "/account/informations",label: translations.costumerAccount.sidebar.infos,segment: "informations"},
    { href: "/account/orders", label: translations.costumerAccount.sidebar.orders, segment: "orders" },
    { href: "/account/returns", label: translations.costumerAccount.sidebar.returs, segment: "returns" },
    { href: "/account/discounts", label: translations.costumerAccount.sidebar.creditNote, segment: "discounts" },
    { href: "/account/gift-vouchers", label: translations.costumerAccount.sidebar.giftVoucher, segment: "gift-vouchers"},
  ];

  return (
    <div className="block md:hidden px-4 py-4">
      <Select onValueChange={(val) => router.push(val)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Mon compte" />
        </SelectTrigger>
        <SelectContent>
          {menuItems.map((item) => (
            <SelectItem key={item.href} value={item.href}>
              {item.label}
            </SelectItem>
          ))}
          <SelectItem
            value="logout"
            className="py-2 px-4 text-neutral-400 text-left hover:bg-lime hover:text-neutral-900"
            onClick={async () => {await signOutAction()}}
          >          
            {translations.costumerAccount.sidebar.logOut}
          </SelectItem>
        </SelectContent>
      </Select>
      
    </div>
  );
}
