import { ErrorCodes } from "./error";
export const Environment = {
    TEST: 'test',
    DEV: 'development',
    PROD: 'production'
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];

export const redirectToUrls = {
    [Environment.DEV]: 'http://localhost:3000/invite',
    [Environment.TEST]: 'https://dev.admin.nataquashop.com/invite',
    [Environment.PROD]: 'https://admin.nataquashop.com/invite'
}

export type ReturnAll<T> = {
    total: number;
    count: number;
    items: T[];
    error?: string;
}

export type ReturnOne<T> = {
    item: T;
    error?: string;
}

export type GenericFilterValue = {
    id: number | string;
    name: string;
}

export type GenericFilter = {
    key: string;
    text: string;
    values?: GenericFilterValue[]
    children?: GenericFilter[]
}

export type ActiveFilter = {
    key: string;
    values: string[] | ActiveFilter[];
}

export type SearchParams = Promise<{[key: string]: string | undefined}>;

export const BATCH_SIZE = 100;

export function chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}


const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const generateRandomString = (length: number) => {
    return Array.from({length}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

function getRandomChar(chars: string): string {
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

export function generateSecurePassword(length = 12): string {
  if (length < 8) throw new Error("Password must be at least 8 characters long.");
  // Guarantee 1 char from each required group
  const required = [
    getRandomChar(UPPER),
    getRandomChar(LOWER),
    getRandomChar(DIGITS),
    getRandomChar(SYMBOLS),
  ];
  // Fill the rest with random chars from ALL
  const remaining = Array.from({ length: length - 4 }, () => getRandomChar(ALL));
  const password = [...required, ...remaining] ;
  password.sort(() => Math.random() - 0.5);

  return password.join('');
}

export const departmentsMap = {
    1: 'Ain',
    2: 'Aisne',
    3: 'Allier',
    4: 'Alpes-de-Haute-Provence',
    5: 'Hautes-Alpes',
    6: 'Alpes-Maritimes',
    7: 'Ardèche',
    8: 'Ardennes',
    9: 'Ariège',
    10: 'Aube',
    11: 'Aude',
    12: 'Aveyron',
    13: 'Bouches-du-Rhône',
    14: 'Calvados',
    15: 'Cantal',
    16: 'Charente',
    17: 'Charente-Maritime',
    18: 'Cher',
    19: 'Corrèze',
    20: 'Corse-du-Sud',
    21: 'Haute-Corse',
    22: 'Haute-Garonne',
    23: 'Haute-Loire',
    24: 'Haute-Marne',
    25: 'Haute-Saône',
    26: 'Haute-Savoie',
    27: 'Haute-Vienne',
    28: 'Hautes-Alpes',
    29: 'Hautes-Pyrénées',
    30: 'Gard',
    31: 'Haute-Garonne',
    32: 'Gers',
    33: 'Gironde',
    34: 'Hérault',
    35: 'Haute-Loire',
    36: 'Haute-Marne',
    37: 'Haute-Saône',
    38: 'Haute-Savoie',
    39: 'Haute-Vienne',
    40: 'Landes',
    41: 'Loir-et-Cher',
    42: 'Loire',
    43: 'Haute-Loire',
    44: 'Loire-Atlantique',
    45: 'Loiret',
    46: 'Lot',
    47: 'Lot-et-Garonne',
    48: 'Lozère',
    49: 'Maine-et-Loire',
    50: 'Manche',
    51: 'Marne',
    52: 'Haute-Marne',
    53: 'Mayenne',
    54: 'Meurthe-et-Moselle',
    55: 'Meuse',
    56: 'Morbihan',
    57: 'Moselle',
    58: 'Nièvre',
    59: 'Nord',
    60: 'Oise',
    61: 'Orne',
    62: 'Pas-de-Calais',
    63: 'Puy-de-Dôme',
    64: 'Pyrénées-Atlantiques',
    65: 'Hautes-Pyrénées',
    66: 'Pyrénées-Orientales',
    67: 'Bas-Rhin',
    68: 'Haut-Rhin',
    69: 'Rhône',
    70: 'Haute-Saône',
    71: 'Saône-et-Loire',
    72: 'Sarthe',
    73: 'Savoie',
    74: 'Haute-Savoie',
    75: 'Paris',
    76: 'Seine-Maritime',
    77: 'Seine-et-Marne',
    78: 'Yvelines',
    79: 'Deux-Sèvres',
    80: 'Somme',
    81: 'Tarn',
    82: 'Tarn-et-Garonne',
    83: 'Var',
    84: 'Vaucluse',
    85: 'Vendée',
    86: 'Vienne',
    87: 'Haute-Vienne',
    88: 'Vosges',
    89: 'Yonne',
    90: 'Territoire-de-Belfort',
    91: 'Essonne',
    92: 'Hauts-de-Seine',
    93: 'Seine-Saint-Denis',
    94: 'Val-de-Marne',
    95: 'Val-d\'Oise',
}
export function getFrenchDepartmentName(department: number): string {    
    return departmentsMap[department as keyof typeof departmentsMap] || 'Inconnu';
}

export function formatNumber(valeur: string): string {
    let newValue = valeur;
        
        // Si la valeur est vide ou juste un point, laisser passer
        if (newValue === '' || newValue === '.') {
            newValue = '0';
        } else if (newValue.startsWith('.')) {
            // Si ça commence par un point, ajouter un 0 devant
            newValue = '0' + newValue;
        } else if (newValue.startsWith('-')) {
            // Si c'est négatif, mettre à 0
            newValue = '0';
        } else {
            // Vérifier que c'est un nombre valide
            const numValue = parseFloat(newValue);
            if (isNaN(numValue) || numValue < 0) {
                newValue = '0';
            } else {
                newValue = valeur;
            }
        }

        return newValue;
}

export interface BodyResponse {
  success: boolean;
  message?: string;
  error?: ErrorCodes;
  code?: string;
  data?: any;
  pubKey?: any;
}

export function generateToken(size = 32) {
      const array = new Uint8Array(size);
      crypto.getRandomValues(array);
      return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
    }

export type ResetPasswordResult = {
  success: boolean;
  error?: string;
};

export type UserToken = {
    id_user: string; 
    reset_password_expires_at: string; 
    email: string;
}
