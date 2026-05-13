// apps/nataquashop/lib/slugify.ts

export function slugify(id: number, name: string): string {
  return `${id}-${name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")}`;
}
