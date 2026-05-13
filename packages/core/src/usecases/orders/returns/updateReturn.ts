import { processMap } from "../../../services";
import { AddressType, CreditNoteInput, CreditNoteSchema, CreditNoteType, OrderAddress, OrderAddressSchema, OrderInput, OrderInputSchema, 
    OrderLine, OrderLineInput, OrderLineSchema, OrderStatus, ReturnPresenter, ReturnPresenterInput, 
    ReturnStatus, ReturnType, StockInput, StockInputSchema, UserRoles } from "../../../models";
import { Environment, ErrorCodes, getInjection, ReturnOne } from "../../../types";
import { BadRequestError, InternalServerError, UnauthorizedError } from "../../../types/error";

// Types pour les opérations communes
interface StockUpdateData {
    modelId: number;
    quantity: number;
    operation: 'add' | 'subtract';
}

interface CreditNoteData {
    clientId: number;
    orderId: number;
    amount: number;
}

interface EmailData {
    return: any;
    label?: string;
}

// Fonctions utilitaires communes
const calculateExpirationDate = async (): Promise<Date> => {
    const generalConf = await getInjection("IGeneralConfigurationsRepository");
    const configurations = await generalConf.read();
    
    if (!configurations) {
        throw new InternalServerError("Une erreur est survenue lors de la récupération des configurations générales");
    }

    const dateExpiration = new Date();
    const { type_duree_validitee_avoir, duree_validite_avoir } = configurations;

    switch (type_duree_validitee_avoir) {
        case "JOURS":
            dateExpiration.setDate(dateExpiration.getDate() + duree_validite_avoir);
            break;
        case "MOIS":
            dateExpiration.setMonth(dateExpiration.getMonth() + duree_validite_avoir);
            break;
        case "ANNEE":
            dateExpiration.setFullYear(dateExpiration.getFullYear() + duree_validite_avoir);
            break;
    }

    return dateExpiration;
};

const updateStock = async (stockUpdates: StockUpdateData[]): Promise<void> => {
    const stockRepository = await getInjection('IStockRepository');
    const modelIds = stockUpdates.map(su => su.modelId);
    const stocks = await stockRepository.listStockByModelIds(modelIds);
    
    if (stocks.length !== modelIds.length || stocks.length === 0) {
        throw new InternalServerError("Les stocks des modèles ne sont pas trouvés");
    }

    const updateStockData: StockInput[] = stockUpdates.map(update => {
        const stock = stocks.find(s => s.idModel === update.modelId);
        if (!stock) {
            throw new InternalServerError(`Stock non trouvé pour le modèle ${update.modelId}`);
        }

        const newQuantity = update.operation === 'add' 
            ? stock.disponible + update.quantity 
            : stock.disponible - update.quantity;

        if (newQuantity < 0) {
            throw new BadRequestError(`Stock insuffisant pour le modèle ${update.modelId}`);
        }

        return {
            idModel: update.modelId,
            locked: stock.locked,
            indisponible: stock.indisponible,
            disponible: newQuantity,
            updatedAt: new Date().toISOString()
        };
    });

    // Validation des données avant mise à jour
    updateStockData.forEach(stock => {
        const validatedStock = StockInputSchema.safeParse(stock);
        if (!validatedStock.success) {
            throw new BadRequestError(validatedStock.error.message);
        }
    });

    await stockRepository.updateStock(updateStockData);
};

const createCreditNote = async (creditNoteData: CreditNoteData): Promise<any> => {
    const creditNoteRepository = await getInjection("ICreditNoteRepository");
    
    const expirationDate = await calculateExpirationDate();
    
    const creditNoteInput: CreditNoteInput = {
        clientId: creditNoteData.clientId,
        orderId: creditNoteData.orderId,
        total: creditNoteData.amount,
        createdAt: new Date(),
        expiredAt: expirationDate,
        type: CreditNoteType.CASHBACK,
        used: false,
        remainingAmount: 0
    };

    const validatedCreditNoteInput = CreditNoteSchema.parse(creditNoteInput);
    const creditNoteRequest = await creditNoteRepository.create(validatedCreditNoteInput);
    
    if (creditNoteRequest.error) {
        throw new InternalServerError(creditNoteRequest.error);
    }

    return creditNoteRequest;
};

