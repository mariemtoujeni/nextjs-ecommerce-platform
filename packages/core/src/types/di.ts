import { IAuthenticationService, IImageUploadService, IEmailService, MailjetEmailService, IPaymentService, PaymentService
  , IStorageService, IIAService
 } from '../services';
import {
  IGeneralConfigurationsRepository, IAccessSettingRepository, ICarrierRepository, IProductRepository,
  IAttributRepository, ICategoryRepository, IEventRepository, IProductAlertRepository,
  IModelRepository, ICollectionRepository, IApiKeyRepository, IOpinionRepository,
  ISubCategoryRepository, IClientRepository, IQuotationRepository,
  IStoreRepository, ICheckoutRepository,IBrandRepository, ISupplierRepository, 
  IDiscountRepository,  ICreditNoteRepository,
  IReturnRepository, IOrderRepository, IUserRepository, IShopRepository,
  IInventoryRepository, ICartRepository, IStockRepository, IProductCustomizationRepository,
  IPurchaseOrderRepository, IGiftCardRepository
} from '../repositories';
import {
  MockImageUploadService, MockEventRepository, MockAccessSettingRepository, MockAuthenticationService,
  MockCategoryRepository, MockGeneralConfigurationsRepository, MockProductRepository,
  MockShippingManagerRepository, MockAttributRepository, MockCollectionRepository, MockProductAlertRepository,
  MockEmailService, MockModelRepository, MockApiKeyRepository, MockOpinionRepository,
  MockStoreRepository, MockSubCategoryRepository, MockClientRepository, MockQuotationRepository,
  MockCheckoutRepository, MockBrandRepository, MockSupplierRepository,MockOrderRepository,
  MockReturnRepository, MockCreditNoteRepository, MockDiscountRepository, MockUserRepository, MockShopRepository,
  MockInventoryRepository, MockCartRepository,
  MockPaymentService, MockStockRepository, MockProductCustomization,
  MockPurchaseOrderRepository, MockGiftCardRepository, MockChatGPTService
} from '../adapters/mock';
import {
  AuthenticationService, ImageUploadService, GeneralConfigurationsService, AccessSettingRepository, ShippingManagerRepository
  , ProductRepository, AttributRepository, CategoryRepository, EventRepository, CollectionRepository
  , ProductAlertRepository, ModelRepository, ApiKeyRepository, OpinionRepository,
  StoreRepository,SubCategoryRepository, BrandRepository, SupplierRepository,
  ClientRepository, QuotationRepository, CheckoutRepository, UserRepository, OrderRepository, ShopRepository,
  InventoryRepository, CartRepository, StockRepository
  , ProductCustomizationRepository, StorageService, ReturnRepository,DiscountRepository, CreditNoteRepository,
  PurchaseOrderRepository, GiftCardRepository, ChatGPTService
} from '../adapters/supabase';

import { SupabaseClient } from '@supabase/supabase-js';
import { createClient, createClientAdmin } from '../adapters/supabase/server';


