'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, useSidebar } from "./ui/sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ChevronsUpDown, LogOut, LockOpen, Home, LucideIcon, Package, Tag, ShoppingBag, Users, TicketPercent, Calendar, Settings, ChevronRight, ChartBar } from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { getUserAction, signOutAction } from "@repo/actions/auth";
import { User, UserWithoutPassword } from "@repo/core/models";

export type SidebarLink = {
    label: string;
    icon?: LucideIcon;
    url: string;
    roles?: string[];
    items?: SidebarLink[];
}

const links: SidebarLink[][] = [
    [ 
          { label: "Accueil", icon: Home,url: "dashboard", roles: ["admin.super", "admin.editor"]}
        , { label: "Produits", icon: Tag, url: "products", items: [
            { label: "Catalogue", url: "", roles: ["admin.super", "admin.editor"]}
            , { label: "Catégories", url: "categories", roles: ["admin.super", "admin.editor"]}
            , { label: "Avis", url: "reviews", roles: ["admin.super", "admin.editor"]}
            , { label: "Stocks", url: "stock", roles: ["admin.super", "admin.editor"]}
            , { label: "Inventaire", url: "inventory", roles: ["admin.super", "admin.editor"]}
            , { label: "Commandes fournisseurs", url: "supplier-orders", roles: ["admin.super", "admin.editor"]}
            , { label: "Alertes produits", url: "product-alerts", roles: ["admin.super", "admin.editor"]}
        ], roles: ["admin.super", "admin.editor"]}
        , {label: "Commandes", icon: ShoppingBag, url: "orders", items: [
            {label: "Toutes les commandes", url: "", roles: ["admin.super", "admin.editor"]}
            , {label: "Expéditions", url: "shipments", roles: ["admin.super", "admin.editor"]}
            , {label: "Retours clients", url: "returns", roles: ["admin.super", "admin.editor"]}
            , {label: "Chèques cadeaux", url: "gift-cards", roles: ["admin.super", "admin.editor"]}
            , {label: "Points de ventes", url: "sales-points", roles: ["admin.super", "admin.editor"]}
            , {label: "Caisse", url: "checkout", roles: ["admin.super", "admin.editor"]}
        ], roles: ["admin.super", "admin.editor"]}
        , {label: "Clients", icon: Users, url: "customers", items: [
            {label: "Tous les clients", url: "", roles: ["admin.super", "admin.editor"]}
            , { label: "Devis", url: "quotes", roles: ["admin.super", "admin.editor"]}
        ], roles: ["admin.super", "admin.editor"]}
    ]
    , [{label: "Réductions", icon: TicketPercent, url: "discounts", roles: ["admin.super", "admin.editor"]}
        , {label: "Evènements", icon: Calendar, url: "events", roles: ["admin.super", "admin.editor"]}
        , {label: "Business Intelligence", icon: ChartBar, url: "business-intelligence", roles: ["admin.super"]}
    ]
    , [{label: "Paramètres", icon: Settings, url: "settings", items: [
        {label: "Collections", url: "collections", roles: ["admin.super", "admin.editor"]}
        , {label: "Attributs", url: "attributes", roles: ["admin.super", "admin.editor"]}
        , {label: "Expéditions", url: "shipments", roles: ["admin.super", "admin.editor"]}
        , {label: "Gestions des droits", url: "permissions", roles: ["admin.super", "admin.editor"]}
        , {label: "Configurations générales", url: "general-configurations", roles: ["admin.super", "admin.editor"]}
    ], roles: ["admin.super", "admin.editor"]}]
]

export default function AppBar({user}: {user: UserWithoutPassword}) {
    const { isMobile } = useSidebar();
    
    return (
        <Sidebar collapsible="icon" className="">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton variant="decorative" size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Avatar className="flex aspect-square size-8 items-center justify-center rounded-lg rounded-sm">
                                <AvatarFallback className="bg-black text-white">M</AvatarFallback>
                            </Avatar>
                            <div className="text-lg font-medium">MLCN Sports</div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {links.map((group, groupIndex) => (
                    <SidebarGroup key={groupIndex}>
                        <SidebarMenu>
                            {group.map((item, itemIndex) => {
                                const itemLink = `/${item.url}`

                                if (item.items && item.roles?.includes(user.user_role)) {
                                    return <Collapsible key={`${groupIndex}-${itemIndex}`} asChild className="group/collapsible">
                                        <SidebarMenuItem >
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={item.label}>
                                                    {item.icon && <item.icon />}
                                                <span>{item.label}</span>
                                                <ChevronRight  className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items.map((subItem, subItemIndex) => (
                                                    <SidebarMenuItem key={`${groupIndex}-${itemIndex}-${subItemIndex}`}>
                                                        <SidebarMenuButton asChild>
                                                            <Link href={`${itemLink}/${subItem.url}`}>
                                                                {subItem.label}
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                                }

                                return <SidebarMenuItem key={`${groupIndex}-${itemIndex}`}>
                                    <SidebarMenuButton asChild>
                                        <Link href={`${itemLink}`}>
                                            {item.icon && <item.icon />}
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton  size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Avatar className="h-8 w-8 rounded-sm">
                                <AvatarFallback>
                                    {"" == user.first_name ? user.email.split("@")[0]!.charAt(0).toUpperCase() : `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {"" == user.first_name ? user.email.split("@")[0] : `${user.first_name} ${user.last_name}`} 
                                    
                                </span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <LockOpen  />
                            Changer de mot de passe
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-50" onClick={() => signOutAction()}>
                            <LogOut  />
                            Déconnexion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    )
}