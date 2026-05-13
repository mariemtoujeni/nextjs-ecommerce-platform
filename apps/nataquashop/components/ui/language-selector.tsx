"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "~/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import "flag-icons/css/flag-icons.min.css"

// Types pour les langues disponibles
type Language = "fr" | "en"

// Configuration des langues avec leurs codes de drapeaux et noms
const LANGUAGES = {
  fr: {
    flagCode: "fr",
    name: "Français",
  },
  en: {
    flagCode: "gb", 
    name: "English",
  },
} as const

// Hook personnalisé pour gérer la langue avec le routing Next.js
function useLanguage() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Extraire la langue actuelle du pathname
  const getCurrentLanguage = (): Language => {
    const segments = pathname.split('/')
    const lang = segments[1] as Language
    return LANGUAGES[lang] ? lang : 'fr'
  }
  
  const [language, setLanguage] = React.useState<Language>(getCurrentLanguage)
  
  // Fonction pour changer la langue et naviguer
  const changeLanguage = React.useCallback((newLanguage: Language) => {
    setLanguage(newLanguage)
    
    // Construire le nouveau chemin en remplaçant la langue
    const segments = pathname.split('/')
    segments[1] = newLanguage
    const newPath = segments.join('/')
    
    // Naviguer vers la nouvelle URL
    router.push(newPath)
  }, [pathname, router])
  
  // Mettre à jour la langue quand le pathname change
  React.useEffect(() => {
    setLanguage(getCurrentLanguage())
  }, [pathname])
  
  return { language, changeLanguage }
}

// Interface pour les props du composant
interface LanguageSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function LanguageSelector({ className, ...props }: LanguageSelectorProps) {
  const { language, changeLanguage } = useLanguage()

  return (
    <div className={cn("flex items-center", className)} {...props}>
      <Select value={language} onValueChange={changeLanguage}>
        {/* Trigger personnalisé qui affiche seulement le drapeau */}
        <SelectTrigger className="flex items-center justify-center h-9 w-9 p-0 border-0 bg-transparent hover:bg-accent [&>svg]:hidden">
          <SelectValue>
            <span 
              className={cn(
                "fi", 
                `fi-${LANGUAGES[language].flagCode}`,
                "w-5 max-w-5 h-5 rounded-full overflow-hidden"
              )}
              role="img" 
              aria-label={LANGUAGES[language].name}
            />
          </SelectValue>
        </SelectTrigger>
        
        {/* Contenu du menu déroulant */}
        <SelectContent>
          <SelectItem value="fr">
            <div className="flex items-center gap-2">
              <span 
                className="fi fi-fr w-5 h-5 rounded-full overflow-hidden"
                role="img" 
                aria-label="Français"
              />
              <span>Français</span>
            </div>
          </SelectItem>
          <SelectItem value="en">
            <div className="flex items-center gap-2">
              <span 
                className="fi fi-gb w-5 h-5 rounded-full overflow-hidden"
                role="img" 
                aria-label="English"
              />
              <span>English</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 