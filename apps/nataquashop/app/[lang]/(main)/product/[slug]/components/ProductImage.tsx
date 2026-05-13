"use client";
import React, { useEffect, useState } from "react";
import { Button, Heading } from "~/components/ui";
import { ModalImageViewer } from "./ModalImageViewer";
import { Opinion, Product } from "@repo/core/models";
import { useProductSelection } from "./ProductSelectionContext";
import Link from "next/link";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { extractTextFromLexical, isJsonString } from "../utils/textformat";
import { FaRegStar, FaStar, FaStarHalf } from "react-icons/fa6";
import { dictionary } from "~/app/dictionaries";
interface ProductImagesProps {
  product: Product;
  translations: dictionary;
  avg_note: number |null;
  reviews: Opinion[];
}

export const ProductImages = ( { translations, product, avg_note, reviews }: ProductImagesProps) => {
  const [showModal, setShowModal] = useState(false);
  const { currentImageUrl } = useProductSelection();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (index: number) => { 
    setCurrentImageIndex(index); 
    setShowModal(true);
  };

  const [backUrl, setBackUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedUrl = localStorage.getItem("lastProductListUrl");
    if (savedUrl) {
      setBackUrl(savedUrl);
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row w-full h-full lg:h-[600px]">
      <div className="relative h-full md:w-2/3 bg-graylight flex items-center justify-center">
        {/* Lien "Retour" en haut à gauche */}
        {backUrl && (
          <div className="absolute top-2 left-2 z-20">
            <Link href={backUrl}>
              <Button variant="link" size="sm">
                ← {translations.product.back}
              </Button>
            </Link>
          </div>
        )}

        {/* Conteneur des images */}
        <div className="max-h-full flex items-center justify-center" onClick={() => openModal(0)}>
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Product image"
              className="max-h-[95%] max-w-[95%] object-contain cursor-pointer mix-blend-multiply"
            />
          ) : product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]?.url}
              alt="Fallback product image"
              className="max-h-[95%] max-w-[95%] object-contain cursor-pointer mix-blend-multiply"
              
            />
          ) : (
            <div className="flex items-center justify-center h-[200px] w-[200px] bg-gray-100 text-gray-400">
              {translations.product.availableImage}
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-full md:w-1/3 flex flex-row md:flex-col items-center">
        {/* Tous IMAGE */}
        <div className="relative w-1/2 md:w-full h-full md:h-1/2 flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[0]?.url}
                alt="Image principale"
                onClick={() => openModal(0)}
                className="w-full h-full p-4 object-contain cursor-pointer"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openModal(0)}
                >
                  {translations.product.similarProducts.allPictures}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] w-[200px] bg-gray-100 text-gray-400">
              {translations.product.availableImage}
            </div>
          )}
        </div>
        {/* Avis */}
        <div className="relative bg-black w-1/2 h-full md:h-1/2 md:w-full text-lime flex items-center justify-between px-4 sm:px-8">
          <div className="flex flex-col">
            {avg_note === null ? (
              <div className="text-center w-full">
                {translations.review.title}
              </div>
            ) : (
              <>
                <div className="absolute top-3 left-3 space-y-2">
                  <div className="text-sm sm:text-base flex gap-1">
                    {(() => {
                      const fullStars = Math.floor(avg_note);
                      const halfStar = avg_note % 1 >= 0.5;
                      const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

                      return (
                        <>
                          {[...Array(fullStars)].map((_, i) => (
                            <FaStar key={`full-${i}`} />
                          ))}
                          {halfStar && <FaStarHalf key="half" />}
                          {[...Array(emptyStars)].map((_, i) => (
                            <FaRegStar key={`empty-${i}`} />
                          ))}
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-8xl sm:text-8xl font-extrabold leading-none tracking-tight">
                    <span className="inline-block">
                      {avg_note.toFixed(1).replace('.', ',')}
                    </span>
                    <span className="text-sm font-thin">/{"  "}5</span>
                  </div>


                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size={"default"} className="absolute bottom-3 left-3 border-lime text-lime hover:bg-transparent hover:text-lime hover:border-lime ">
                      {translations.product.review} ({reviews.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogTitle>
                      <div className="flex items-center justify-between px-4 pt-4 md:px-4 md:pt-4 pb-4">
                        <Heading heading="5">{translations.review.reviews}</Heading>
                      </div>
                    </DialogTitle>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto space-y-6 px-4 md:px-8 pb-8">
                      {reviews.map((review, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-100 rounded-xl p-4 shadow-sm border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm sm:text-base">
                              {review.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString("fr-FR")
                                : "Date inconnue"}
                            </span>
                          </div>
                          <div className="text-yellow-500 text-sm mb-2 flex gap-0.5">
                            {[...Array(Math.floor(review.rating))].map((_, i) => (
                              <FaStar key={`full-${i}`} />
                            ))}
                            {review.rating % 1 >= 0.5 && <FaStarHalf key="half" />}
                            {[...Array(5 - Math.ceil(review.rating))].map((_, i) => (
                              <FaRegStar key={`empty-${i}`} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700">
                            {typeof review.text === "string" && isJsonString(review.text)
                              ? extractTextFromLexical(JSON.parse(review.text))
                              : typeof review.text === "object"
                              ? extractTextFromLexical(review.text)
                              : review.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-4 px-4 py-2 md:px-8 border-t border-gray-200">
                      <DialogClose asChild>
                        <Button variant="outline">{translations.review.close}</Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

      </div>
      {showModal && product && (
        <ModalImageViewer
          images={product.images}
          currentIndex={currentImageIndex}
          onClose={() => setShowModal(false)}
          onNext={() =>
            setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
          }
          onPrev={() =>
            setCurrentImageIndex(
              (prev) => (prev - 1 + product.images.length) % product.images.length
            )
          }
        />
      )}

    </div>
  );
};
