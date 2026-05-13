'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '~/lib/utils';
import { Input } from './ui';

interface PriceSelectorProps {
  prices?: string[];
  selectedPrices?: number[];
  onPriceChange?: (prices: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export default function PriceSelector({ 
  prices = [], 
  selectedPrices = [10, 595], 
  onPriceChange,
  min = 0,
  max = 1000,
  step = 1,
  className 
}: PriceSelectorProps) {
  const [minPrice, setMinPrice] = useState<number>(selectedPrices[0] || min);
  const [maxPrice, setMaxPrice] = useState<number>(selectedPrices[1] || max);
  const [minInputValue, setMinInputValue] = useState<string>((selectedPrices[0] || min).toString());
  const [maxInputValue, setMaxInputValue] = useState<string>((selectedPrices[1] || max).toString());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedPrices.length >= 2) {
      setMinPrice(selectedPrices[0] || min);
      setMaxPrice(selectedPrices[1] || max);
      setMinInputValue((selectedPrices[0] || min).toString());
      setMaxInputValue((selectedPrices[1] || max).toString());
    }
  }, [selectedPrices, min, max]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Debounced function to call onPriceChange
  const debouncedPriceChange = useCallback((newMin: number, newMax: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onPriceChange?.([newMin, newMax]);
    }, 500); // 500ms delay
  }, [onPriceChange]);

  const handleMinChange = (value: number) => {
    const newMin = Math.max(Math.min(value, maxPrice - step), min);
    setMinPrice(newMin);
    setMinInputValue(newMin.toString());
    debouncedPriceChange(newMin, maxPrice);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.min(Math.max(value, minPrice + step), max);
    setMaxPrice(newMax);
    setMaxInputValue(newMax.toString());
    debouncedPriceChange(minPrice, newMax);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setMinInputValue(inputValue);
    
    // Allow empty input temporarily
    if (inputValue === '') {
      return;
    }
    
    // Replace comma with dot for French number format
    const normalizedValue = inputValue.replace(',', '.');
    const value = parseFloat(normalizedValue);
    
    // Only update if it's a valid number
    if (!isNaN(value)) {
      handleMinChange(value);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setMaxInputValue(inputValue);
    
    // Allow empty input temporarily
    if (inputValue === '') {
      return;
    }
    
    // Replace comma with dot for French number format
    const normalizedValue = inputValue.replace(',', '.');
    const value = parseFloat(normalizedValue);
    
    // Only update if it's a valid number
    if (!isNaN(value)) {
      handleMaxChange(value);
    }
  };

  // Handle input focus - allow free typing
  const handleMinFocus = () => {
    setMinInputValue(minPrice.toString());
  };

  const handleMaxFocus = () => {
    setMaxInputValue(maxPrice.toString());
  };

  // Handle input blur - validate and format
  const handleMinBlur = () => {
    const value = parseFloat(minInputValue.replace(',', '.'));
    if (!isNaN(value)) {
      handleMinChange(value);
    } else {
      setMinInputValue(minPrice.toFixed(2).toString());
    }
  };

  const handleMaxBlur = () => {
    const value = parseFloat(maxInputValue.replace(',', '.'));
    if (!isNaN(value)) {
      handleMaxChange(value);
    } else {
      setMaxInputValue(maxPrice.toFixed(2).toString());
    }
  };

  const percentageMin = ((minPrice - min) / (max - min)) * 100;
  const percentageMax = ((maxPrice - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Slider Range */}
      <div className="relative px-2 mt-7">
        <div className="relative h-2 bg-gray-200 rounded-full">
          {/* Track between handles */}
          <div 
            className="absolute h-2 bg-teal-600 rounded-full"
            style={{
              left: `${percentageMin}%`,
              width: `${percentageMax - percentageMin}%`
            }}
          />
          
          {/* Min Handle */}
          <div
            className="absolute w-5 h-5 bg-white border-2 border-teal-600 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform"
            style={{
              left: `calc(${percentageMin}% - 10px)`,
              top: '-6px',
              zIndex: 5
            }}
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startValue = minPrice;
              const range = max - min;
              const sliderWidth = e.currentTarget.parentElement?.parentElement?.offsetWidth || 0;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaPercent = (deltaX / sliderWidth) * 100;
                const deltaValue = (deltaPercent / 100) * range;
                const newValue = Math.max(Math.min(startValue + deltaValue, maxPrice - step), min);
                handleMinChange(Number(newValue.toFixed(2)));
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          
          {/* Max Handle */}
          <div
            className="absolute w-5 h-5 bg-white border-2 border-teal-600 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform"
            style={{
              left: `calc(${percentageMax}% - 10px)`,
              top: '-6px',
              zIndex: 4
            }}
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startValue = maxPrice;
              const range = max - min;
              const sliderWidth = e.currentTarget.parentElement?.parentElement?.offsetWidth || 0;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaPercent = (deltaX / sliderWidth) * 100;
                const deltaValue = (deltaPercent / 100) * range;
                const newValue = Math.min(Math.max(startValue + deltaValue, minPrice + step), max);
                handleMaxChange(Number(newValue.toFixed(2)));
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </div>
      </div>

      {/* Input Fields */}
      <div className="flex gap-3 px-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">Min</label>
          <Input
            type="text"
            value={minInputValue}
            onChange={handleMinInputChange}
            onFocus={handleMinFocus}
            onBlur={handleMinBlur}
            placeholder={`Min (${min})`}
            className="text-center"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">Max</label>
          <Input
            type="text"
            value={maxInputValue}
            onChange={handleMaxInputChange}
            onFocus={handleMaxFocus}
            onBlur={handleMaxBlur}
            placeholder={`Max (${max})`}
            className="text-center"
          />
        </div>
      </div>

    </div>
  );
}
