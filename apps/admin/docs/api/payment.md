# SystemPay Payment Validation API Documentation

## Overview
This endpoint handles payment validation callbacks from SystemPay payment gateway. It verifies transaction authenticity, processes successful payments, and updates order status.

## Endpoint

POST /api/checkout/payment

## Authentication

Requests are authenticated using HMAC-SHA256 signatures. The endpoint validates signatures against environment-configured secrets:
- Test environment: `SYSTEMPAY_TEST_API_SECRET`
- Production environment: `SYSTEMPAY_PROD_API_SECRET`

## Request Format

**Content-Type:** `multipart/form-data`

**Required Form Fields:**

| Field              | Description                          | Example Value     |
|--------------------|--------------------------------------|-------------------|
| `kr-hash-algorithm` | Hashing algorithm (must be sha256)   | `sha256_hmac`     |
| `kr-answer`         | JSON payload of transaction details  | `{"orderStatus":"PAID",...}` |
| `kr-hash`           | HMAC signature of the payload        | `a3f4c8d9...`     |

## Response

### Success Response

**Status Code:** `200 OK`  
**Body:** Empty response  
**Headers:** Includes CORS permissions

### Error Responses

**Bad Request (400)**  
```json
{
  "error": "Detailed error message"
}

Common Error Scenarios:

    Invalid content type

    Unsupported hash algorithm

    Missing kr-answer field

    Order not in PAID status

    HMAC signature mismatch

    Invalid environment configuration

Processing Workflow

    Content Verification: Checks for multipart/form-data content type

    Hash Validation:

        Validates sha256_hmac algorithm

        Computes HMAC using environment secret

        Compares with provided kr-hash

    Payment Verification:

        Parses kr-answer JSON

        Confirms orderStatus is PAID

    Order Update:

        Extracts transaction UUIDs

        Updates order status to PAIMENT_ACCEPTE

        Persists payment details

Notes

    CORS Configuration: Allows cross-origin requests from any domain (Access-Control-Allow-Origin: *)

    Environment Handling: Automatically switches between test/production secrets based on payload

    Security Requirements:

        Server must have valid SYSTEMPAY_*_API_SECRET environment variables

        Endpoint should be protected against CSRF attacks

        Payment details should never be logged

    Error Handling: All errors return 400 with descriptive messages 
