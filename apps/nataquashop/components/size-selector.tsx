'use client';

import { useState, useEffect } from 'react';
import { cn } from '~/lib/utils';
import ExpandableList from './expandable-list';

interface SizeSelectorProps {
  sizes: string[];
  selectedSizes?: string[];
  onSizeChange?: (sizes: string[]) => void;
  multiple?: boolean;
  className?: string;
}

export default function SizeSelector({ 
  sizes, 
  selectedSizes = [], 
  onSizeChange,
  multiple = true,
  className 
}: SizeSelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedSizes);

  // Synchronize local state with external selectedSizes prop
  useEffect(() => {
    setSelected(selectedSizes);
  }, [selectedSizes]);

  const handleSizeClick = (size: string) => {
    let newSelected: string[];
    
    if (multiple) {
      if (selected.includes(size)) {
        newSelected = selected.filter(s => s !== size);
      } else {
        newSelected = [...selected, size];
      }
    } else {
      newSelected = selected.includes(size) ? [] : [size];
    }
    
    setSelected(newSelected);
    onSizeChange?.(newSelected);
  };

  return (
    <ExpandableList 
      items={sizes}
      getKey={(size) => size}
      defaultVisible={8} // Affiche 2 lignes de 4 éléments par défaut
      step={4} // Ajoute une ligne de 4 éléments à chaque clic
      className={className}
      layout="grid"
      gridCols={4}
      renderItem={(size) => (
        <button
          key={size}
          onClick={() => handleSizeClick(size)}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200",
            "hover:scale-105 hover:shadow-md",
            selected.includes(size)
              ? "bg-purple-600 text-white border-purple-600 shadow-md"
              : "bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:text-purple-600"
          )}
        >
          {size}
        </button>
      )}
    />
  );
}