const sendEmail = async (emailData: EmailData, emailType: 'refus' | 'received' | 'request' | 'creditNote'): Promise<void> => {
    const emailService = await getInjection("IEmailService");
    let emailResponse;

    switch (emailType) {
        case 'refus':
            emailResponse = await emailService.sendRefusRetourEmail(emailData.return);
            break;
        case 'received':
            emailResponse = await emailService.sendReturnReceivedEmail(emailData.return);
            break;
        case 'request':
            emailResponse = await emailService.sendReturnRequestReceivedEmail(emailData.return, emailData.label!);
            break;
        case 'creditNote':
            emailResponse = await emailService.sendCreditNoteCreationEmail({
                ...emailData.return,
                client: emailData.return.client
            });
            break;
    }

    if (!emailResponse.success) {
        throw new InternalServerError(emailResponse.message);
    }
};

const calculateReturnAmount = (orderLines: any[], returnLines: any[]): number => {
    return returnLines.reduce((acc, rl) => {
        const orderLine = orderLines.find(cl => cl.modelId === rl.modelId);
        if (!orderLine) return acc;
        
        const unitPriceWithVat = orderLine.unitPriceExclTax + (orderLine.unitPriceExclTax * orderLine.vat / 100);
        return acc + (rl.quantity * unitPriceWithVat);
    }, 0);
};

const updateOrderLines = async (orderId: number, returnLines: any[], comment: string = "Retour"): Promise<void> => {
    const orderRepository = await getInjection("IOrderRepository");
    
    const updateOrderLinesData: OrderLineInput[] = returnLines.map(rl => ({
        orderId,
        modelId: rl.modelId,
        comment,
        returnedAt: new Date()
    }));

    const validatedOrderLines = updateOrderLinesData.map(orderLine => OrderLineSchema.parse(orderLine));
    const updateOrderLineRequest = await orderRepository.updateOrderLines(validatedOrderLines);
    
    if (updateOrderLineRequest.length !== updateOrderLinesData.length) {
        throw new InternalServerError("Une erreur est survenue lors de la mise à jour des lignes de commande");
    }
};

const createExchangeOrder = async (originalOrder: any, exchangeLines: OrderLineInput[]): Promise<any> => {
    const orderRepository = await getInjection("IOrderRepository");
    
    const { id, ...rest } = originalOrder;
    
    const newOrderObj: OrderInput = {
        ...rest,
        status: OrderStatus.PAIMENT_ACCEPTE,
        amount: exchangeLines.reduce((acc, cl) => acc + (cl.totalPriceInclTax ?? 0), 0),
        deliveryFees: 0,
        withoutVAT: false,
        quotation: false,
        deliveryMode: originalOrder.deliveryMode,
        usedCredit: 0,
        totalDiscount: 0,
        authorisation: "",
        paymentMode: "",
        authorisationDate: new Date().toISOString(),
        clientNumber: originalOrder.clientId
    };

    const validatedOrder = OrderInputSchema.parse(newOrderObj);
    const newOrder = await orderRepository.createOrder(validatedOrder);
    
    if (!newOrder) {
        throw new InternalServerError("Une erreur est survenue lors de la création de la nouvelle commande");
    }

    return newOrder;
};

