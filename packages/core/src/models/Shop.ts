import { z } from "zod";
import { ModelProductDetail } from "./Checkout";

export const ShopOptionsSchema = z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional().default(''),
    filters: z.array(z.object({
        key: z.string(),
        values: z.union([z.array(z.string()), z.array(z.object({
            key: z.string(),
            values: z.array(z.string())
        }))]),
    })).optional(),
});

export type ShopFilterInput = z.input<typeof ShopOptionsSchema>;
export type ShopFilter = z.infer<typeof ShopOptionsSchema>;


export enum ShopStatus {
    OPEN = 'ACTIF',
    CLOSED = 'CLOTURE',
    DRAFT = 'BROUILLON',
    FINALISED = 'FINALISE',
}

export enum ShopFilterType {
    STATUS = 'STATUS',
    DEPARTMENT = 'DEPARTMENT',
}

export enum Department {
    AIN = '01',
    AISNE = '02',
    ALLIER = '03',
    ALPES_DE_HAUTE_PROVENCE = '04',
    HAUTES_ALPES = '05',
    ALPES_MARITIMES = '06',
    ARDECHE = '07',
    ARDENNES = '08',
    ARIEGE = '09',
    AUBE = '10',
    AUDE = '11',
    AVEYRON = '12',
    BOUCHES_DU_RHONE = '13',
    CALVADOS = '14',
    CANTAL = '15',
    CHARENTE = '16',
    CHARENTE_MARITIME = '17',
    CHER = '18',
    CORREZE = '19',
    CORSE_DU_SUD = '20',
    HAUTE_CORSE = '21',
    HAUTE_GARONNE = '22',
    HAUTE_LOIRE = '23',
    HAUTE_MARNE = '24',
    HAUTE_SAONE = '25',
    HAUTE_SAVOIE = '26',
    HAUTE_VIENNE = '27',
    HAUTES_ALPES_2 = '28',
    HAUTES_PYRENEES = '29',
    GARD = '30',
    HAUTE_GARONNE_2 = '31',
    GERS = '32',
    GIRONDE = '33',
    HERAULT = '34',
    HAUTE_LOIRE_2 = '35',
    HAUTE_MARNE_2 = '36',
    HAUTE_SAONE_2 = '37',
    HAUTE_SAVOIE_2 = '38',
    JURA = '39',
    LANDES = '40',
    LOIR_ET_CHER = '41',
    LOIRE = '42',
    HAUTE_LOIRE_3 = '43',
    LOIRE_ATLANTIQUE = '44',
    LOIRET = '45',
    LOT = '46',
    LOT_ET_GARONNE = '47',
    LOZERE = '48',
    MAINE_ET_LOIRE = '49',
    MANCHE = '50',
    MARNE = '51',
    HAUTE_MARNE_3 = '52',
    MAYENNE = '53',
    MEURTHE_ET_MOSELLE = '54',
    MEUSE = '55',
    MORBIHAN = '56',
    MOSELLE = '57',
    NIEVRE = '58',
    NORD = '59',
    OISE = '60',
    ORNE = '61',
    PAS_DE_CALAIS = '62',
    PUY_DE_DOME = '63',
    PYRENEES_ATLANTIQUES = '64',
    HAUTES_PYRENEES_2 = '65',
    PYRENEES_ORIENTALES = '66',
    BAS_RHIN = '67',
    HAUT_RHIN = '68',
    RHONE = '69',
    HAUTE_SAONE_3 = '70',
    SAONE_ET_LOIRE = '71',
    SARTHE = '72',
    SAVOIE = '73',
    HAUTE_SAVOIE_3 = '74',
    PARIS = '75',
    SEINE_MARITIME = '76',
    SEINE_ET_MARNE = '77',
    YVELINES = '78',
    DEUX_SEVRES = '79',
    SOMME = '80',
    TARN = '81',
    TARN_ET_GARONNE = '82',
    VAR = '83',
    VAUCLUSE = '84',
    VENDEE = '85',
    VIENNE = '86',
    HAUTE_VIENNE_2 = '87',
    VOSGES = '88',
    YONNE = '89',
    TERRITOIRE_DE_BELFORT = '90',
    ESSONNE = '91',
    HAUTS_DE_SEINE = '92',
    SEINE_SAINT_DENIS = '93',
    VAL_DE_MARNE = '94',
    VAL_DOISE = '95'
}

export const shopInputSchema = z.object({
    name: z.string().min(1, "Name is required"),
    expirationDate: z.string().optional(),
    isActive: z.boolean().optional(),
    status: z.nativeEnum(ShopStatus).optional(),
    department: z.nativeEnum(Department).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type ShopInput = z.infer<typeof shopInputSchema>;

export type Shop = {
    id: number;
    name: string;
    expirationDate: Date;
    isActive: boolean;
    createdAt: Date;
    status: ShopStatus;
    department: string;
}

export const shopLineInputSchema = z.object({
    idModel: z.number(),
    idShop: z.number(),
    initialQuantity: z.number().min(0, "Initial quantity must be greater than 0").optional().default(0),
    soldQuantity: z.number().min(0, "Sold quantity must be greater than 0").optional().default(0),
    finalQuantity: z.number().min(0, "Final quantity must be greater than 0").optional().default(0),
    totalPriceTTC: z.number().min(0, "Total price must be greater than 0").optional().default(0),
});
    
export type ShopLineInput = z.infer<typeof shopLineInputSchema>;

export type ShopLine = {
    idModel: number;
    idShop: number;
    initialQuantity: number;
    soldQuantity: number;
    finalQuantity: number;
    totalPriceTTC: number;
}

export type ShopLineWithModel = ShopLine & {
    model: ModelProductDetail;
}

export type ShopPresenter = Shop & {
    lines?: ShopLine[];
}

export type ShopPresenterInput = ShopInput & {
    lines: ShopLineInput[];
}