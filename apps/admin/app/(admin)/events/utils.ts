export type Tab = "Brouillon" | "Publié" | "Dépublié" | "A venir";
export const TABS: Tab[] = ["Brouillon", "Publié", "Dépublié", "A venir"];
export enum EventStatus {Draft = 0,Published = 1,Unpublished = 2,Coming = 3}
export const statusgroup = [0, 1, 2, 3]; // Brouillon -> Publié -> Dépublié -> A venir
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
export const DATE_VALIDATION = "Attention : la date de fin de l’évènement ne peut être antérieur à la date de démarrage de l’évènement"