const copyOrderAddresses = async (originalOrderId: number, newOrderId: number): Promise<void> => {
    const orderRepository = await getInjection("IOrderRepository");
    
    const originalAddresses = await orderRepository.readOrderAddress(originalOrderId);
    if (!originalAddresses) {
        throw new InternalServerError("Les adresses de la commande originale ne sont pas trouvées");
    }

    const deliveryAddress = originalAddresses.find(oa => oa.type === AddressType.LIVRAISON);
    if (!deliveryAddress) {
        throw new InternalServerError("Aucune adresse de livraison trouvée");
    }

    const validatedOrderAddress = OrderAddressSchema.parse({
        ...deliveryAddress,
        orderId: newOrderId
    });

    const orderAddress: OrderAddress = {
        ...validatedOrderAddress,
        relaisId: validatedOrderAddress.relaisId ?? "",
        company: validatedOrderAddress.company ?? "",
        lastName: validatedOrderAddress.lastName ?? "",
        firstName: validatedOrderAddress.firstName ?? "",
        address: validatedOrderAddress.address ?? "",
        address2: validatedOrderAddress.address2 ?? "",
        address3: validatedOrderAddress.address3 ?? "",
        postCode: validatedOrderAddress.postCode ?? "",
        city: validatedOrderAddress.city ?? "",
        country: validatedOrderAddress.country ?? ""
    };

    const newOrderAddressRequest = await orderRepository.createOrderAddress(orderAddress);
    if (!newOrderAddressRequest) {
        throw new InternalServerError("Une erreur est survenue lors de la création des nouvelles adresses de commande");
    }
};

export const updateReturnUseCase = async (id: number, returnData: ReturnPresenterInput): Promise<ReturnOne<ReturnPresenter>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const returnRepository = await getInjection("IReturnRepository");
    const updatedReturn = await returnRepository.updateReturn(id, returnData);

    const orderRepository = await getInjection("IOrderRepository");

    if (returnData.status === ReturnStatus.REJECTED && updatedReturn.item) {
        await sendEmail({ return: updatedReturn.item }, 'refus');
    } else if (returnData.status === ReturnStatus.APPROVED && updatedReturn.item) {
        const orderLines = await orderRepository.readAllOrderLines(updatedReturn.item.orderId);        
        if (returnData.type === ReturnType.EXCHANGE) {
            await handleExchangeReturn(returnData, updatedReturn, orderLines);
        } else {
            await handleStandardReturn(returnData, updatedReturn, orderLines);
        }
    } else if (returnData.status === ReturnStatus.VALIDATED && updatedReturn.item) {
        await handleReturnValidation(returnData, updatedReturn);
    }

    return updatedReturn;
};

