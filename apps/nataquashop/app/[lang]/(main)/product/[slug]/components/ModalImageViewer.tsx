import { ArrowLeft, SquareArrowLeft, SquareArrowRight, X } from "lucide-react";
import React from "react";

export const ModalImageViewer = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: any[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  if (!images || images.length === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-80 flex items-center justify-center z-[9999]"
      onClick={onClose}>
      {/* Bouton de fermeture en haut à droite */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
         className="absolute top-5 right-7 bg-transparent border-0 text-white text-2xl cursor-pointer">      
        <X color="gray" size={15} />        
      </button>

      {/* Bouton précédent */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="bg-transparent border-0 text-white text-2xl cursor-pointer mx-5">
        <SquareArrowLeft color="gray" size={30} />
      </button>

      {/* Image */}
      <img
        src={images[currentIndex]?.url}
        alt={`Image ${currentIndex + 1}`}
       className="max-h-[80vh] max-w-[80vw] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Bouton suivant */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="bg-transparent border-0 text-white text-2xl cursor-pointer mx-5">      
        <SquareArrowRight color="gray" size={30} />
      </button>
    </div>
  );
};



