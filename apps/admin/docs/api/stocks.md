# Stocks API Documentation

## Update Supplier Stock

This endpoint allows you to update supplier stock information in the system.

### Endpoint

```
POST /api/stocks
```

### Authentication

The API requires authentication using an API key. The API key should be included in the request headers.

**Header:**
```
Authorization: <your-api-key>
```

### Request Body

The request body should contain the stock update data in JSON format.

```json
{
  // Stock update data structure
}
```

### Response

#### Success Response

**Status Code:** 200 OK

```json
{
  "message": "Processed stock updated successfully"
}
```

#### Error Responses

**Unauthorized (401)**
```json
{
  "error": "Unauthorized access"
}
```

**Bad Request (400)**
```json
{
  "error": "<error message>"
}
```

### Notes

- Ensure you have valid API credentials before making requests
- The API key should be kept secure and not exposed in client-side code
- All requests must include the `Content-Type: application/json` header 