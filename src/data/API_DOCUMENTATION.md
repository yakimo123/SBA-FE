# ElectroShop REST API Documentation

**Version:** 1.0.0  
**Spec:** OAS 3.0  
**Base URL:** `http://localhost:8080`  
**Date:** 2026-03-05

---

## Authentication

All protected endpoints require a Bearer JWT token in the `Authorization` header.

1. Call `POST /api/v1/auth/login` with your credentials.
2. Copy the `accessToken` from the response.
3. Set the header: `Authorization: Bearer <accessToken>`

---

## Table of Contents

| # | Module | Base Path |
|---|--------|-----------|
| 1 | [Authentication](#1-authentication) | `/api/v1/auth` |
| 2 | [Attribute](#2-attribute) | `/api/v1/attributes` |
| 3 | [Brand](#3-brand) | `/api/v1/brands` |
| 4 | [Bulk Order](#4-bulk-order) | `/api/v1/bulk-orders` |
| 5 | [Category](#5-category) | `/api/v1/categories` |
| 6 | [Media](#6-media) | `/api/v1/media` |
| 7 | [Order](#7-order) | `/api/v1/orders` |
| 8 | [Product](#8-product) | `/api/v1/products` |
| 9 | [Review](#9-review) | `/api/v1/reviews` |
| 10 | [Shopping Cart](#10-shopping-cart) | `/api/v1/cart` |
| 11 | [Store Branch](#11-store-branch) | `/api/v1/branches` |
| 12 | [Supplier](#12-supplier) | `/api/v1/suppliers` |
| 13 | [User](#13-user) | `/api/v1/users` |
| 14 | [Voucher](#14-voucher) | `/api/v1/vouchers` |
| 15 | [Warranty](#15-warranty) | `/api/v1/warranties` |
| 16 | [Wishlist](#16-wishlist) | `/api/v1/wishlist` |

---

## Common Response Wrapper

All endpoints return responses in the following envelope:

```json
{
  "status": 200,
  "message": "string",
  "data": { },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

### Paginated Response (`data` field)

```json
{
  "content": [ ],
  "totalElements": 0,
  "totalPages": 0,
  "size": 0,
  "number": 0,
  "first": true,
  "last": true,
  "numberOfElements": 0,
  "empty": true
}
```

### Pageable Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | `0` | Page index (0-based) |
| `size` | integer | No | `20` | Page size |
| `sort` | string | No | — | Sort field and direction, e.g. `name,asc` |

---

---

## 1. Authentication

> **Tag:** `auth-controller`  
> Public endpoints — no token required.

---

### `POST /api/v1/auth/register`

Register a new user account.

**Request Body** (`application/json`)

```json
{
  "email": "user@example.com",
  "password": "string",
  "fullName": "string",
  "phoneNumber": "0912345678"
}
```

**Response `201 Created`**

```json
{
  "status": 201,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "fullName": "string",
    "role": "USER",
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/auth/login`

Authenticate a user and retrieve access + refresh tokens.

**Request Body** (`application/json`)

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "fullName": "string",
    "role": "USER",
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/auth/refresh`

Obtain a new access token using a valid refresh token.

**Request Body** (`application/json`)

```json
{
  "refreshToken": "string"
}
```

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

---

## 2. Attribute

> **Tag:** `attribute-controller`  
> 🔒 Requires authentication (Admin role for write operations).

---

### `GET /api/v1/attributes`

Get a paginated list of attributes, optionally filtered by keyword.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | No | Filter by attribute name |
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "attributeId": 1,
        "attributeName": "Color"
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/attributes`

Create a new attribute.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `attributeName` | string | ✅ | Name of the attribute |

**Response `201 Created`**

```json
{
  "status": 201,
  "message": "Attribute created",
  "data": {
    "attributeId": 1,
    "attributeName": "Color"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `GET /api/v1/attributes/{id}`

Get a single attribute by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Attribute ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "attributeId": 1,
    "attributeName": "Color"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `PUT /api/v1/attributes/{id}`

Update an existing attribute by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Attribute ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `attributeName` | string | ✅ | New attribute name |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Attribute updated",
  "data": {
    "attributeId": 1,
    "attributeName": "Size"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `DELETE /api/v1/attributes/{id}`

Delete an attribute by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Attribute ID |

**Response `204 No Content`**

```json
{
  "status": 204,
  "message": "Attribute deleted",
  "data": null,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

---

## 3. Brand

> **Tag:** `brand-controller`  
> 🔒 Requires authentication (Admin role for write operations).

---

### `GET /api/v1/brands`

Get a paginated list of brands, optionally filtered by keyword.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | No | Filter by brand name |
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "brandId": 1,
        "brandName": "Samsung",
        "country": "South Korea",
        "description": "string"
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/brands`

Create a new brand.

**Request Body** (`application/json`)

```json
{
  "brandName": "Samsung",
  "country": "South Korea",
  "description": "string"
}
```

**Response `201 Created`**

```json
{
  "status": 201,
  "message": "Brand created",
  "data": {
    "brandId": 1,
    "brandName": "Samsung",
    "country": "South Korea",
    "description": "string"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `GET /api/v1/brands/{id}`

Get a single brand by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Brand ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "brandId": 1,
    "brandName": "Samsung",
    "country": "South Korea",
    "description": "string"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `PUT /api/v1/brands/{id}`

Update an existing brand by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Brand ID |

**Request Body** (`application/json`)

```json
{
  "brandName": "Apple",
  "country": "USA",
  "description": "string"
}
```

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Brand updated",
  "data": {
    "brandId": 1,
    "brandName": "Apple",
    "country": "USA",
    "description": "string"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `DELETE /api/v1/brands/{id}`

Delete a brand by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Brand ID |

**Response `204 No Content`**

```json
{
  "status": 204,
  "message": "Brand deleted",
  "data": null,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

---

## 4. Bulk Order

> **Tag:** `bulk-order-controller`  
> 🔒 Requires authentication.

---

### `GET /api/v1/bulk-orders`

Get a paginated list of bulk orders, optionally filtered by user and status.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | No | Filter by user ID |
| `status` | string | No | Filter by status: `PENDING`, `APPROVED`, `REJECTED`, `PROCESSING`, `COMPLETED`, `CANCELLED` |
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "bulkOrderId": 1,
        "userId": 1,
        "userFullName": "Nguyen Van A",
        "createdAt": "2026-03-05T09:00:00.000Z",
        "status": "PENDING",
        "totalPrice": 5000000,
        "details": [
          {
            "bulkOrderDetailId": 1,
            "productId": 1,
            "productName": "iPhone 15",
            "quantity": 10,
            "unitPriceSnapshot": 500000,
            "discountSnapshot": 0,
            "appliedTierPrice": 490000,
            "customizationFee": 0,
            "lineTotal": 4900000,
            "priceTiers": [
              {
                "bulkPriceTierId": 1,
                "minQty": 5,
                "unitPrice": 490000
              }
            ],
            "customizations": [
              {
                "customizationId": 1,
                "type": "ENGRAVING",
                "note": "string",
                "status": "PENDING",
                "extraFee": 50000
              }
            ]
          }
        ]
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/bulk-orders`

Create a new bulk order for a user.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | ID of the user placing the order |

**Request Body** (`application/json`)

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 10
    }
  ]
}
```

**Response `201 Created`** — returns the created `BulkOrderResponse` (same schema as GET by ID).

---

### `GET /api/v1/bulk-orders/{id}`

Get a bulk order by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Bulk order ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "bulkOrderId": 1,
    "userId": 1,
    "userFullName": "Nguyen Van A",
    "createdAt": "2026-03-05T09:00:00.000Z",
    "status": "PENDING",
    "totalPrice": 4900000,
    "details": [ ]
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `GET /api/v1/bulk-orders/{id}/price-breakdown`

Get full price breakdown for a bulk order (includes tier pricing and customization fees).

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Bulk order ID |

**Response `200 OK`** — same schema as `GET /api/v1/bulk-orders/{id}`.

---

### `PATCH /api/v1/bulk-orders/{id}/status`

Update the status of a bulk order.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Bulk order ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | ✅ | New status: `PENDING`, `APPROVED`, `REJECTED`, `PROCESSING`, `COMPLETED`, `CANCELLED` |

**Response `200 OK`** — returns the updated `BulkOrderResponse`.

---

### `POST /api/v1/bulk-orders/details/{detailId}/customization`

Add a customization request to a bulk order detail line.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `detailId` | integer | ✅ | Bulk order detail ID |

**Request Body** (`application/json`)

```json
{
  "type": "ENGRAVING",
  "note": "Please engrave logo",
  "extraFee": 50000
}
```

**Response `201 Created`** — returns the updated `BulkOrderResponse`.

---

---

## 5. Category

> **Tag:** `category-controller`  
> 🔒 Requires authentication (Admin role for write operations).

---

### `GET /api/v1/categories`

Get a paginated list of categories, optionally filtered by keyword.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | No | Filter by category name |
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "categoryId": 1,
        "categoryName": "Smartphones",
        "description": "string"
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/categories`

Create a new category.

**Request Body** (`application/json`)

```json
{
  "categoryName": "Smartphones",
  "description": "Mobile phones and accessories"
}
```

**Response `201 Created`**

```json
{
  "status": 201,
  "message": "Category created",
  "data": {
    "categoryId": 1,
    "categoryName": "Smartphones",
    "description": "Mobile phones and accessories"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `GET /api/v1/categories/{id}`

Get a single category by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Category ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "categoryId": 1,
    "categoryName": "Smartphones",
    "description": "string"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `PUT /api/v1/categories/{id}`

Update a category by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Category ID |

**Request Body** (`application/json`)

```json
{
  "categoryName": "Laptops",
  "description": "Portable computers"
}
```

**Response `200 OK`** — returns the updated `CategoryResponse`.

---

### `DELETE /api/v1/categories/{id}`

Delete a category by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Category ID |

**Response `204 No Content`**

```json
{
  "status": 204,
  "message": "Category deleted",
  "data": null,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

---

## 6. Media

> **Tag:** `media-controller`  
> 🔒 Requires authentication (Admin role for write operations).

---

### `GET /api/v1/media/product/{productId}`

Get all media items for a product.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | integer | ✅ | Product ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "mediaId": 1,
      "productId": 1,
      "type": "IMAGE",
      "url": "https://example.com/image.jpg",
      "sortOrder": 1
    }
  ],
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/media`

Add a media item to a product.

**Request Body** (`application/json`)

```json
{
  "productId": 1,
  "type": "IMAGE",
  "url": "https://example.com/image.jpg",
  "sortOrder": 1
}
```

> `type` values: `IMAGE`, `VIDEO`

**Response `201 Created`**

```json
{
  "status": 201,
  "message": "Media created",
  "data": {
    "mediaId": 1,
    "productId": 1,
    "type": "IMAGE",
    "url": "https://example.com/image.jpg",
    "sortOrder": 1
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `GET /api/v1/media/{id}`

Get a single media item by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Media ID |

**Response `200 OK`** — returns `MediaResponse` (same fields as above).

---

### `PUT /api/v1/media/{id}`

Update a media item by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Media ID |

**Request Body** (`application/json`)

```json
{
  "productId": 1,
  "type": "VIDEO",
  "url": "https://example.com/video.mp4",
  "sortOrder": 2
}
```

**Response `200 OK`** — returns the updated `MediaResponse`.

---

### `PATCH /api/v1/media/{id}/sort-order`

Update only the sort order of a media item.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Media ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sortOrder` | integer | ✅ | New sort order value |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Sort order updated",
  "data": null,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `DELETE /api/v1/media/{id}`

Delete a media item by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Media ID |

**Response `204 No Content`**

---

---

## 7. Order

> **Tag:** `order-controller`  
> 🔒 Requires authentication.

---

### `GET /api/v1/orders`

Get a paginated list of orders, optionally filtered by user and status.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | No | Filter by user ID |
| `status` | string | No | Filter by status: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED` |
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "orderId": 1,
        "userId": 1,
        "userFullName": "Nguyen Van A",
        "orderDate": "2026-03-05T09:00:00.000Z",
        "totalAmount": 1500000,
        "orderStatus": "PENDING",
        "shippingAddress": "123 Main St, HCM City",
        "paymentMethod": "COD",
        "voucherCode": "SALE10"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/orders`

Place a new order.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | ID of the user placing the order |

**Request Body** (`application/json`)

```json
{
  "shippingAddress": "123 Main St, HCM City",
  "paymentMethod": "COD",
  "voucherCode": "SALE10",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "branchId": 1
    }
  ]
}
```

**Response `201 Created`**

```json
{
  "status": 201,
  "message": "Order placed successfully",
  "data": {
    "orderId": 1,
    "userId": 1,
    "userFullName": "Nguyen Van A",
    "orderDate": "2026-03-05T09:00:00.000Z",
    "totalAmount": 1500000,
    "orderStatus": "PENDING",
    "shippingAddress": "123 Main St, HCM City",
    "paymentMethod": "COD",
    "voucherCode": "SALE10"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `GET /api/v1/orders/{id}`

Get an order by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Order ID |

**Response `200 OK`** — returns `OrderResponse` (same schema as above item).

---

### `PATCH /api/v1/orders/{id}/status`

Update the status of an order (Admin).

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Order ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | ✅ | New status: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED` |

**Response `200 OK`** — returns updated `OrderResponse`.

---

### `POST /api/v1/orders/{id}/voucher`

Apply a voucher to an existing order.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Order ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `voucherCode` | string | ✅ | Voucher code to apply |

**Response `200 OK`** — returns updated `OrderResponse`.

---

### `POST /api/v1/orders/{id}/cancel`

Cancel an order.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Order ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Order cancelled",
  "data": null,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

---

## 8. Product

> **Tag:** `product-controller`  
> 🔒 Requires authentication (Admin role for write operations).

---

### `GET /api/v1/products`

Get a paginated list of products, optionally filtered by keyword, category, or brand.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | No | Filter by product name |
| `categoryId` | integer | No | Filter by category ID |
| `brandId` | integer | No | Filter by brand ID |
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "productId": 1,
        "productName": "iPhone 15 Pro",
        "description": "string",
        "price": 25000000,
        "categoryId": 1,
        "categoryName": "Smartphones",
        "brandId": 1,
        "brandName": "Apple",
        "quantity": 100,
        "status": "ACTIVE",
        "createdDate": "2026-03-05T09:00:00.000Z",
        "supplierId": 1,
        "supplierName": "Apple Vietnam"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/products`

Create a new product.

**Request Body** (`application/json`)

```json
{
  "productName": "iPhone 15 Pro",
  "description": "string",
  "price": 25000000,
  "categoryId": 1,
  "brandId": 1,
  "quantity": 100,
  "supplierId": 1,
  "status": "ACTIVE"
}
```

**Response `201 Created`**

```json
{
  "status": 201,
  "message": "Product created",
  "data": {
    "productId": 1,
    "productName": "iPhone 15 Pro",
    "description": "string",
    "price": 25000000,
    "categoryId": 1,
    "categoryName": "Smartphones",
    "brandId": 1,
    "brandName": "Apple",
    "quantity": 100,
    "status": "ACTIVE",
    "createdDate": "2026-03-05T09:00:00.000Z",
    "supplierId": 1,
    "supplierName": "Apple Vietnam"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `GET /api/v1/products/{id}`

Get a single product by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Product ID |

**Response `200 OK`** — returns `ProductResponse` (same schema as above item).

---

### `PUT /api/v1/products/{id}`

Update a product by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Product ID |

**Request Body** (`application/json`)

```json
{
  "productName": "iPhone 15 Pro Max",
  "description": "string",
  "price": 30000000,
  "categoryId": 1,
  "brandId": 1,
  "quantity": 50,
  "status": "ACTIVE",
  "supplierId": 1
}
```

**Response `200 OK`** — returns the updated `ProductResponse`.

---

### `PATCH /api/v1/products/{id}/stock`

Update the stock quantity of a product.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Product ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quantity` | integer | ✅ | New stock quantity |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Stock updated",
  "data": null,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `DELETE /api/v1/products/{id}`

Delete a product by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Product ID |

**Response `204 No Content`**

---

---

## 9. Review

> **Tag:** `review-controller`  
> 🔒 Requires authentication.

---

### `GET /api/v1/reviews`

Get a paginated list of reviews, optionally filtered by product or user.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | integer | No | Filter by product ID |
| `userId` | integer | No | Filter by user ID |
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "reviewId": 1,
        "userId": 1,
        "userFullName": "Nguyen Van A",
        "productId": 1,
        "productName": "iPhone 15 Pro",
        "rating": 5,
        "comment": "Great product!",
        "reviewDate": "2026-03-05T09:00:00.000Z"
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/reviews`

Create a review for a product.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | ID of the reviewing user |

**Request Body** (`application/json`)

```json
{
  "productId": 1,
  "rating": 5,
  "comment": "Great product!"
}
```

> `rating`: integer from `1` to `5`

**Response `201 Created`** — returns `ReviewResponse`.

---

### `GET /api/v1/reviews/{id}`

Get a single review by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Review ID |

**Response `200 OK`** — returns `ReviewResponse`.

---

### `PUT /api/v1/reviews/{id}`

Update a review by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Review ID |

**Request Body** (`application/json`)

```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

**Response `200 OK`** — returns the updated `ReviewResponse`.

---

### `GET /api/v1/reviews/product/{productId}/rating`

Get the average rating for a product.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | integer | ✅ | Product ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": 4.5,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `DELETE /api/v1/reviews/{id}`

Delete a review by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Review ID |

**Response `204 No Content`**

---

---

## 10. Shopping Cart

> **Tag:** `shopping-cart-controller`  
> 🔒 Requires authentication.

---

### `GET /api/v1/cart/{userId}`

Get the shopping cart for a user.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | User ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "cartId": 1,
    "userId": 1,
    "items": [
      {
        "productId": 1,
        "productName": "iPhone 15 Pro",
        "price": 25000000,
        "quantity": 2,
        "subtotal": 50000000
      }
    ],
    "totalAmount": 50000000,
    "totalItems": 2
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/cart/{userId}/items`

Add a product to the cart.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | User ID |

**Request Body** (`application/json`)

```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response `201 Created`** — returns updated `CartResponse`.

---

### `PATCH /api/v1/cart/{userId}/items/{productId}`

Update the quantity of a product in the cart.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | User ID |
| `productId` | integer | ✅ | Product ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quantity` | integer | ✅ | New quantity |

**Response `200 OK`** — returns updated `CartResponse`.

---

### `DELETE /api/v1/cart/{userId}/items/{productId}`

Remove a specific product from the cart.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | User ID |
| `productId` | integer | ✅ | Product ID |

**Response `204 No Content`**

---

### `DELETE /api/v1/cart/{userId}`

Clear all items from a user's cart.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | User ID |

**Response `204 No Content`**

---

---

## 11. Store Branch

> **Tag:** `store-branch-controller`  
> 🔒 Requires authentication (Admin role for write operations).

---

### `GET /api/v1/branches`

Get a paginated list of store branches, optionally filtered by keyword.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | No | Filter by branch name or location |
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "branchId": 1,
        "branchName": "Hanoi Branch",
        "location": "123 Ba Dinh, Hanoi",
        "managerName": "Tran Van B",
        "contactNumber": "0912345678"
      }
    ],
    "totalElements": 3,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/branches`

Create a new store branch.

**Request Body** (`application/json`)

```json
{
  "branchName": "Hanoi Branch",
  "location": "123 Ba Dinh, Hanoi",
  "managerName": "Tran Van B",
  "contactNumber": "0912345678"
}
```

**Response `201 Created`**

```json
{
  "status": 201,
  "message": "Branch created",
  "data": {
    "branchId": 1,
    "branchName": "Hanoi Branch",
    "location": "123 Ba Dinh, Hanoi",
    "managerName": "Tran Van B",
    "contactNumber": "0912345678"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `GET /api/v1/branches/{id}`

Get a single branch by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Branch ID |

**Response `200 OK`** — returns `BranchResponse`.

---

### `PUT /api/v1/branches/{id}`

Update a branch by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Branch ID |

**Request Body** (`application/json`)

```json
{
  "branchName": "HCM Branch",
  "location": "456 District 1, Ho Chi Minh City",
  "managerName": "Le Van C",
  "contactNumber": "0987654321"
}
```

**Response `200 OK`** — returns the updated `BranchResponse`.

---

### `DELETE /api/v1/branches/{id}`

Delete a branch by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Branch ID |

**Response `204 No Content`**

---

### `GET /api/v1/branches/{branchId}/products/{productId}/stock`

Get the stock quantity of a specific product at a specific branch.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branchId` | integer | ✅ | Branch ID |
| `productId` | integer | ✅ | Product ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": 50,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `PATCH /api/v1/branches/{branchId}/products/{productId}/stock`

Update the stock quantity of a product at a specific branch.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branchId` | integer | ✅ | Branch ID |
| `productId` | integer | ✅ | Product ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quantity` | integer | ✅ | New stock quantity |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Branch stock updated",
  "data": null,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

---

## 12. Supplier

> **Tag:** `supplier-controller`  
> 🔒 Requires authentication (Admin role for write operations).

---

### `GET /api/v1/suppliers`

Get a paginated list of suppliers, optionally filtered by keyword.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | No | Filter by supplier name |
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "supplierId": 1,
        "supplierName": "Apple Vietnam",
        "contactPerson": "Nguyen Van A",
        "email": "contact@applevn.com",
        "phoneNumber": "0912345678",
        "address": "123 Tech Park, HCM City"
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/suppliers`

Create a new supplier.

**Request Body** (`application/json`)

```json
{
  "supplierName": "Apple Vietnam",
  "contactPerson": "Nguyen Van A",
  "email": "contact@applevn.com",
  "phoneNumber": "0912345678",
  "address": "123 Tech Park, HCM City"
}
```

**Response `201 Created`**

```json
{
  "status": 201,
  "message": "Supplier created",
  "data": {
    "supplierId": 1,
    "supplierName": "Apple Vietnam",
    "contactPerson": "Nguyen Van A",
    "email": "contact@applevn.com",
    "phoneNumber": "0912345678",
    "address": "123 Tech Park, HCM City"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `GET /api/v1/suppliers/{id}`

Get a single supplier by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Supplier ID |

**Response `200 OK`** — returns `SupplierResponse`.

---

### `PUT /api/v1/suppliers/{id}`

Update a supplier by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Supplier ID |

**Request Body** (`application/json`)

```json
{
  "supplierName": "Samsung Vietnam",
  "contactPerson": "Tran Van B",
  "email": "contact@samsungvn.com",
  "phoneNumber": "0987654321",
  "address": "456 Tech Zone, Hanoi"
}
```

**Response `200 OK`** — returns the updated `SupplierResponse`.

---

### `DELETE /api/v1/suppliers/{id}`

Delete a supplier by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Supplier ID |

**Response `204 No Content`**

---

### `GET /api/v1/suppliers/{supplierId}/products`

Get a paginated list of products supplied by a specific supplier.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `supplierId` | integer | ✅ | Supplier ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "productId": 1,
        "productName": "iPhone 15 Pro",
        "description": "string",
        "price": 25000000,
        "categoryId": 1,
        "categoryName": "Smartphones",
        "brandId": 1,
        "brandName": "Apple",
        "quantity": 100,
        "status": "ACTIVE",
        "createdDate": "2026-03-05T09:00:00.000Z",
        "supplierId": 1,
        "supplierName": "Apple Vietnam"
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

---

## 13. User

> **Tag:** `user-controller`  
> 🔒 **Admin only** — all endpoints require ADMIN role.

---

### `GET /api/v1/users`

Search users with optional filters.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | No | Filter by email address |
| `phoneNumber` | string | No | Filter by phone number |
| `status` | string | No | Filter by status: `ACTIVE`, `INACTIVE` |
| `page` | integer | No | Page index (default: `0`) |
| `size` | integer | No | Page size (default: `20`) |
| `sort` | string | No | Sort field (default: `fullName,asc`) |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "userId": 1,
        "email": "user@example.com",
        "fullName": "Nguyen Van A",
        "phoneNumber": "0912345678",
        "address": "123 Main St",
        "role": "USER",
        "isActive": true,
        "registrationDate": "2026-01-01T00:00:00.000Z",
        "status": "ACTIVE",
        "rewardPoint": 100
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/users`

Create a new user with role assignment.

**Request Body** (`application/json`)

```json
{
  "email": "user@example.com",
  "password": "string",
  "fullName": "Nguyen Van A",
  "phoneNumber": "0912345678",
  "address": "123 Main St",
  "roleId": 2
}
```

**Response `201 Created`** — returns `UserResponse`.

---

### `GET /api/v1/users/{id}`

Get a user by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | User ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "phoneNumber": "0912345678",
    "address": "123 Main St",
    "role": "USER",
    "isActive": true,
    "registrationDate": "2026-01-01T00:00:00.000Z",
    "status": "ACTIVE",
    "rewardPoint": 100
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `PUT /api/v1/users/{id}`

Update user information by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | User ID |

**Request Body** (`application/json`)

```json
{
  "fullName": "Nguyen Van B",
  "phoneNumber": "0987654321",
  "address": "456 New St",
  "status": "ACTIVE"
}
```

**Response `200 OK`** — returns updated `UserResponse`.

---

### `DELETE /api/v1/users/{id}`

Delete a user by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | User ID |

**Response `204 No Content`**

---

### `GET /api/v1/users/email/{email}`

Get a user by email address.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | ✅ | User email address |

**Response `200 OK`** — returns `UserResponse`.

---

### `PATCH /api/v1/users/{id}/status`

Change user status (activate or deactivate).

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | User ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | ✅ | New status: `ACTIVE`, `INACTIVE` |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "User status updated",
  "data": null,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/users/{id}/reward-points`

Add reward points to a user's account.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | User ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `points` | integer | ✅ | Number of points to add |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Reward points added",
  "data": null,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

---

## 14. Voucher

> **Tag:** `voucher-controller`  
> 🔒 Requires authentication (Admin role for write operations).

---

### `GET /api/v1/vouchers`

Get a paginated list of vouchers, optionally filtered by keyword and validity.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | No | Filter by voucher code or description |
| `validOnly` | boolean | No | If `true`, returns only currently valid vouchers |
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "voucherId": 1,
        "voucherCode": "SALE10",
        "description": "10% off all products",
        "discountValue": 10,
        "discountType": "PERCENTAGE",
        "validFrom": "2026-01-01T00:00:00.000Z",
        "validTo": "2026-12-31T23:59:59.000Z",
        "usageLimit": 100,
        "isValid": true
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/vouchers`

Create a new voucher.

**Request Body** (`application/json`)

```json
{
  "voucherCode": "SALE10",
  "description": "10% off all products",
  "discountValue": 10,
  "discountType": "PERCENTAGE",
  "validFrom": "2026-01-01T00:00:00.000Z",
  "validTo": "2026-12-31T23:59:59.000Z",
  "usageLimit": 100
}
```

> `discountType` values: `PERCENTAGE`, `FIXED_AMOUNT`

**Response `201 Created`** — returns `VoucherResponse`.

---

### `GET /api/v1/vouchers/{id}`

Get a voucher by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Voucher ID |

**Response `200 OK`** — returns `VoucherResponse`.

---

### `PUT /api/v1/vouchers/{id}`

Update a voucher by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Voucher ID |

**Request Body** (`application/json`)

```json
{
  "description": "Updated description",
  "discountValue": 15,
  "discountType": "PERCENTAGE",
  "validFrom": "2026-02-01T00:00:00.000Z",
  "validTo": "2026-12-31T23:59:59.000Z",
  "usageLimit": 200
}
```

**Response `200 OK`** — returns the updated `VoucherResponse`.

---

### `DELETE /api/v1/vouchers/{id}`

Delete a voucher by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Voucher ID |

**Response `204 No Content`**

---

### `GET /api/v1/vouchers/code/{code}`

Get a voucher by its code string.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | ✅ | Voucher code |

**Response `200 OK`** — returns `VoucherResponse`.

---

### `GET /api/v1/vouchers/validate`

Validate whether a voucher code is usable by a specific user.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | ✅ | Voucher code to validate |
| `userId` | integer | ✅ | User ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Voucher is valid",
  "data": true,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/vouchers/{voucherId}/assign/{userId}`

Assign a voucher to a specific user.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `voucherId` | integer | ✅ | Voucher ID |
| `userId` | integer | ✅ | User ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Voucher assigned",
  "data": null,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

---

## 15. Warranty

> **Tag:** `warranty-controller`  
> 🔒 Requires authentication (Admin role for write operations).

---

### `GET /api/v1/warranties/product/{productId}`

Get a paginated list of warranties for a specific product.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | integer | ✅ | Product ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page index |
| `size` | integer | No | Page size |
| `sort` | string | No | Sort field |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "warrantyId": 1,
        "productId": 1,
        "productName": "iPhone 15 Pro",
        "warrantyPeriodMonths": 24,
        "warrantyTerms": "Covers manufacturing defects",
        "startDate": "2026-01-01T00:00:00.000Z",
        "endDate": "2028-01-01T00:00:00.000Z"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/warranties`

Create a new warranty for a product.

**Request Body** (`application/json`)

```json
{
  "productId": 1,
  "warrantyPeriodMonths": 24,
  "warrantyTerms": "Covers manufacturing defects",
  "startDate": "2026-01-01T00:00:00.000Z"
}
```

> `endDate` is automatically computed as `startDate + warrantyPeriodMonths`.

**Response `201 Created`**

```json
{
  "status": 201,
  "message": "Warranty created",
  "data": {
    "warrantyId": 1,
    "productId": 1,
    "productName": "iPhone 15 Pro",
    "warrantyPeriodMonths": 24,
    "warrantyTerms": "Covers manufacturing defects",
    "startDate": "2026-01-01T00:00:00.000Z",
    "endDate": "2028-01-01T00:00:00.000Z"
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `GET /api/v1/warranties/{id}`

Get a warranty by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Warranty ID |

**Response `200 OK`** — returns `WarrantyResponse`.

---

### `PUT /api/v1/warranties/{id}`

Update a warranty by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Warranty ID |

**Request Body** (`application/json`)

```json
{
  "productId": 1,
  "warrantyPeriodMonths": 36,
  "warrantyTerms": "Extended warranty - covers all defects",
  "startDate": "2026-01-01T00:00:00.000Z"
}
```

**Response `200 OK`** — returns the updated `WarrantyResponse`.

---

### `GET /api/v1/warranties/{id}/validate`

Check whether a warranty is still active (not expired).

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Warranty ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": true,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

> Returns `true` if the warranty has not expired, `false` otherwise.

---

### `DELETE /api/v1/warranties/{id}`

Delete a warranty by ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Warranty ID |

**Response `204 No Content`**

---

---

## 16. Wishlist

> **Tag:** `wishlist-controller`  
> 🔒 Requires authentication.

---

### `GET /api/v1/wishlist/{userId}`

Get the wishlist for a user.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | User ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "wishlistId": 1,
    "userId": 1,
    "createdDate": "2026-03-05T09:00:00.000Z",
    "items": [
      {
        "productId": 1,
        "productName": "iPhone 15 Pro",
        "productImageUrl": "https://example.com/image.jpg",
        "createdDate": "2026-03-05T09:00:00.000Z"
      }
    ]
  },
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `POST /api/v1/wishlist/{userId}/items/{productId}`

Add a product to the wishlist.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | User ID |
| `productId` | integer | ✅ | Product ID |

**Response `201 Created`** — returns updated `WishlistResponse`.

---

### `GET /api/v1/wishlist/{userId}/items/{productId}/check`

Check if a product is in the user's wishlist.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | User ID |
| `productId` | integer | ✅ | Product ID |

**Response `200 OK`**

```json
{
  "status": 200,
  "message": "Success",
  "data": true,
  "timestamp": "2026-03-05T09:00:00.000Z"
}
```

---

### `DELETE /api/v1/wishlist/{userId}/items/{productId}`

Remove a specific product from the wishlist.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | User ID |
| `productId` | integer | ✅ | Product ID |

**Response `204 No Content`**

---

### `DELETE /api/v1/wishlist/{userId}`

Clear all items from a user's wishlist.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | ✅ | User ID |

**Response `204 No Content`**

---

---

## Appendix: Response Schemas

### `ApiResponse<T>`

| Field | Type | Description |
|-------|------|-------------|
| `status` | integer | HTTP status code |
| `message` | string | Human-readable message |
| `data` | T | Response payload (nullable) |
| `timestamp` | string (ISO-8601) | Time the response was generated |

---

### `PageResponse<T>`

| Field | Type | Description |
|-------|------|-------------|
| `content` | `T[]` | List of items on this page |
| `totalElements` | integer | Total number of items |
| `totalPages` | integer | Total number of pages |
| `size` | integer | Page size |
| `number` | integer | Current page number (0-based) |
| `first` | boolean | Is this the first page? |
| `last` | boolean | Is this the last page? |
| `numberOfElements` | integer | Items on current page |
| `empty` | boolean | Is the page empty? |

---

### `AuthResponse`

| Field | Type | Description |
|-------|------|-------------|
| `userId` | integer | User ID |
| `email` | string | Email address |
| `fullName` | string | Full name |
| `role` | string | Assigned role |
| `accessToken` | string | JWT access token |
| `refreshToken` | string | JWT refresh token |
| `expiresIn` | integer | Token expiry in seconds |

---

### `ProductResponse`

| Field | Type | Description |
|-------|------|-------------|
| `productId` | integer | Product ID |
| `productName` | string | Product name |
| `description` | string | Description |
| `price` | number | Price |
| `categoryId` | integer | Category ID |
| `categoryName` | string | Category name |
| `brandId` | integer | Brand ID |
| `brandName` | string | Brand name |
| `quantity` | integer | Stock quantity |
| `status` | string | `ACTIVE` / `INACTIVE` |
| `createdDate` | string (ISO-8601) | Creation timestamp |
| `supplierId` | integer | Supplier ID |
| `supplierName` | string | Supplier name |

---

### `SupplierResponse`

| Field | Type | Description |
|-------|------|-------------|
| `supplierId` | integer | Supplier ID |
| `supplierName` | string | Supplier name |
| `contactPerson` | string | Contact person name |
| `email` | string | Email address |
| `phoneNumber` | string | Phone number |
| `address` | string | Physical address |

---

### `BranchResponse`

| Field | Type | Description |
|-------|------|-------------|
| `branchId` | integer | Branch ID |
| `branchName` | string | Branch name |
| `location` | string | Physical location |
| `managerName` | string | Branch manager name |
| `contactNumber` | string | Contact phone number |

---

### `WarrantyResponse`

| Field | Type | Description |
|-------|------|-------------|
| `warrantyId` | integer | Warranty ID |
| `productId` | integer | Product ID |
| `productName` | string | Product name |
| `warrantyPeriodMonths` | integer | Duration in months |
| `warrantyTerms` | string | Terms and conditions |
| `startDate` | string (ISO-8601) | Start date |
| `endDate` | string (ISO-8601) | End date (auto-computed) |

---

### `VoucherResponse`

| Field | Type | Description |
|-------|------|-------------|
| `voucherId` | integer | Voucher ID |
| `voucherCode` | string | Unique code |
| `description` | string | Description |
| `discountValue` | number | Discount amount or percentage |
| `discountType` | string | `PERCENTAGE` or `FIXED_AMOUNT` |
| `validFrom` | string (ISO-8601) | Start date |
| `validTo` | string (ISO-8601) | Expiry date |
| `usageLimit` | integer | Max number of uses |
| `isValid` | boolean | Whether still valid |

---

### `OrderResponse`

| Field | Type | Description |
|-------|------|-------------|
| `orderId` | integer | Order ID |
| `userId` | integer | User ID |
| `userFullName` | string | User full name |
| `orderDate` | string (ISO-8601) | Date placed |
| `totalAmount` | number | Total amount |
| `orderStatus` | string | `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED` |
| `shippingAddress` | string | Delivery address |
| `paymentMethod` | string | Payment method |
| `voucherCode` | string | Applied voucher code |

---

### `UserResponse`

| Field | Type | Description |
|-------|------|-------------|
| `userId` | integer | User ID |
| `email` | string | Email address |
| `fullName` | string | Full name |
| `phoneNumber` | string | Phone number |
| `address` | string | Address |
| `role` | string | Assigned role |
| `isActive` | boolean | Account active status |
| `registrationDate` | string (ISO-8601) | Registration date |
| `status` | string | `ACTIVE` / `INACTIVE` |
| `rewardPoint` | integer | Accumulated reward points |

---

### `CartResponse`

| Field | Type | Description |
|-------|------|-------------|
| `cartId` | integer | Cart ID |
| `userId` | integer | User ID |
| `items` | `CartItemResponse[]` | List of cart items |
| `totalAmount` | number | Total cart value |
| `totalItems` | integer | Total number of items |

#### `CartItemResponse`

| Field | Type | Description |
|-------|------|-------------|
| `productId` | integer | Product ID |
| `productName` | string | Product name |
| `price` | number | Unit price |
| `quantity` | integer | Quantity in cart |
| `subtotal` | number | `price × quantity` |

---

### `WishlistResponse`

| Field | Type | Description |
|-------|------|-------------|
| `wishlistId` | integer | Wishlist ID |
| `userId` | integer | User ID |
| `createdDate` | string (ISO-8601) | Creation date |
| `items` | `WishlistItemResponse[]` | List of products |

#### `WishlistItemResponse`

| Field | Type | Description |
|-------|------|-------------|
| `productId` | integer | Product ID |
| `productName` | string | Product name |
| `productImageUrl` | string | Thumbnail URL |
| `createdDate` | string (ISO-8601) | Date added to wishlist |

---

### `ReviewResponse`

| Field | Type | Description |
|-------|------|-------------|
| `reviewId` | integer | Review ID |
| `userId` | integer | User ID |
| `userFullName` | string | Reviewer name |
| `productId` | integer | Product ID |
| `productName` | string | Product name |
| `rating` | integer | Rating (1–5) |
| `comment` | string | Review text |
| `reviewDate` | string (ISO-8601) | Date submitted |

---

### `MediaResponse`

| Field | Type | Description |
|-------|------|-------------|
| `mediaId` | integer | Media ID |
| `productId` | integer | Associated product ID |
| `type` | string | `IMAGE` or `VIDEO` |
| `url` | string | Media URL |
| `sortOrder` | integer | Display order |

---

*Last updated: 2026-03-05*

