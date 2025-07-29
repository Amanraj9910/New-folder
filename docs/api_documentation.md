# FreshMart API Documentation

This document describes the REST API endpoints for the FreshMart grocery e-commerce platform with AI chatbot integration.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, no authentication is required for API endpoints. In production, consider implementing API keys or OAuth.

## Endpoints

### 1. Chatbot API

#### POST /api/chat

Process user messages and return chatbot responses with product search and store location services.

**Request Body:**
```json
{
    "message": "find apples",
    "location": {
        "lat": 40.7589,
        "lng": -73.9851
    },
    "session_id": "session_12345"
}
```

**Parameters:**
- `message` (string, required): User's message to the chatbot
- `location` (object, optional): User's GPS coordinates
  - `lat` (float): Latitude
  - `lng` (float): Longitude
- `session_id` (string, optional): Session identifier for conversation tracking

**Response Examples:**

**Text Response:**
```json
{
    "type": "text",
    "message": "I'm here to help you find groceries and locate stores!"
}
```

**Product Search Response:**
```json
{
    "type": "product_search",
    "message": "I found 3 product(s) matching your search:",
    "products": [
        {
            "id": 1,
            "name": "Fresh Apples",
            "category": "fruits",
            "price": 3.99,
            "description": "Crisp and sweet red apples",
            "icon": "🍎"
        }
    ],
    "stores": [
        {
            "id": 1,
            "name": "FreshMart Downtown",
            "address": "123 Main St, New York, NY 10001",
            "latitude": 40.7589,
            "longitude": -73.9851,
            "phone": "(555) 123-4567",
            "hours": "Mon-Sun 7:00 AM - 10:00 PM",
            "services": ["Grocery pickup", "Delivery", "Pharmacy"],
            "distance": 0.5,
            "availability_status": "in-stock",
            "available_products": [
                {
                    "product_id": 1,
                    "quantity": 45
                }
            ]
        }
    ]
}
```

**Store Locations Response:**
```json
{
    "type": "store_locations",
    "message": "Here are the nearest FreshMart stores to your location:",
    "stores": [
        {
            "id": 1,
            "name": "FreshMart Downtown",
            "address": "123 Main St, New York, NY 10001",
            "latitude": 40.7589,
            "longitude": -73.9851,
            "phone": "(555) 123-4567",
            "hours": "Mon-Sun 7:00 AM - 10:00 PM",
            "services": ["Grocery pickup", "Delivery", "Pharmacy"],
            "distance": 0.5
        }
    ]
}
```

### 2. Products API

#### GET /api/products

Retrieve all products or search for specific products.

**Query Parameters:**
- `search` (string, optional): Search term for fuzzy product matching
- `category` (string, optional): Filter by product category

**Examples:**
```
GET /api/products
GET /api/products?category=fruits
GET /api/products?search=apple
GET /api/products?category=dairy&search=milk
```

**Response:**
```json
[
    {
        "id": 1,
        "name": "Fresh Apples",
        "category": "fruits",
        "price": 3.99,
        "description": "Crisp and sweet red apples",
        "icon": "🍎"
    },
    {
        "id": 2,
        "name": "Bananas",
        "category": "fruits",
        "price": 2.49,
        "description": "Ripe yellow bananas",
        "icon": "🍌"
    }
]
```

### 3. Stores API

#### GET /api/stores

Retrieve all store locations, optionally sorted by distance from user location.

**Query Parameters:**
- `lat` (float, optional): User's latitude for distance calculation
- `lng` (float, optional): User's longitude for distance calculation

**Examples:**
```
GET /api/stores
GET /api/stores?lat=40.7589&lng=-73.9851
```

**Response:**
```json
[
    {
        "id": 1,
        "name": "FreshMart Downtown",
        "address": "123 Main St, New York, NY 10001",
        "latitude": 40.7589,
        "longitude": -73.9851,
        "phone": "(555) 123-4567",
        "hours": "Mon-Sun 7:00 AM - 10:00 PM",
        "services": ["Grocery pickup", "Delivery", "Pharmacy"],
        "distance": 0.5
    }
]
```

