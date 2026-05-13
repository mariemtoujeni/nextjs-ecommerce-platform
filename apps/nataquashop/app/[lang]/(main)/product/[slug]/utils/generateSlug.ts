import { Product } from "@repo/core/models";
interface props{
  id: number ;
  title: string;
  
}

export function generateSlug({ id, title }: props): string {
  const slugTitle = title
    .normalize('NFD')                      // Enlève les accents
    .replace(/[\u0300-\u036f]/g, '')      // Supprime les caractères diacritiques
    .toLowerCase()
    .replace(/['’]/g, '-')                // Remplace apostrophes
    .replace(/\s+/g, '-')                 // Remplace espaces par tirets
    .replace(/[^a-z0-9-]/g, '')           // Enlève tout caractère spécial
    .replace(/--+/g, '-')                 // Remplace les doubles tirets
    .replace(/^-+|-+$/g, '');             // Supprime tirets au début/fin

  return `${id}-${slugTitle}`;
}
