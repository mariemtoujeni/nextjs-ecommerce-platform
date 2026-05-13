import { ErrorCodes } from "../types/error";

export interface BodyResponse {
  success: boolean;
  message?: string;
  error?: ErrorCodes;
  code?: string;
  data?: any;
}