export const DI_SYMBOLS = {
  ISupabaseClient: Symbol('ISupabaseClient'),
  ISupabaseClientAdmin: Symbol('ISupabaseClientAdmin'),
  IAuthenticationService: Symbol('IAuthenticationService'),
  IGeneralConfigurationsRepository: Symbol('IGeneralConfigurationsRepository'),
  IAccessSettingRepository: Symbol('IAccessSettingRepository'),
  IShippingManagerRepository: Symbol('IShippingManagerRepository'),
  IProductRepository: Symbol('IProductRepository'),
  IAttributRepository: Symbol('IAttributRepository'),
  ICategoryRepository: Symbol('ICategoryRepository'),
  IEventRepository: Symbol('IEventRepository'),
  IImageUploadService: Symbol('IImageUploadService'),
  IModelRepository: Symbol('IModelRepository'),
  IApiKeyRepository: Symbol('IApiKeyRepository'),
  ICollectionRepository: Symbol('ICollectionRepository'),
  IOpinionRepository: Symbol('IOpinionRepository'),
  IProductAlertRepository: Symbol('IProductAlertRepository'),
  IEmailService: Symbol('IEmailService'),
  ISubCategoryRepository: Symbol('ISubCategoryRepository'),
  IStoreRepository: Symbol('IStoreRepository'),
  IClientRepository: Symbol('IClientRepository'),
  IQuotationRepository: Symbol('IQuotationRepository'),
  ICheckoutRepository: Symbol('ICheckoutRepository'),
  IUserRepository: Symbol('IUserRepository'),
  IBrandRepository: Symbol('IBrandRepository'),
  ISupplierRepository: Symbol('ISupplierRepository'),
  IOrderRepository: Symbol('IOrderRepository'),
  IReturnRepository: Symbol('IReturnRepository'),
  ICreditNoteRepository: Symbol('ICreditNoteRepository'),
  IDiscountRepository: Symbol('IDiscountRepository'),
  IShopRepository: Symbol('IShopRepository'),
  IInventoryRepository: Symbol('IInventoryRepository'),
  IStockRepository: Symbol('IStockRepository'),
  ICartRepository: Symbol('ICartRepository'),
  IPaymentService: Symbol('IPaymentService'),
  IProductCustomizationRepository: Symbol('IProductCustomizationRepository'),
  IStorageService: Symbol('IStorageService'),
  IPurchaseOrderRepository: Symbol('IPurchaseOrderRepository'),
  IGiftCardRepository: Symbol('IGiftCardRepository'),
  IAIAssistantService: Symbol('IIAService'),
}

interface IDependencyInjection {
  ISupabaseClient: SupabaseClient;
  ISupabaseClientAdmin: SupabaseClient;
  IAuthenticationService: IAuthenticationService;
  IGeneralConfigurationsRepository: IGeneralConfigurationsRepository;
  IAccessSettingRepository: IAccessSettingRepository;
  IShippingManagerRepository: ICarrierRepository;
  IProductRepository: IProductRepository;
  IAttributRepository: IAttributRepository;
  ICategoryRepository: ICategoryRepository;
  IEventRepository: IEventRepository;
  IImageUploadService: IImageUploadService;
  IModelRepository: IModelRepository;
  IApiKeyRepository: IApiKeyRepository;
  ICollectionRepository: ICollectionRepository;
  IOpinionRepository: IOpinionRepository
  IProductAlertRepository: IProductAlertRepository;
  IEmailService: IEmailService;
  ISubCategoryRepository: ISubCategoryRepository;
  IStoreRepository: IStoreRepository;
  IClientRepository: IClientRepository;
  IQuotationRepository: IQuotationRepository;
  ICheckoutRepository: ICheckoutRepository;
  IUserRepository: IUserRepository;
  IBrandRepository: IBrandRepository;
  ISupplierRepository: ISupplierRepository;
  IOrderRepository: IOrderRepository;
  IReturnRepository: IReturnRepository;
  ICreditNoteRepository: ICreditNoteRepository;
  IDiscountRepository: IDiscountRepository;
  IShopRepository: IShopRepository;
  IInventoryRepository: IInventoryRepository;
  ICartRepository: ICartRepository;
  IPaymentService: IPaymentService;
  IStockRepository: IStockRepository;
  IProductCustomizationRepository: IProductCustomizationRepository;
  IStorageService: IStorageService;
  IPurchaseOrderRepository: IPurchaseOrderRepository;
  IGiftCardRepository: IGiftCardRepository;
  IAIAssistantService: IIAService;
}

type Class = new (...args: any[]) => any;
type AsyncFunction = (...args: any[]) => Promise<any>;
type Function = (...args: any[]) => any;
type DependencyRegistration = {
  Object: Class | AsyncFunction | Function;
  dependencies?: any[]
}

