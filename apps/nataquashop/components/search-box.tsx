"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "~/components/ui/command"
import { startTransition, useActionState, useState } from "react"
import { ReturnAll } from "@repo/core/types"
import { Product, ProductFilterInput, ProductFilterTypeAdmin, ProductStatus } from "@repo/core/models"
import { getAllProductAction } from "@repo/actions/products"
import { useRouter } from "next/navigation"
import { Langs } from "~/app/utils"

// État global pour la barre de recherche mobile
let isMobileSearchOpen = false
let setMobileSearchOpen: (open: boolean) => void

// Hook pour gérer l'état global
function useMobileSearch() {
  const [isOpen, setIsOpen] = React.useState(false)
  
  React.useEffect(() => {
    isMobileSearchOpen = isOpen
    setMobileSearchOpen = setIsOpen
  }, [isOpen])
  
  return { isOpen, setIsOpen }
}


export function SearchBox({ variant = "desktop", className, dict = {}, lang }: { variant?: "desktop" | "mobile"; className?: string; dict?: any; lang?: Langs }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { isOpen: isMobileOpen, setIsOpen: setIsMobileOpen } = useMobileSearch()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [products, fetchProducts, pending] = useActionState(
        (state: ReturnAll<Product>, payload: ProductFilterInput) => getAllProductAction(payload), 
        { total: 0, items: [], count: 0 }
    );
  const [search, setSearch] = useState('');
  const router = useRouter();
  let filters = [{ key: ProductFilterTypeAdmin.STATE, values: [ProductStatus.PUBLISHED] }];
  React.useEffect(() => {
      if (search.trim().length === 0) {
        return;
      }
      startTransition(() => {
        fetchProducts({ limit: 3, search, filters });
      });
    }, [search]);

  React.useEffect(() => {
    if (isMobileOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isMobileOpen])

  if (variant === "mobile") {
    return (
      <div className={className}>
        <Button variant="ghost" size="icon" hasIcon={true} icon={Search} onClick={() => setIsMobileOpen(true)} />
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Command className="w-full" shouldFilter={false}>
        <CommandInput 
          placeholder={dict?.searchbox?.search ?? "Rechercher..."}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          value={search}
          onValueChange={setSearch}
        />
        {isOpen && (
          <CommandList className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 w-full max-h-[300px] overflow-y-auto border border-black bg-white shadow-md">
            {search.trim().length === 0 ? (
              <CommandEmpty>{dict?.searchbox?.noproduct ?? ""}</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>{dict?.searchbox?.noproduct ?? ""}</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {products.items.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.descriptions.find((t) => t.lang === lang) ?.title}
                      onSelect={() => { 
                        setSearch("")            
                        setIsOpen(false)  
                        router.push(`/product/${product.id}`) }
                      }
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span>
                          { product.descriptions.find((t) => t.lang === lang) ?.title }
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {product.category.name}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  )
}

export function MobileSearchOverlay({dict, lang}: {dict?: any, lang?: Langs}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [products, fetchProducts, pending] = useActionState(
        (state: ReturnAll<Product>, payload: ProductFilterInput) => getAllProductAction(payload), 
        { total: 0, items: [], count: 0 }
    );
  const [search, setSearch] = useState('');
  const router = useRouter();
  let filters = [{ key: ProductFilterTypeAdmin.STATE, values: [ProductStatus.PUBLISHED] }];
  React.useEffect(() => {
      if (search.trim().length === 0) {
        return;
      }
      startTransition(() => {
        fetchProducts({ limit: 3, search, filters });
      });
    }, [search]);


  React.useEffect(() => {
    const checkState = () => {
      if (isMobileSearchOpen !== isOpen) {
        setIsOpen(isMobileSearchOpen)
      }
    }
    
    const interval = setInterval(checkState, 50)
    return () => clearInterval(interval)
  }, [isOpen])

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    setSearch("")
    if (setMobileSearchOpen) setMobileSearchOpen(false)
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="absolute top-full left-0 w-full z-50 bg-white border-b border-neutral-200 transition-transform duration-300 ease-in-out"
      style={{ willChange: 'transform' }}
    >
      <div className="flex items-center px-4 py-3 gap-2">
        <Search size={16} className="text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={dict?.searchbox?.search ?? ""}
          className="flex-1 outline-none bg-transparent text-base"
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="ghost" size="icon" hasIcon={true} icon={X} onClick={handleClose}/>
      </div>
      <div className="w-full max-h-[300px] overflow-y-auto border-t border-neutral-100 bg-white">
        <div className="p-2 text-sm text-muted-foreground">Suggestions</div>
        {products.items.map((product) => (
          <div key={product.id} className="px-4 py-2 hover:bg-neutral-100 cursor-pointer" onClick={() => { 
            setSearch("");
            handleClose();
            router.push(`/product/${product.id}`);
           }} >
            <div className="flex flex-col">
              <span>{ product.descriptions.find((t) => t.lang === lang)?.title }</span>
              <span className="text-xs text-muted-foreground">{product.category.name}</span>
            </div>
          </div>
        ))} 
      </div>
    </div>
  )
} 