'use client';

import { useEffect, useRef, useState, startTransition, useActionState } from "react";
import { deleteProductFromPackAction, getAllProductAction } from "@repo/actions/products";
import { Product, ProductFilterInput, ProductStatus } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { Badge, Card, CardHeader, CardContent, Input, CardTitle, Button, Heading } from "~/components/ui";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { Popover, PopoverTrigger, PopoverContent } from "~/components/ui/popover";
import { Spinner } from "~/components/Spinner";
import { useDebounce } from "~/hooks/use-debounce";
import noPicture from '~/public/no-picture.jpg';
import Image from "next/image";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "~/hooks/use-toast";

const LIMIT = 10;

interface Props {
  selectedProducts: Product[];
  onSelectedProductsChange: (products: Product[]) => void;
  disabled?: boolean; 
  productPackId?: number;
}

export const SearchableProductsTable = ({ selectedProducts, onSelectedProductsChange, disabled = false, productPackId }: Props) => {
  const [rawSearch, setRawSearch] = useState('');
  const [searchText, setSearchText] = useDebounce(rawSearch, 300);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [searchResults, fetchProducts, pending] = useActionState(
    (state: ReturnAll<Product>, payload: ProductFilterInput) =>
      getAllProductAction(payload),
    { total: 0, items: [], count: 0 }
  );

  useEffect(() => {
    startTransition(() => {
      fetchProducts({ limit: LIMIT, offset: (page - 1) * LIMIT, search: searchText });
    });
  }, [page, searchText]);

  const handleSelectProduct = (product: Product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      onSelectedProductsChange([...selectedProducts, product]);
    }
    setRawSearch(""); 
    setSearchText(""); 
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveProduct = async (productId: number) => {
    if (!disabled) {
      onSelectedProductsChange(selectedProducts.filter(p => p.id !== productId));
      return;
    }

    try {
      if (!productPackId) return;
      await deleteProductFromPackAction(productPackId, productId);
      onSelectedProductsChange(selectedProducts.filter(p => p.id !== productId));
      toast({
        title: "Succès",
        description: "Le produit a été supprimé de ce pack avec succès",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit du pack",
      });
    }
  };


  return (
    <Card>
      <CardHeader><CardTitle><Heading heading="3" className="text-gray-700 font-bold">Ajouter un produit</Heading></CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div onClick={() => inputRef.current?.focus()}>
              <Input
                ref={inputRef}
                type="text"
                value={rawSearch}
                placeholder="Rechercher un produit..."
                onFocus={() => !disabled && setIsOpen(true)}
                onChange={(e) => {
                  setPage(1);
                  setRawSearch(e.target.value);
                  if (!disabled) setIsOpen(true);
                }}
                className="w-full"
                disabled={disabled} 
              />
            </div>
          </PopoverTrigger>

          {!disabled && isOpen && (
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={5}
              className="w-[--radix-popover-trigger-width] p-2 max-h-[300px] overflow-y-auto"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              {pending ? (
                <div className="flex justify-center py-4">
                  <Spinner variant="circle" size={20} />
                </div>
              ) : searchResults.items.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.items.map((product) => {
                    const description = product.descriptions.find((d) => d.lang === "fr");
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <Image
                          src={product.images[0]?.url ?? noPicture}
                          alt={description?.title ?? "no-image"}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{description?.title}</p>
                          <Badge variant={product.status ? "green" : "red"} size="sm">
                            {product.status ? "Publié" : "Non publié"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun produit trouvé</p>
              )}
            </PopoverContent>
          )}
        </Popover>

        <div className="border rounded-lg">
          <Table>
            <TableHeader className="bg-neutral-100">
              <TableRow>
                <TableHead className="w-1/12">#</TableHead>
                <TableHead className="w-6/12">Produit</TableHead>
                <TableHead className="w-2/12">Statut</TableHead>
                <TableHead className="w-2/12 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {selectedProducts.length > 0 ? (
                  selectedProducts.map((product) => {
                    const description = product.descriptions.find((d) => d.lang === "fr");

                    return (
                      <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/products/edit/${product.id}`)}>
                        <TableCell>{product.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Image
                              src={product.images[0]?.url ?? noPicture}
                              alt={description?.title ?? "no-image"}
                              width={48}
                              height={48}
                              className="rounded object-cover"
                            />
                            {description?.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.status === ProductStatus.PUBLISHED ? "green" : "red"} size="sm">
                            {product.status === ProductStatus.PUBLISHED ? "Publié" : "Non publié"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                              <Popover open={deletePopoverOpen === product.id} onOpenChange={(open) => setDeletePopoverOpen(open ? product.id : null)} >
                                <PopoverTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletePopoverOpen(product.id);
                                    }}
                                    className="p-2 hover:bg-red-100 rounded"
                                  >
                                    <Trash size={16} className="text-red-500" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72" onClick={(e) => e.stopPropagation()}>
                                  <p className="text-sm mb-4">
                                    Êtes-vous sûr de vouloir retirer ce produit du pack ?
                                  </p>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletePopoverOpen(null);
                                      }}
                                    >
                                      Annuler
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        await handleRemoveProduct(product.id);
                                        toast({
                                          title: "Succès",
                                          description: "Le produit a été supprimé de ce pack avec succès",
                                        });
                                                                        
                                        setDeletePopoverOpen(null);
                                      }}
                                    >
                                      Supprimer
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                      {disabled ? "Aucun produit dans le pack" : "Aucun produit sélectionné"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
