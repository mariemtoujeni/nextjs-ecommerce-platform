import { Supplier } from "../../models";
import { ReturnAll, getInjection } from "../../types";

export const getSuppliersUsecase = async (): Promise<ReturnAll<Supplier>> => {
    const supplierRepository = await getInjection("ISupplierRepository");

    const suppliers = await supplierRepository.readAll({
        limit: 200, offset: 0, sort: "asc",
        search: ""
    });

    return suppliers;
}