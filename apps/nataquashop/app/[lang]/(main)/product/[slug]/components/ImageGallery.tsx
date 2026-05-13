import React from "react";
import { Button } from "~/components/ui";


interface ImageGalleryProps {
  images: any[];
  setMainImageIndex: (index: number) => void;
  mainImageIndex: number;
  openModal: (index: number) => void;
  translations: {
    allPictures: string;
  };
}

export const ImageGallery = ({
  images,
  setMainImageIndex,
  mainImageIndex,
  openModal,
  translations,
}: ImageGalleryProps) => {
  const mainImage = images[mainImageIndex] || images[0];

  return (
    <div className="flex flex-col items-center gap-4">  
    
      {/* Image principale avec bouton centré */}
      {mainImage && (
        <div className="relative w-full max-w-[400px]">
          <img
            src={mainImage.url}
            alt="Image principale"
            onClick={() => openModal(mainImageIndex)}
            className="w-full max-h-[300px] object-contain rounded-[8px] border border-[#ddd] cursor-pointer"
          />
          {/* Bouton centré */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">       
            <Button variant="secondary" size="lg" onClick={() => openModal(mainImageIndex)}>
              {translations.allPictures}
            </Button>
          </div>
          
        </div>
      )}      
    </div>
  );
};
