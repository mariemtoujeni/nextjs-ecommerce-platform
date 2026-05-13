"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "~/lib/utils"
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react"
import { Langs } from "~/app/utils"
import { StoreMenu } from "@repo/core/models"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu"
import { generateSlug } from "~/lib/slugs"
import Image from "next/image"
import { Separator } from "./ui/separator"


export type MegaMenuProps = {
    stores: StoreMenu[]
    lang: Langs
    clubStore?: StoreMenu[];
}

export function MegaMenu({ stores, lang, clubStore }: MegaMenuProps) {

    const [activeStore, setActiveStore] = useState<StoreMenu | null>(null)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
    const isHoveringDropdown = useRef(false);
    const isHoveringMenu = useRef<NodeJS.Timeout | null>(null);

    // Gestion de l'accordéon mobile
    const handleAccordion = (cat: string) => {
        setOpenAccordions((prev) => ({ ...prev, [cat]: !prev[cat] }))
    }


    const onMouseEnterDesktop = (store: StoreMenu) => {
        if(isHoveringMenu.current) {
            clearTimeout(isHoveringMenu.current)
        }
        setActiveStore(store);
    }

    const onMouseLeaveDesktop = () => {
        isHoveringMenu.current = setTimeout(() => {
            if (!isHoveringDropdown.current) {
                setActiveStore(null)
            }
        }, 100)
    }

    const clubStoreActif: StoreMenu | null = 
      clubStore?.filter(store => store.active === 1)
                .sort((a, b) => b.order - a.order)[0] ?? null;

    // --- MOBILE/TABLET MENU ---
    // (visible < lg)
    return (<>
        
        {/* Header mobile/tablette */}
        <div className="flex items-center justify-between lg:w-full lg:px-4 lg:py-2 bg-background lg:hidden">
            <button onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
                <Menu size={24} />
            </button>
            <div className="flex-1 flex justify-center">

            </div>
        </div>
        {/* Overlay menu mobile/tablette */}
        <div
            className={cn(
                "fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out overflow-y-auto lg:hidden",
                mobileOpen ? "translate-y-0" : "-translate-y-full"
            )}
            style={{ willChange: 'transform' }}
        >
            {/* Header menu mobile/tablette */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200">
                <button onClick={() => setMobileOpen(false)} aria-label="Fermer le menu">
                    <X size={28} />
                </button>
                {/*<div className="flex-1 flex justify-center">
                    <Image src="/images/logo/main-logo.svg" alt="Nataquashop"width={32} height={32} />
                </div>*/}
                <div className="w-8" /> {/* Pour équilibrer la croix à gauche */}
            </div>
            {/* Liste des catégories en accordéon */}
            <div className="flex flex-col divide-y divide-neutral-200">
                {stores.map((store) => {
                    const storeSlug = generateSlug(store.name, store.id);
                    return <div key={store.name}>
                        <button
                            className="w-full flex items-center justify-between px-4 py-3 font-bold text-left hover:bg-neutral-100"
                            onClick={() => handleAccordion(store.name)}
                        >
                            {store.name}
                            {openAccordions[store.name] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {/* Accordéon ouvert */}
                        <div
                            className={cn(
                                "transition-all duration-300 overflow-hidden bg-neutral-50",
                                openAccordions[store.name] ? "max-h-[1000px] py-2" : "max-h-0 py-0"
                            )}
                        >
                            {/* Collections */}
                            <div className="pl-8 pr-4">
                                {/*store.collections.map((col) => (
                                    <a key={col.name} href={col.href || '#'} className="block py-2 text-sm font-medium text-neutral-700 hover:text-lime">
                                    {col.name}
                                    </a>
                                ))*/}
                            </div>
                            {/* Catégories et sous-catégories */}
                            {store.categories.map((cat) => {
                                const categorySlug = generateSlug(cat.name, cat.id);
                                return <div key={cat.name} className="px-8">
                                    <button
                                        className="w-full flex items-center justify-between py-2 text-sm font-semibold text-neutral-800 hover:underline"
                                        onClick={() => handleAccordion(store.name + '-' + cat.name)}
                                    >
                                        {cat.name}
                                        {openAccordions[store.name + '-' + cat.name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                    <div
                                        className={cn(
                                            "transition-all duration-300 overflow-hidden",
                                            openAccordions[store.name + '-' + cat.name] ? "max-h-[500px] pl-4" : "max-h-0 pl-4"
                                        )}
                                    >
                                        {cat.subCategories.map((subcat) => {
                                            const subcatSlug = generateSlug(subcat.name, subcat.id);
                                            return <a key={subcat.name} href={`/${lang}/${storeSlug}/${categorySlug}/${subcatSlug}`} className="block text-xs text-neutral-600 hover:underline">
                                                {subcat.name}
                                            </a>
                                            
                                        })}
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                })}
                {clubStoreActif && (
                <button
                    key={clubStoreActif.name}
                    className="w-full flex items-center justify-between px-4 py-3 font-bold text-left text-neutral-800 hover:bg-neutral-100"
                    onClick={() => {
                    setMobileOpen(false);
                    window.location.href = `/${lang}/${generateSlug(clubStoreActif.name, clubStoreActif.id)}`;
                    }}
                >
                    {clubStoreActif.name}
                </button>
                )}

            </div>
        </div>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden lg:block w-full z-50">
            {/* Menu principal */}
            <div className="flex items-center justify-center w-full bg-background">
                {stores.map((store) => (
                    <a
                        key={store.name}
                        onMouseEnter={() => onMouseEnterDesktop(store)}
                        onMouseLeave={() => onMouseLeaveDesktop()}
                        className={cn(
                            "px-6 py-3 text-sm font-medium transition-colors",
                            activeStore === store
                                ? "underline"
                                : "hover:underline"
                        )}
                        href={`/${lang}/${generateSlug(store.name, store.id)}`}
                    >
                        {store.name}
                    </a>
                ))}
                {clubStoreActif && (
                    <>
                    <Separator orientation="vertical" className="h-6" />
                        {clubStoreActif && (
                            <a
                                key={clubStoreActif.name}
                                className={cn(
                                "px-6 py-3 text-sm font-medium transition-colors",
                                activeStore === clubStoreActif ? "underline" : "hover:underline"
                                )}
                                href={`/${lang}/${generateSlug(clubStoreActif.name, clubStoreActif.id)}`}
                            >
                                {clubStoreActif.name}
                            </a>
                        )}
                    </>
                )}
            </div>
            {/* Mega Menu */}
            {activeStore ? (
                <div className="absolute z-50 right-0 w-screen bg-white border-b border-neutral-200 mega-menu-container min-h-[300px] max-h-[500px] overflow-y-hidden shadow-sm"
                    onMouseEnter={() => {isHoveringDropdown.current = true}}
                    onMouseLeave={() => {
                        isHoveringDropdown.current = false
                        onMouseLeaveDesktop()
                    }}
                >
                    <div className="container mx-auto">
                        <div className="flex py-10 min-h-[300px] max-h-[500px] relative">
                            {/* Colonne de gauche - Collections populaires */}
                            <div className="w-1/4 border-r border-neutral-200 pr-8">
                                <h3 className="font-bold text-xl mb-6">À découvrir</h3>
                                {/*<ul className="space-y-4">
                  {stores.find(store => store.name === activeStore)!.collections.map((collection: any) => (
                    <li key={collection.name}>
                      <a 
                        href={collection.href || '#'} 
                        className="text-base hover:text-lime transition-colors"
                      >
                        {collection.name}
                      </a>
                    </li>
                  ))}
                </ul>*/}
                            </div>
                            {/* Colonne de droite - Catégories et sous-catégories */}
                            <div className="w-3/4 pl-8">
                                <div className="flex flex-col flex-wrap gap-4 h-full">
                                    {activeStore.categories.map((category: any) => {
                                        const storeSlug = generateSlug(activeStore.name, activeStore.id);
                                        const categorySlug = generateSlug(category.name, category.id);
                                        return <div key={category.name} className="grow-0 shrink-1">
                                            <h3 className="font-bold">
                                                <a href={`/${lang}/${storeSlug}/${categorySlug}`} className="text-sm hover:underline transition-colors">{category.name}</a>
                                            </h3>
                                            <ul className="">
                                                {category.subCategories.map((subcat: any) => {
                                                    const subcatSlug = generateSlug(subcat.name, subcat.id);
                                                    return <li key={subcat.name}>
                                                        <a
                                                            href={`/${lang}/${storeSlug}/${categorySlug}/${subcatSlug}`}
                                                            className="text-xs text-neutral-500 hover:underline transition-colors"
                                                        >
                                                            {subcat.name}
                                                        </a>
                                                    </li>
                                                })}
                                            </ul>
                                        </div>
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : <></>}
        </div>
    </>
    )
}


export function MegaMenuV2({ stores }: MegaMenuProps) {
    return (
        <NavigationMenu delayDuration={0} skipDelayDuration={0} >
            <NavigationMenuList>
                {stores.map((store) => (
                    <NavigationMenuItem key={store.name}>
                        <NavigationMenuTrigger>{store.name}</NavigationMenuTrigger>
                        <NavigationMenuContent className="w-screen absolute">
                            {
                                store.categories.map((category) => (
                                    <a href={category.name} key={category.name}>{category.name}</a>
                                ))
                            }              
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}