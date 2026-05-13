import { Address, CheckoutStatus, Client, ClientAddress, ClientType, Club, CreateCheckoutLineRequest, CreateCheckoutRequest, DiscountType, PaymentMethod, ShopPresenter, ShopStatus } from "@repo/core/models"

export const defaultShop : ShopPresenter = {
    id: 0,
    name: '',
    expirationDate: new Date(),
    isActive: false,
    createdAt: new Date(),
    status: ShopStatus.OPEN,
    department: '',
}

export const defaultClub : Club = {
    id: 0,
    name: '',
    president: '',
    email: '',
    accountantAccount: '',
    paymentMode: 0,
    paymentDelay: 0,
    phone: '',
    partner: false,
    referent: "",
    code: "",
    valid: false,
    siren: "",
    tvaNumber: ""
}

export const defaultClientAddress : Address = {
    id: 0,
    numero_client: 0,
    designation: "",
    civilite: "",
    nom: "",
    prenom: "",
    adresse: "",
    adresse2: "",
    adresse3: "",
    code_postal: "",
    ville: "",
    pays: "",
    interphone: "",
    code_porte: "",
    instructions: "",
    default: false,
    created_at: new Date(),
    updated_at: new Date(),
    societe: ""
}

export const defaultClient : Client = {
    clientNumber: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobilePhone: '',
    workPhone: '',
    clubMemberId: 0,
    clubId: 0,
    club: defaultClub,
    type: ClientType.CLIENT,
    lang: 'fr',
    birthDate: new Date(),
    newsLetter: false,
    siteOffer: false,
    partnerOffer: false,
    fidelityPoints: 0,
    credit: 0,
    clientAddress: [defaultClientAddress],
    order: [],
    quotation: [],
    createdAt: new Date(),
    userId: ''
}

export const defaultCheckout : CreateCheckoutRequest = {
    idClient: defaultClient.clientNumber,
    idShop: defaultShop.id,
    paymentMethod: PaymentMethod.CASH,
    discountType: DiscountType.PERCENTAGE,
    discountAmount: '0',
    totalHT: '0',
    totalTTC: '0',
    cbAmount: '0',
    cashAmount: '0',
    checkAmount: '0',
    NoVAT: false,
    status: CheckoutStatus.OPEN,
    lines: [] as CreateCheckoutLineRequest[],
    shop: defaultShop,
    client: defaultClient            
}