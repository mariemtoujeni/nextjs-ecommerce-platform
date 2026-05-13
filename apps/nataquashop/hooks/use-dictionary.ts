"use client"

import { useParams } from "next/navigation"
import { getDictionary } from "~/app/dictionaries"
import { useEffect, useState } from "react"
import type { dictionary } from "~/app/dictionaries"

export function useDictionary() {
  const params = useParams()
  const [dict, setDict] = useState<dictionary | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const lang = params.lang as 'fr' | 'en'
        const dictionary = await getDictionary(lang)
        setDict(dictionary)
      } catch (error) {
        console.error('Erreur lors du chargement du dictionnaire:', error)
        // Fallback vers le français en cas d'erreur
        const fallbackDict = await getDictionary('fr')
        setDict(fallbackDict)
      } finally {
        setLoading(false)
      }
    }
    
    loadDictionary()
  }, [params.lang])
  
  return { dict, loading }
} 