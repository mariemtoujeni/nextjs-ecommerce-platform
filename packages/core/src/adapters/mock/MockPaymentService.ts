import { IPaymentService } from "../../services";
import { BodyResponse } from "../../types/utils";

export class MockPaymentService implements IPaymentService {
    async generateToken(payload: Record<string, any>): Promise<BodyResponse> {
        return {
            success: true,
            data: {
                formToken: "example-form-token" 
            },
            pubKey: "example-pubKey"       
        };
    }
}