export const getInjection = async <K extends keyof typeof DI_SYMBOLS>(key: K | symbol): Promise<IDependencyInjection[K]> => {
  const registration = typeof key === 'symbol' ? container[key] : container[DI_SYMBOLS[key as K]];

  if (!registration) {
    throw new Error(`No dependency found for key ${key as K}`);
  }

  let dependencyArray: any[] = [];
  if (registration.dependencies) {
    dependencyArray = await Promise.all(registration.dependencies.map(async (dependency) => await getInjection(dependency)));
  }

  if (registration.Object.prototype) {
    const obj = registration.Object as Class;
    return new obj(...dependencyArray);
  } else if (registration.Object.constructor.name === 'AsyncFunction') {
    const func = registration.Object as AsyncFunction;
    return await func(...dependencyArray);
  } else {
    const func = registration.Object as Function;
    return func(...dependencyArray);
  }
}

const container: Record<symbol, DependencyRegistration> = process.env.NODE_ENV === 'test'
  ? {
    [DI_SYMBOLS.IAuthenticationService]: { Object: MockAuthenticationService },
    [DI_SYMBOLS.ICheckoutRepository]: { Object: MockCheckoutRepository },
    [DI_SYMBOLS.IGeneralConfigurationsRepository]: { Object: MockGeneralConfigurationsRepository },
    [DI_SYMBOLS.IAccessSettingRepository]: { Object: MockAccessSettingRepository },
    [DI_SYMBOLS.IShippingManagerRepository]: { Object: MockShippingManagerRepository },
    [DI_SYMBOLS.IProductRepository]: { Object: MockProductRepository },
    [DI_SYMBOLS.IClientRepository]: { Object: MockClientRepository },
    [DI_SYMBOLS.IOrderRepository]: { Object: MockOrderRepository },
    [DI_SYMBOLS.IReturnRepository]: { Object: MockReturnRepository },
    [DI_SYMBOLS.ICreditNoteRepository]: { Object: MockCreditNoteRepository },
    [DI_SYMBOLS.IDiscountRepository]: { Object: MockDiscountRepository },
    [DI_SYMBOLS.IAttributRepository]: { Object: MockAttributRepository },
    [DI_SYMBOLS.ICategoryRepository]: { Object: MockCategoryRepository },
    [DI_SYMBOLS.IEventRepository]: { Object: MockEventRepository },
    [DI_SYMBOLS.IImageUploadService]: { Object: MockImageUploadService },
    [DI_SYMBOLS.IModelRepository]: { Object: MockModelRepository },
    [DI_SYMBOLS.IApiKeyRepository]: { Object: MockApiKeyRepository },
    [DI_SYMBOLS.ICollectionRepository]: { Object: MockCollectionRepository },
    [DI_SYMBOLS.IOpinionRepository]: { Object: MockOpinionRepository },
    [DI_SYMBOLS.IProductAlertRepository]: { Object: MockProductAlertRepository },
    [DI_SYMBOLS.IEmailService]: { Object: MockEmailService },
    [DI_SYMBOLS.ISubCategoryRepository]: { Object: MockSubCategoryRepository },
    [DI_SYMBOLS.IStoreRepository]: { Object: MockStoreRepository },
    [DI_SYMBOLS.IQuotationRepository]: { Object: MockQuotationRepository },
    [DI_SYMBOLS.IUserRepository]: { Object: MockUserRepository },
    [DI_SYMBOLS.IBrandRepository]: { Object: MockBrandRepository },
    [DI_SYMBOLS.ISupplierRepository]: { Object: MockSupplierRepository },
    [DI_SYMBOLS.IOrderRepository]: { Object: MockOrderRepository },
    [DI_SYMBOLS.IShopRepository]: { Object: MockShopRepository },
    [DI_SYMBOLS.IInventoryRepository]: { Object: MockInventoryRepository },
    [DI_SYMBOLS.ICartRepository]: { Object: MockCartRepository },
    [DI_SYMBOLS.IPaymentService]: { Object: MockPaymentService }, 
    [DI_SYMBOLS.IStockRepository]: { Object: MockStockRepository },
    [DI_SYMBOLS.IProductCustomizationRepository]: { Object: MockProductCustomization },
    [DI_SYMBOLS.IPurchaseOrderRepository]: { Object: MockPurchaseOrderRepository },
    [DI_SYMBOLS.IGiftCardRepository]: { Object: MockGiftCardRepository },
    [DI_SYMBOLS.IAIAssistantService]: { Object: MockChatGPTService },
  }
  : {
    [DI_SYMBOLS.ISupabaseClient]: { Object: createClient },
    [DI_SYMBOLS.ISupabaseClientAdmin]: { Object: createClientAdmin },
    [DI_SYMBOLS.IStorageService]: { Object: StorageService, dependencies: [DI_SYMBOLS.ISupabaseClientAdmin] },
    [DI_SYMBOLS.IAuthenticationService]: { Object: AuthenticationService, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IGeneralConfigurationsRepository]: { Object: GeneralConfigurationsService, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IAccessSettingRepository]: { Object: AccessSettingRepository, dependencies: [DI_SYMBOLS.ISupabaseClient, DI_SYMBOLS.ISupabaseClientAdmin] },
    [DI_SYMBOLS.IShippingManagerRepository]: { Object: ShippingManagerRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IProductRepository]: { Object: ProductRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.ICategoryRepository]: { Object: CategoryRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IEventRepository]: { Object: EventRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IImageUploadService]: { Object: ImageUploadService, dependencies: [DI_SYMBOLS.ISupabaseClientAdmin] },
    [DI_SYMBOLS.IModelRepository]: { Object: ModelRepository, dependencies: [DI_SYMBOLS.ISupabaseClientAdmin] },
    [DI_SYMBOLS.IApiKeyRepository]: { Object: ApiKeyRepository, dependencies: [DI_SYMBOLS.ISupabaseClientAdmin] },
    [DI_SYMBOLS.ICollectionRepository]: { Object: CollectionRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IAttributRepository]: { Object: AttributRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IOpinionRepository]: { Object: OpinionRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IProductAlertRepository]: { Object: ProductAlertRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.ICheckoutRepository]: { Object: CheckoutRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IEmailService]: { Object: MailjetEmailService },
    [DI_SYMBOLS.ISubCategoryRepository]: { Object: SubCategoryRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IStoreRepository]: { Object: StoreRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IClientRepository]: { Object: ClientRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IQuotationRepository]: { Object: QuotationRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IUserRepository]: { Object: UserRepository, dependencies: [DI_SYMBOLS.ISupabaseClientAdmin] },
    [DI_SYMBOLS.IBrandRepository]: { Object: BrandRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.ISupplierRepository]: { Object: SupplierRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IOrderRepository]: { Object: OrderRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IShopRepository]: { Object: ShopRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IInventoryRepository]: { Object: InventoryRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.ICartRepository]: { Object: CartRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IPaymentService]: { Object: PaymentService },
    [DI_SYMBOLS.IStockRepository]: { Object: StockRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IDiscountRepository]: { Object: DiscountRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IProductCustomizationRepository]: { Object: ProductCustomizationRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IReturnRepository]: { Object: ReturnRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.ICreditNoteRepository]: { Object: CreditNoteRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IPurchaseOrderRepository]: { Object: PurchaseOrderRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },
    [DI_SYMBOLS.IGiftCardRepository]: { Object: GiftCardRepository, dependencies: [DI_SYMBOLS.ISupabaseClient] },  
    [DI_SYMBOLS.IAIAssistantService]: { Object: ChatGPTService, dependencies: [DI_SYMBOLS.ISupabaseClientAdmin] },
};
 

