
import {
    Admin, Settings, Product, Event, UserWithPassword, ShipmentConf, Country, CountryCode, ShipmentZoneCountry, Category
    , SubCategory, Attribut, AttributFilter, AttributValue, FilterAttribute, ProductAlert, ModelAdmin, ApiKey, Opinion, Store, ProductDescription
    , CollectionProduct, Collection, Checkout, Shop, ShopLine, CheckoutLine, Brand, Supplier, ProductAdmin,
    Client, Quotation, Club, ClientAddress, Order, Return, CreditNote, Discount, Address, ModelAttributValue, ProductWithAdmin, PurchaseOrder,
    Inventory,
    InventoryLine,
    Cart, Stock, ModelProduct, PurchaseOrderLine, ProductOnlineShop, Customization, DiscountLine, StoreMenuLine,
    DiscountCart, OrderLine,
    DeliveryCart} from "../../models";

type ProductStores = {
    productId: number;
    storeId: number;
}


class MemoryStorage {
    users: UserWithPassword[] = [];
    accessSettings: Admin[] = [];
    countries: Country[] = [];
    countriesWithoutTva: CountryCode[] = [];
    shipmentConfs: ShipmentConf[] = [];
    shipmentsZonesCountries: ShipmentZoneCountry[] = [];
    config: Settings;
    products: Product[] = [];
    productsWithAdmin: ProductWithAdmin[] = [];
    clients: Client[] = [];
    orders: Order[] = [];
    orderLines: OrderLine[] = [];
    returns: Return[] = [];
    creditNotes: CreditNote[] = [];
    discounts: Discount[] = [];
    addresses: Address[] = [];
    attributs: Attribut[] = [];
    filtres: AttributFilter[] = [];
    attribut_valeurs: AttributValue[] = [];
    filtres_attributs: FilterAttribute[] = [];
    categories: Category[] = [];
    subCategories: SubCategory[] = [];
    stores: Store[] = [];
    events: Event[] = [];
    productAlerts: ProductAlert[] = [];
    models: ModelAdmin[] = [];
    model_attribut_valeurs: ModelAttributValue[] = [];
    apiKeys: ApiKey[] = [];
    product_descriptions: ProductDescription[] = [];
    collection_products: CollectionProduct[] = [];
    collections: Collection[] = [];
    checkouts: Checkout[] = [];
    opinions: Opinion[] = [];
    checkoutLines: CheckoutLine[] = [];
    shops: Shop[] = [];
    shopLines: ShopLine[] = [];
    quotations: Quotation[] = [];
    clubs: Club[] = [];
    client_addresses: ClientAddress[] = [];
    brands: Brand[] = [];
    suppliers: Supplier[] = [];
    purchaseOrders: PurchaseOrder[] = [];
    cart: Cart[] = [];
    stocks: Stock[] = [];
    modelProduct: ModelProduct[] = [];
    productAdmin: ProductAdmin[] = [];
    inventory: Inventory[] = [];
    inventoryLine: InventoryLine[] = [];
    purchaseOrderLines: PurchaseOrderLine[] = [];
    discountLines: DiscountLine[] = [];
    productStores: ProductStores[] = [];
    productOnlineShopes: ProductOnlineShop[] = [];
    productCustomizations: (Customization & { productId: number })[] = [];
    productAttributes: { productId: number, attributeId: number }[] = [];
    productAttributeValues: { productId: number, attributeId: number, attributeValueId: number }[] = [];
    storeMenuLines: StoreMenuLine[] = [];
    discountCarts: DiscountCart[] = [];
    deliveryCarts: DeliveryCart[] = [];
    

    constructor() {
        this.users = [];
        this.accessSettings = [];
        this.countries = [];
        this.countriesWithoutTva = [];
        this.shipmentConfs = [];
        this.shipmentsZonesCountries = [];
        this.attributs = [];
        this.filtres = [];
        this.attribut_valeurs = [];
        this.filtres_attributs = [];
        this.product_descriptions = [];
        this.collection_products = [];
        this.collections = [];
        this.models = [];
        this.model_attribut_valeurs = [];
        this.apiKeys = [];
        this.opinions = [];
        this.categories = [];
        this.stores = [];
        this.subCategories = [];
        this.checkouts = [];
        this.shops = [];
        this.shopLines = [];
        this.checkoutLines = [];
        this.clients = [];
        this.config = {} as Settings;
        this.products = [];
        this.clients = [];
        this.quotations = [];
        this.clubs = [];
        this.client_addresses = [];
        this.brands = [];
        this.suppliers = [];
        this.productAlerts = [];
        this.purchaseOrders = [];
        this.cart = [];
        this.stocks = [];
        this.modelProduct = [];
        this.productAdmin = [];
        this.productAlerts= [];
        this.inventory = [];
        this.inventoryLine = [];
        this.stocks = [];
        this.purchaseOrderLines = [];
        this.discounts = [];
        this.discountLines = [];
        this.productStores = [];
        this.productOnlineShopes = [];
        this.productCustomizations = [];
        this.productAttributes = [];
        this.returns = [];
        this.storeMenuLines = [];
        this.discountCarts = [];
        this.orderLines = [];
        this.deliveryCarts = [];
    }

    clear() {
        this.users = [];
        this.products = [];
        this.categories = [];
        this.stores = [];
        this.subCategories = [];
        this.accessSettings = [];
        this.shipmentConfs = [];
        this.countries = [];
        this.countriesWithoutTva = [];
        this.shipmentsZonesCountries = [];
        this.attributs = [];
        this.filtres = [];
        this.attribut_valeurs = [];
        this.filtres_attributs = [];
        this.events = [];
        this.models = [];
        this.model_attribut_valeurs = [];
        this.apiKeys = [];
        this.product_descriptions = [];
        this.collection_products = [];
        this.collections = [];
        this.opinions = [];
        this.checkouts = [];
        this.shops = [];
        this.shopLines = [];
        this.checkoutLines = [];
        this.clients = [];
        this.config = {} as Settings;
        this.productAlerts = [];
        this.clients = [];
        this.quotations = [];
        this.clubs = [];
        this.client_addresses = [];
        this.brands = [];
        this.suppliers = [];
        this.purchaseOrders = [];
        this.cart = [];
        this.stocks = [];
        this.modelProduct = [];
        this.productAdmin = [];
        this.inventory = [];
        this.inventoryLine = [];
        this.stocks = [];
        this.purchaseOrderLines = [];
        this.discounts = [];
        this.discountLines = [];
        this.productStores = [];
        this.productOnlineShopes = [];
        this.productCustomizations = [];
        this.productAttributes = [];
        this.returns=[];
        this.storeMenuLines = [];
        this.discountCarts = [];
        this.orderLines = [];
        this.deliveryCarts = [];
    }
}

export const SharedMemory = new MemoryStorage();