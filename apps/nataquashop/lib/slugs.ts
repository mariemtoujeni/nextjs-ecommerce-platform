function removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  
  export function generateSlug(name: string, id: number): string {
    const formattedName = removeAccents(name)
      .toLowerCase()
      .replace(/['’]/g, '-') // apostrophes → tiret
      .replace(/\s+/g, '-')  // espaces → tiret
      .replace(/\//g, '-') // slash → tiret
      .replace(/[^a-z0-9-]/g, '') // supprime caractères spéciaux sauf tirets
      .replace(/--+/g, '-') // remplace les doubles tirets éventuels
      .replace(/^-+|-+$/g, ''); // supprime tirets au début/fin
  
    return `${id}-${formattedName}`;
  }
  