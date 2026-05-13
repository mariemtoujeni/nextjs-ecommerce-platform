import { OrderStatus } from "@repo/core/models";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ValidatePaymentUseCase } from "@repo/core/usecases";

const SystemPayPassword = {
  TEST: process.env.SYSTEMPAY_TEST_API_SECRET!,
  PROD: process.env.SYSTEMPAY_PROD_API_SECRET!,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("Content-Type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      throw new Error(
        "Unsupported content type. Expected multipart/form-data for SystemPay."
      );
    }

    const form = await req.formData();

    const algo = form.get("kr-hash-algorithm") as string;
    if (algo !== "sha256_hmac") {
      throw new Error("Invalid hash algorithm");
    }

    const krAnswerRaw = form.get("kr-answer") as string;
    if (!krAnswerRaw) {
      throw new Error("Missing kr-answer");
    }

    const answer = JSON.parse(krAnswerRaw);
    if (answer.orderStatus !== "PAID") {
      throw new Error("Order not paid");
    }

    const mode = answer.orderDetails.mode as keyof typeof SystemPayPassword;
    const hashPassword = SystemPayPassword[mode];
    if (!hashPassword) {
      throw new Error("Invalid SystemPayPassword config");
    }

    const expectedHash = form.get("kr-hash") as string;
    const computedHmac = crypto
      .createHmac("sha256", hashPassword)
      .update(krAnswerRaw, "utf8")
      .digest("hex");
    if (expectedHash !== computedHmac) {
      throw new Error("Invalid hash");
    }

    const autorisation = answer.transactions.map((t: any) => t.uuid).join(",");

    await ValidatePaymentUseCase("SYSTEMPAY",
      {
        answer,
        autorisation,
        commandeStatut: OrderStatus.PAIMENT_ACCEPTE,
      });

    return new NextResponse(null, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error("SystemPay processing error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders }
    );
  }
}