### 4. Inventory API

#### GET /api/inventory/{store_id}

Get inventory for a specific store, showing only products that are in stock.

**Path Parameters:**
- `store_id` (integer, required): Store ID

**Example:**
```
GET /api/inventory/1
```

**Response:**
```json
[
    {
        "product_id": 1,
        "product_name": "Fresh Apples",
        "category": "fruits",
        "price": 3.99,
        "quantity": 45,
        "icon": "🍎"
    },
    {
        "product_id": 2,
        "product_name": "Bananas",
        "category": "fruits",
        "price": 2.49,
        "quantity": 32,
        "icon": "🍌"
    }
]
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

**400 Bad Request:**
```json
{
    "error": "Message is required"
}
```

**500 Internal Server Error:**
```json
{
    "error": "Database connection failed"
}
```

## Data Models

### Product
```json
{
    "id": 1,
    "name": "Fresh Apples",
    "category": "fruits",
    "price": 3.99,
    "description": "Crisp and sweet red apples",
    "icon": "🍎"
}
```

**Categories:** `fruits`, `vegetables`, `dairy`, `snacks`, `beverages`, `bakery`

### Store
```json
{
    "id": 1,
    "name": "FreshMart Downtown",
    "address": "123 Main St, New York, NY 10001",
    "latitude": 40.7589,
    "longitude": -73.9851,
    "phone": "(555) 123-4567",
    "hours": "Mon-Sun 7:00 AM - 10:00 PM",
    "services": ["Grocery pickup", "Delivery", "Pharmacy"],
    "distance": 0.5
}
```

### Inventory Item
```json
{
    "product_id": 1,
    "product_name": "Fresh Apples",
    "category": "fruits",
    "price": 3.99,
    "quantity": 45,
    "icon": "🍎"
}
```

## Chatbot Natural Language Processing

The chatbot API processes natural language queries and categorizes them:

### Product Search Queries
- Keywords: `find`, `search`, `looking for`, `need`, `want`, `buy`, `get`
- Examples:
  - "find apples"
  - "I'm looking for dairy products"
  - "search for fresh vegetables"
  - "need some snacks"

### Store Location Queries
- Keywords: `store`, `shop`, `location`, `nearby`, `near me`, `directions`, `where`
- Examples:
  - "show nearby stores"
  - "where can I buy milk"
  - "find stores near me"
  - "get directions to store"

### Help Queries
- Keywords: `help`, `what can you do`, `how`, `assist`, `support`
- Examples:
  - "help me"
  - "what can you do"
  - "how does this work"

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing:
- Request rate limiting per IP/session
- API key-based quotas
- Caching for frequently requested data

## CORS Configuration

The API includes CORS headers to allow cross-origin requests from the frontend. In production, configure specific allowed origins:

```python
CORS(app, origins=['https://yourdomain.com'])
```

## Testing the API

### Using curl

**Test chatbot:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "find apples",
    "location": {"lat": 40.7589, "lng": -73.9851},
    "session_id": "test_session"
  }'
```

**Get products:**
```bash
curl "http://localhost:5000/api/products?category=fruits"
```

**Get stores:**
```bash
curl "http://localhost:5000/api/stores?lat=40.7589&lng=-73.9851"
```

### Using JavaScript (Frontend)

```javascript
// Chatbot API call
const response = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        message: 'find apples',
        location: { lat: 40.7589, lng: -73.9851 },
        session_id: 'web_session_123'
    })
});

const data = await response.json();
console.log(data);
```

## Future Enhancements

Potential API improvements:
- User authentication and personalization
- Order management endpoints
- Real-time inventory updates
- Advanced search with filters
- Recommendation engine
- Analytics and usage tracking
- Webhook support for inventory changes
