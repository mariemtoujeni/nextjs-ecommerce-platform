"use client";
import { useState } from "react";
import { Customization } from "@repo/core/models";
import { Switch } from "~/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui";
import { dictionary } from "~/app/dictionaries";


interface PersoProps {
  message: string;
  customization: Record<string, Customization[]>;
  selectedCustomization: Customization | null;
  setSelectedCustomization: (value: Customization | null) => void;
  translations: dictionary;
  onTextChange : (text: string) => void;
  onDescriptionChange?: (description: string) => void;
}

type SelectedOption = {
  groupKey: string;
  customization: Customization;
} | null;

export const Personnalization = ({ message, customization, selectedCustomization , setSelectedCustomization, translations, onTextChange,onDescriptionChange }: PersoProps) => {
  const [showDescrip, setShowDescrip] = useState(false);
  const [selected, setSelected] = useState<SelectedOption>(null);
  const [text, setText] = useState("");

   const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {    
    setText(e.target.value);
    onTextChange?.(e.target.value); 
  };

  const handleSelect = (value: string) => {
    const [groupKey, idStr] = value.split("__");
    const id = Number(idStr);
    if (groupKey && customization[groupKey]) {
      const option = customization[groupKey].find(opt => opt.id === id);
      if (option) {
        setSelected({ groupKey, customization: option });
        setSelectedCustomization(option);        
        onDescriptionChange?.(option.description);
      } else {
        setSelected(null);
        setSelectedCustomization(null);
        onDescriptionChange?.("");
      }
    } else {
      setSelected(null);
      setSelectedCustomization(null);
    }
  };

  // Fusionne toutes les options en une seule liste
  const allOptions = Object.entries(customization).flatMap(
    ([groupKey, options]) =>
      options.map(opt => ({
        groupKey,
        option: opt,
      }))
  );
  const currentValue = selected
    ? `${selected.groupKey}__${selected.customization.id}`
    : "";

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-4">
        <span>{message}</span>
        <Switch
          checked={showDescrip}
          onCheckedChange={(checked) => {
            setShowDescrip(checked);
            if (!checked) {
              setSelected(null);
              setSelectedCustomization(null);
            }
          }}
        />
      </div>

      {showDescrip && (
        <div className="mt-4">
          <Select value={currentValue} onValueChange={handleSelect}>
            <SelectTrigger>
              <SelectValue placeholder={translations.product.similarProducts.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {allOptions.map(({ groupKey, option }) => (
                <SelectItem
                  key={`${groupKey}__${option.id}`}
                  value={`${groupKey}__${option.id}`}
                >
                  {option.description} {" "} {option.price} €
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Ajout du texte personnalisé  */} 
          <p className="mt-5">{translations.product.personnalization.description}</p>          
          <textarea
          id="customText"
          placeholder={translations.product.personnalization.placeholder}
          rows={3}
          maxLength={150}
          value={text}
          onChange={handleTextChange}
          className="w-full border-black mt-2 "></textarea>          
        </div>
        
        

      )}
    </div>
  );
};