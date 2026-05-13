import { Address, AddressType, Cart, Client, CreditNote, CreditNoteType, DeliveryCart, DiscountCart, GiftCard, Order, OrderDeliveryMode, OrderEtat, OrderLineInput, OrderStatus, PaymentMode, PurchaseOrderLine, PurchaseOrderStatus, Stock } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";
import { deleteCartUnitUseCase } from "./removeCartUnit";
import { validateSystemPayCallbackUseCase } from "./vaildatePaymentSystemPay";

export const ValidatePaymentUseCase = async (modePaiement: string, body?: any): Promise<number> => {

  let userId;
  if (modePaiement === 'SYSTEMPAY') {
    if (!body) throw new Error("Missing body for SYSTEMPAY");
    const payload = await validateSystemPayCallbackUseCase(body);
    userId = payload.customer.reference;
  } else {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    userId = user.id;
  }

  const clientRepository = await getInjection("IClientRepository");
  const orderRepository = await getInjection("IOrderRepository");
  const generalCOnf = await getInjection("IGeneralConfigurationsRepository");
  const cartRepository = await getInjection("ICartRepository");
  const purchaseOrderRepository = await getInjection("IPurchaseOrderRepository");
  const modelRepository = await getInjection("IModelRepository");
  const productRepository = await getInjection("IProductRepository");
  const creditNoteRepository = await getInjection("ICreditNoteRepository");
  const discountRepository = await getInjection("IDiscountRepository");
  const giftCardRepository = await getInjection('IGiftCardRepository');

  let autorisation = '';
  let orderStatus: OrderStatus = OrderStatus.ATTENTE_PAIMENT;
  let validFormdata = false;

  try {
    const incomingOrderStatus = body?.data?.orderStatus ?? body?.orderStatus ?? body?.clientAnswer?.orderStatus ?? undefined;

    if (incomingOrderStatus) {
      const normalized = String(incomingOrderStatus).toUpperCase();
      if (normalized === 'PAID') {
        orderStatus = OrderStatus.PAIMENT_ACCEPTE;
        autorisation = body?.clientAnswer?.transactions.map((t: any) => t.uuid).join(',');
        validFormdata = true;
      } else {
        validFormdata = false;
      }
    } else {
      validFormdata = false;
      console.warn('ValidatePaymentUseCase: no orderStatus in callback body', { body });
    }
  } catch (e) {
    console.error('ValidatePaymentUseCase: failed reading orderStatus', e, { body });
    validFormdata = false;
  }


  let codePays: string;
  let billingAdress: Address;
  let cart: Cart[];
  let deliveryCart: DeliveryCart | null;
  let client: Client;
  let panier_reductions: DiscountCart[];

  try {
    client = await clientRepository.read(userId);

    cart = await cartRepository.getCustomerCart(userId);

    deliveryCart = await cartRepository.getDeliveryCartbyId(userId);
    if (!deliveryCart) {
      throw Error("No delivery cart found")
    }
    billingAdress = await clientRepository.getAdressById(deliveryCart.billingAddressId);

    panier_reductions = await cartRepository.getUserDiscountCart(userId);

  } catch (err) {
    await cartRepository.createAdminAlert({ message: `Erreur création order: ${JSON.stringify(err)}`, fonction: 'checkout' });
    throw new Error(JSON.stringify(err));
  }

  codePays = deliveryCart.billingAddress.find(adr => adr.id === deliveryCart.billingAddressId)?.pays ?? 'FR';

  const sans_tva = await cartRepository.getCountryWithoutTVA(codePays);

  const tvaApplicable = null === sans_tva || undefined === sans_tva;

  const montantPanier = cart.reduce((acc: number, p: Cart) => acc + (p.quantity * (tvaApplicable ? p.model.priceWithVat : p.model.priceWithoutVat) +
    (p.customization ? p.price : 0)), 0);

  const montantLivraison = deliveryCart.prix;

  const finalAmount = montantPanier + montantLivraison;

  let valeurReduction = 0;

  if (Array.isArray(panier_reductions) && panier_reductions.length > 0) {
    if ("AVOIR" === panier_reductions[0]!.discountType) {
      valeurReduction = panier_reductions[0]!.value;

      const avoirs = await creditNoteRepository.readUnused(client.clientNumber)

      let avoirToDeduce = panier_reductions[0]!.value;

      for (const avoir of avoirs as CreditNote[]) {
        const { remainingAmount, id } = avoir;
        const montantAEnlever = Math.min(avoirToDeduce, remainingAmount ?? 0);

        const montantRestant = remainingAmount ?? 0 - montantAEnlever;

        await creditNoteRepository.update(id!, montantRestant, montantRestant === 0);

        avoirToDeduce -= montantAEnlever;

        if (avoirToDeduce === 0) {
          break;
        }
      }
    }
  }

  let order: Order;
  try {
    const orderData = {
      clientNumber: client.clientNumber,
      status: orderStatus,
      amount: finalAmount,
      deliveryFees: deliveryCart.prix,
      withoutVAT: !tvaApplicable,
      quotation: false,
      deliveryMode: deliveryCart.deliveryMode,
      usedCredit: 0,
      totalDiscount: valeurReduction,
      authorisation: autorisation,
      paymentMode: modePaiement,
      authorisationDate: (new Date()).toISOString()
    };

    order = await orderRepository.createOrder(orderData);
  } catch (err) {
    await cartRepository.createAdminAlert({ message: `Erreur création order: ${JSON.stringify(err)}`, fonction: 'checkout' });
    throw new Error(JSON.stringify(err));
  }

  try {
    const billingAddressData = {
      orderId: order.id,
      type: AddressType.FACTURATION,
      relaisId: '',
      company: billingAdress.societe,
      lastName: billingAdress.nom,
      firstName: billingAdress.prenom,
      address: billingAdress.adresse,
      address2: billingAdress.adresse2,
      address3: billingAdress.adresse3,
      postCode: billingAdress.code_postal,
      city: billingAdress.ville,
      country: billingAdress.pays
    };

    const cmdAdresseFacturation = await orderRepository.createOrderAddress(billingAddressData);
  } catch (err) {
    await cartRepository.createAdminAlert({ message: `Erreur création commande adresse livraison: ${JSON.stringify(err)}`, fonction: 'checkout' });
    throw new Error(JSON.stringify(err));
  }

  let cmdAdresseLivraison = null;
  if (null !== deliveryCart.clientAddressId
    && OrderDeliveryMode.AU_MAGASIN !== deliveryCart.deliveryMode
  ) {
    if (deliveryCart.clientAddressId === undefined) {
      throw new Error("Client address ID is missing");
    }

    const adresseLivraison = await clientRepository.getAdressById(deliveryCart.clientAddressId);

    if (adresseLivraison) {
      try {
        const deliveryAddressData = {
          orderId: order.id,
          type: AddressType.LIVRAISON,
          relaisId: deliveryCart.relaisId,
          company: adresseLivraison.societe,
          lastName: adresseLivraison.nom,
          firstName: adresseLivraison.prenom,
          address: adresseLivraison.adresse,
          address2: adresseLivraison.adresse2,
          address3: adresseLivraison.adresse3,
          postCode: adresseLivraison.code_postal,
          city: adresseLivraison.ville,
          country: adresseLivraison.pays
        };

        cmdAdresseLivraison = await orderRepository.createOrderAddress(deliveryAddressData);
      } catch (err) {
        await cartRepository.createAdminAlert({
          message: `Erreur création commande adresse facturation: ${JSON.stringify(err)}`
          , fonction: 'checkout'
        });
      }
    }
  } else if ('' !== deliveryCart.relaisId) {
    try {
      const relayAddressData = {
        orderId: order.id,
        type: AddressType.LIVRAISON,
        relaisId: deliveryCart.relaisId,
        company: deliveryCart.company,
        address: deliveryCart.adress,
        address2: deliveryCart.adress2,
        postCode: deliveryCart.postCode,
        city: deliveryCart.city,
        country: deliveryCart.country,
        lastName: deliveryCart.lastName,
        firstName: deliveryCart.firstName,
        address3: deliveryCart.adress3
      };

      cmdAdresseLivraison = await orderRepository.createOrderAddress(relayAddressData);
    } catch (err) {
      await cartRepository.createAdminAlert({
        message: `Erreur création commande adresse livraison: ${JSON.stringify(err)}`
        , fonction: 'checkout'
      });
    }
  }

  const adminOrderData = { orderId: order.id, internalComment: '', etat: OrderEtat.NORMAL };
  await orderRepository.createAdminOrder(adminOrderData);

  if (Array.isArray(panier_reductions) && panier_reductions.length > 0) {
    const panier_reductions_insert = await discountRepository.createOrderDiscount({
      type: panier_reductions[0]!.discountType,
      type_valeur: panier_reductions[0]!.discountTypeValue,
      id_commande: order.id,
      valeur: panier_reductions[0]!.value,
      info: panier_reductions[0]!.info,
      date: new Date()
    });
  }


  let configrations_generales;
  try {
    configrations_generales = await generalCOnf.read();
  } catch (err) {
    await cartRepository.createAdminAlert(
      {
        message: `Erreur configuration générale: ${JSON.stringify(err)}.\nCashback non attribué pour la commande ${order.id}`,
        fonction: ''
      });
  }

  if (configrations_generales) {
    const { type_duree_validite_cashback, duree_validite_cashback, reduction_cashback } = configrations_generales;

    const now = new Date();
    if (!reduction_cashback) {
      throw Error;
    }
    const cashback = reduction_cashback *  finalAmount / 100;

    const daysToAdd = type_duree_validite_cashback === 'JOUR' ? duree_validite_cashback
      : type_duree_validite_cashback === 'MOIS' ? duree_validite_cashback * 30
        : type_duree_validite_cashback === 'ANNEE' ? duree_validite_cashback * 365
          : 0;

    const date_expiration = new Date(now.setDate(now.getDate() + daysToAdd));

    await creditNoteRepository.create({
      clientId: client.clientNumber,
      orderId: order.id,
      total: cashback,
      createdAt: new Date(),
      type: CreditNoteType.CASHBACK,
      expiredAt: date_expiration,
    })
  } else {
  }

  const stocks_to_update: Stock[] = [];
  const cheques_cadeaux: GiftCard[] = [];
  const commande_lignes: OrderLineInput[] = [];

  const stocks_array = await cartRepository.getStockList(cart);

  if (!stocks_array) {
    throw Error;
  }
  else {
    for (const p of cart) {

      const model = await modelRepository.readModelWithProductById(p.modelId);
      if (model.product.isGiftCard) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let codeChequeCadeau = '';
        const charactersLength = characters.length;
        for (let i = 0; i < 15; i++) {
          codeChequeCadeau += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        const now = new Date();
        const dateFin = new Date(now.setMonth(now.getMonth() + model.product.giftCardDuration));

        const giftCardData = {
          commandId: order.id,
          value: tvaApplicable ? model.priceWithVat * p.quantity : model.priceWithoutVat * p.quantity,
          code: codeChequeCadeau,
          expirationDate: dateFin,
          used: false,
          clientId: client.clientNumber
        };

        cheques_cadeaux.push(giftCardData);
      } else {
        const stockItem = stocks_array.find((s: Stock) => s.idModel === p.modelId);

        if (!stockItem) {
          continue;
        }

        const { disponible, indisponible } = stockItem;

        const newAvailable = disponible - p.quantity;
        const newUnavailable = indisponible + p.quantity;

        const stockUpdateData = {
          idModel: p.modelId,
          disponible: newAvailable,
          updatedAt: new Date().toISOString(),
          locked: 0,
          indisponible: newUnavailable
        };

        stocks_to_update.push(stockUpdateData);

        if ((newAvailable + indisponible) < 0) {
          const quantiteACommander = Math.abs(newAvailable + indisponible);

          const productAdmin = await productRepository.readAdminByModelId(model.id);

          let result = await purchaseOrderRepository.readPurchaseOrderLine({
            supplierId: productAdmin.supplierId,
            modelId: p.modelId
          });

          let commandeFournisseurLigne: PurchaseOrderLine | null = Array.isArray(result) ? result[0] || null : result;

          if (commandeFournisseurLigne && commandeFournisseurLigne.quantity !== undefined) {
            const newQuantity = commandeFournisseurLigne.quantity + quantiteACommander;

            const updateCommandeFournisseurLigne = await purchaseOrderRepository.updatePurchaseOrderLine({
              orderSupplierId: productAdmin.supplierId,
              modelId: p.modelId,
              quantity: newQuantity
            });
          } else {
            const purchaseOrderData = {
              supplierId: productAdmin.supplierId,
              orderDate: new Date(),
              paymentMode: PaymentMode.CHEQUE,
              clubId: 0,
              deliveryDate: new Date(),
              validationDate: new Date(),
              remise: 0,
              totalHT: 0,
              valid: false,
              shippingFees: 0,
              shippingVAT: 0,
              paymentDelay: 0,
              deposit: 0,
              comment: "",
              status: PurchaseOrderStatus.BROUILLON,
            };

            const commandeFournisseur = await purchaseOrderRepository.createPurchaseOrder(purchaseOrderData);

            const purchaseOrderLineData = {
              orderSupplierId: productAdmin.supplierId,
              modelId: p.modelId,
              quantity: p.quantity
            };

            commandeFournisseurLigne = await purchaseOrderRepository.createPurchaseOrderLine(purchaseOrderLineData);
          }
        }

        const modelAdmin = await modelRepository.readByBarcode(model.barcode);
        
        const orderLineData = {
          orderId: order.id,
          modelId: model.id,
          barCode: modelAdmin.barcode,
          manufacturerRef: modelAdmin.manufacturerReference,
          quantity: p.quantity,
          totalPriceExclTax: model.priceWithoutVat * p.quantity,
          vat: tvaApplicable ? model.product.vatRate : 0,
          reductionType: panier_reductions?.[0]?.discountType ?? undefined,
          reductionValueType: panier_reductions?.[0]?.discountTypeValue ?? undefined,
          reductionValue: panier_reductions?.[0]?.value ?? 0,
          reductionInfo: panier_reductions?.[0]?.info ?? undefined,
          name: p.text,
          unitPriceExclTax: p.model.priceWithoutVat,
          totalPriceInclTax: tvaApplicable ? model.priceWithVat * p.quantity : model.priceWithoutVat * p.quantity,
          giftVoucher: model.product.isGiftCard,
          voucherDuration: model.product.giftCardDuration ? model.product.giftCardDuration : 0,
          weight: p.model.weight * p.quantity,
          comment: "",
          available: "24h" === p.shipping,
          textPersonnalisation: p.textPersonalisation,
          typePersonnalisation: p.typePersonalisation,
             
        };
        
        commande_lignes.push(orderLineData);
      }
    }
  }
  const commandeLignes = await orderRepository.createOrderLine(commande_lignes);

  const stocks_array_update = await cartRepository.updateStockList([...stocks_to_update]);

  
  if (cheques_cadeaux.length > 0) {
    const chequeCadeau = await giftCardRepository.create({
      value: 0,
      clientId: 0
    });
  }
  for (const p of cart) {
    await deleteCartUnitUseCase(p.modelId);
  }
  await cartRepository.deleteCart(userId);

  const updatedDeliveryCart = { ...deliveryCart, valid: false };
  await cartRepository.updateDeliveryCart(updatedDeliveryCart);

  return order.id;
}