const handleExchangeReturn = async (returnData: ReturnPresenterInput, updatedReturn: any, orderLines: any) => {
    const orderRepository = await getInjection("IOrderRepository");
    const modelRepository = await getInjection("IModelRepository");

    // Calcul des montants
    const returnedAmount = calculateReturnAmount(orderLines.items || [], returnData.lines);
    
    const exchangeModels = await modelRepository.readModelsByIds(
        returnData.lines.map(rl => rl.exchangeModelId).filter(id => id !== null && id !== undefined)
    );
    
    if (exchangeModels.length !== returnData.lines.length || exchangeModels.length === 0) {
        throw new InternalServerError("Les modèles échangés ne sont pas trouvés");
    }

    const exchangeAmount = exchangeModels.reduce((acc, model) => {
        const returnLine = returnData.lines.find(rl => rl.exchangeModelId === model.id);
        return acc + (returnLine ? returnLine.quantity * model.priceWithVat : 0);
    }, 0);

    if (exchangeAmount > returnedAmount) {
        throw new BadRequestError("Le montant des produits échangés est supérieur au montant des produits retournés");
    }

    // Préparation des données pour les stocks
    const stockUpdates: StockUpdateData[] = [];
    const newOrderLines: OrderLineInput[] = [];
    const updateOrderLines: OrderLineInput[] = [];

    for (const returnLine of returnData.lines) {
        const exchangeModel = exchangeModels.find(m => m.id === returnLine.exchangeModelId);
        if (!exchangeModel) {
            throw new InternalServerError("Le modèle échangé n'est pas trouvé");
        }

        // Ajouter les stocks retournés
        stockUpdates.push({
            modelId: returnLine.modelId,
            quantity: returnLine.quantity,
            operation: 'add'
        });

        // Soustraire les stocks échangés
        stockUpdates.push({
            modelId: returnLine.exchangeModelId!,
            quantity: returnLine.quantity,
            operation: 'subtract'
        });

        // Créer les nouvelles lignes de commande
        newOrderLines.push({
            orderId: updatedReturn.item.orderId,
            modelId: exchangeModel.id,
            quantity: returnLine.quantity,
            unitPriceExclTax: exchangeModel.priceWithoutVat,
            vat: Math.round((exchangeModel.priceWithVat - exchangeModel.priceWithoutVat) / exchangeModel.priceWithoutVat * 100),
            totalPriceExclTax: exchangeModel.priceWithoutVat * returnLine.quantity,
            totalPriceInclTax: exchangeModel.priceWithVat * returnLine.quantity,
            weight: exchangeModel.weight,
            comment: "Echange",
            available: true,
            createdAt: new Date()
        });

        // Marquer les lignes originales comme retournées
        const originalOrderLine = orderLines.items?.find((ol: any) => ol.modelId === returnLine.modelId);
        if (!originalOrderLine) {
            throw new InternalServerError("La ligne de commande du modèle à retourner n'est pas trouvée");
        }

        updateOrderLines.push({
            id: originalOrderLine.id,
            orderId: updatedReturn.item.orderId,
            modelId: returnLine.modelId,
            comment: "Modèle remplacé",
            returnedAt: new Date()
        });
    }

    // Mise à jour des lignes de commande
    const validatedOrderLines = updateOrderLines.map(orderLine => OrderLineSchema.parse(orderLine));
    const updateOrderLineRequest = await orderRepository.updateOrderLines(validatedOrderLines);
    if (updateOrderLineRequest.length !== updateOrderLines.length) {
        throw new InternalServerError("Une erreur est survenue lors de la mise à jour des lignes de commande");
    }

    // Création de la nouvelle commande
    const originalOrder = await orderRepository.readById(updatedReturn.item.orderId);
    if (!originalOrder) {
        throw new InternalServerError("La commande à échanger n'est pas trouvée");
    }

    const newOrder = await createExchangeOrder(originalOrder, newOrderLines);
    
    // Création des nouvelles lignes de commande
    const newOrderLinesRequest = await orderRepository.createOrderLines(newOrderLines);
    if (newOrderLinesRequest.length !== newOrderLines.length) {
        throw new InternalServerError("Une erreur est survenue lors de la création des nouvelles lignes de commande");
    }

    // Copie des adresses
    await copyOrderAddresses(updatedReturn.item.orderId, newOrder.id);

    // Mise à jour des stocks
    await updateStock(stockUpdates);

    // Création d'un avoir si nécessaire
    if (exchangeAmount < returnedAmount) {
        const remainingAmount = returnedAmount - exchangeAmount;
        const creditNoteRequest = await createCreditNote({
            clientId: originalOrder.clientId,
            orderId: updatedReturn.item.orderId,
            amount: remainingAmount
        });

        await sendEmail({ return: creditNoteRequest.item }, 'creditNote');
    }

    // Envoi de l'email de confirmation
    await sendEmail({ return: updatedReturn.item }, 'received');
};

const handleStandardReturn = async (returnData: ReturnPresenterInput, updatedReturn: any, orderLines: any) => {
    // Mise à jour des lignes de commande
    await updateOrderLines(updatedReturn.item.orderId, returnData.lines);

    // Mise à jour des stocks
    const stockUpdates: StockUpdateData[] = returnData.lines.map(rl => ({
        modelId: rl.modelId,
        quantity: rl.quantity,
        operation: 'add'
    }));
    await updateStock(stockUpdates);

    // Création d'un avoir si nécessaire
    if (returnData.type === ReturnType.CREDIT) {
        const totalAmount = calculateReturnAmount(orderLines.items || [], returnData.lines);
        const creditNoteRequest = await createCreditNote({
            clientId: updatedReturn.item.order?.client?.clientNumber ?? 0,
            orderId: updatedReturn.item.orderId,
            amount: totalAmount
        });

        await sendEmail({ return: creditNoteRequest.item }, 'creditNote');
    }

    // Envoi de l'email de confirmation
    await sendEmail({ return: updatedReturn.item }, 'received');
};

