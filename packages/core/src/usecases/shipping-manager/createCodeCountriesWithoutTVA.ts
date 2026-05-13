import { CountryCode } from "../../models";
import { getInjection } from "../../types";
import { BadRequestError } from "../../types";

export const createCodeCountriesWithoutTVAUseCase = async (code: string): Promise<CountryCode> => {
    const shipmentConf = await getInjection("IShippingManagerRepository");

    const codes = await shipmentConf.readCodeCountriesWithoutTVA();
    if (!codes) {
        throw new Error("Codes countries not found");
    }

    const codesArray = codes.map((code: { code: string }) => code.code);
    if (codesArray.includes(code)) {
        throw new BadRequestError("Code already exists");
    }

    const newCode = await shipmentConf.createCodeCountriesWithoutTVA(code);
    return newCode;
}