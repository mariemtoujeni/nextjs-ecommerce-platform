import { Langs } from '../utils'

const dictionaries = {
  'fr': () => import('./fr.json').then(module => module.default),
  'en': () => import('./en.json').then(module => module.default),
}
export type dictionary = Awaited<ReturnType<typeof getDictionary>>

export const getDictionary = async (locale: Langs) => {
  const dictionary = dictionaries[locale]
  if (!dictionary) {
    console.warn(`Dictionary for locale "${locale}" not found, falling back to French`)
    return dictionaries['fr']()
  }
  return dictionary()
} 