const handleReturnValidation = async (returnData: ReturnPresenterInput, updatedReturn: any) => {
    const orderRepository = await getInjection("IOrderRepository");
    const modelRepository = await getInjection("IModelRepository");

    // Génération de l'étiquette de retour
    const order = await orderRepository.readById(updatedReturn.item.orderId);
    if (!order) {
        throw new InternalServerError("La commande n'est pas trouvée");
    }

    const process = processMap["COLISSIMO"];
    if (!process) {
        throw new InternalServerError(`Mode de livraison non supporté ${order.deliveryMode}`);
    }

    const modelIds = returnData.lines.map(rl => rl.modelId);
    const models = await modelRepository.readModelsByIds(modelIds);
    if (models.length !== modelIds.length || models.length === 0) {
        throw new InternalServerError("Les modèles à retourner ne sont pas trouvés");
    }

    const weight = models.reduce((acc, model) => acc + model.weight, 0);
    const orderAddresses = await orderRepository.readOrderAddress(order.id);
    if (!orderAddresses) {
        throw new InternalServerError("Les adresses de la commande n'ont pas été trouvées");
    }

    let billingAddress = orderAddresses.find(oa => oa.type === AddressType.FACTURATION);
    let deliveryAddress = orderAddresses.find(oa => oa.type === AddressType.LIVRAISON);

    if (!billingAddress && deliveryAddress) {
        billingAddress = { ...deliveryAddress, type: AddressType.FACTURATION };
    } else if (billingAddress && !deliveryAddress) {
        deliveryAddress = { ...billingAddress, type: AddressType.LIVRAISON };
    } else if (!billingAddress && !deliveryAddress) {
        throw new InternalServerError("Aucune adresse de facturation et/ou de livraison trouvée");
    }

    const carrier = await process(Environment.TEST);
    const data = await carrier.createReturnLabel({
        orderId: order.id,
        clientNumber: order.clientId,
        weight,
        shippingAddress: {
            firstName: deliveryAddress?.firstName ?? "",
            lastName: deliveryAddress?.lastName ?? "",
            address: deliveryAddress?.address ?? "",
            address2: deliveryAddress?.address2 ?? "",
            address3: deliveryAddress?.address3 ?? "",
            postalCode: deliveryAddress?.postCode ?? "",
            city: deliveryAddress?.city ?? "",
            country: deliveryAddress?.country ?? "",
            phone: "",
            mobile: "",
            email: updatedReturn.item.order?.client?.email ?? ""
        },
        billingAddress: {
            firstName: billingAddress?.firstName ?? "",
            lastName: billingAddress?.lastName ?? "",
            address: billingAddress?.address ?? "",
            address2: billingAddress?.address2 ?? "",
            address3: billingAddress?.address3 ?? "",
            postalCode: billingAddress?.postCode ?? "",
            city: billingAddress?.city ?? "",
            country: billingAddress?.country ?? "",
            phone: "",
            mobile: "",
            email: updatedReturn.item.order?.client?.email ?? ""
        }
    });

    if (data.label) {        
        const returnRepository = await getInjection("IReturnRepository");
        const updateReturn = await returnRepository.updateReturn(updatedReturn.item.id!, {
            ...updatedReturn.item,
            trackingNumber: data.trackingNumber
        });
        if (updateReturn.error) {
            throw new InternalServerError(updateReturn.error);
        }        
        // check if data.label is json array
        if (!Array.isArray(data.label)) {
            await sendEmail({ return: updatedReturn.item, label: undefined }, 'request');
        } else {
            const b64 = Buffer.from(JSON.stringify(data.label)).toString('base64');
            await sendEmail({ return: updatedReturn.item, label: b64 }, 'request');
        }
    }
};