# SUVAI - Grocery E-Commerce Website with AI Chatbot

A comprehensive grocery e-commerce platform featuring an integrated AI chatbot for product availability and store location services.

## Features

### Website
- Complete product catalog with categories (fruits, vegetables, dairy, snacks, beverages)
- Advanced search and filtering functionality
- Shopping cart and checkout interface
- Responsive design optimized for desktop and mobile
- Brand color theme: #e21c15 (red)

### AI Chatbot
- Floating widget positioned in bottom-left corner
- Product availability search
- Store location services with GPS integration
- Natural language processing for conversational queries
- OpenStreetMap integration for directions and store locations
- Haversine distance calculation for nearby stores

## Project Structure

```
grocery-ecommerce/
├── frontend/
│   ├── index.html              # Main website
│   ├── css/
│   │   ├── style.css          # Main website styles
│   │   └── chatbot.css        # Chatbot widget styles
│   ├── js/
│   │   ├── main.js            # Website functionality
│   │   ├── chatbot.js         # Chatbot interface
│   │   ├── cart.js            # Shopping cart logic
│   │   └── map.js             # OpenStreetMap integration
│   └── images/                # Product and UI images
├── backend/
│   ├── app.py                 # Flask main application
│   ├── chatbot_api.py         # Chatbot API endpoints
│   ├── models.py              # Database models
│   ├── utils.py               # Utility functions (Haversine, etc.)
│   └── requirements.txt       # Python dependencies
├── database/
│   ├── schema.sql             # Database schema
│   ├── mock_data.sql          # Sample data
│   └── grocery_store.db       # SQLite database
└── docs/
    ├── setup.md               # Setup instructions
    └── api_documentation.md   # API documentation
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python Flask
- **Database**: SQLite (for development)
- **Maps**: OpenStreetMap with Leaflet.js
- **Styling**: Custom CSS with responsive design

## Quick Start

1. Clone the repository
2. Install Python dependencies: `pip install -r backend/requirements.txt`
3. Initialize database: `python backend/app.py`
4. Open `frontend/index.html` in your browser
5. Start the Flask backend: `python backend/app.py`

## Usage

1. Browse products on the main website
2. Use the chatbot to find product availability at nearby stores
3. Get directions to stores using the integrated map
4. Complete purchases through the shopping cart

## Mock Data

The system includes comprehensive mock data for:
- 29 grocery products across 6 categories (fruits, vegetables, dairy, snacks, beverages, bakery)
- 5 store locations in New York area with GPS coordinates
- Realistic inventory levels and pricing
- Chat conversation history tracking

## Quick Start Guide

### 1. Start the Backend Server
```bash
cd backend
pip install -r requirements.txt
python app.py
```
The server will start at `http://localhost:5000` and automatically create the database with mock data.

### 2. Open the Website
```bash
cd frontend
# Option 1: Open index.html directly in browser
# Option 2: Use local server (recommended)
python -m http.server 8000
# Then visit http://localhost:8000
```

### 3. Test the System
```bash
python test_system.py
```

## Features Demo

### Website Features
- **Browse Products**: 29 items across 6 categories with search and filtering
- **Shopping Cart**: Add items, adjust quantities, simulated checkout
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Brand Theme**: Consistent #e21c15 red color scheme

### Chatbot Features
Try these example queries:
- "find apples" - Product search with store availability
- "show nearby stores" - Location-based store finder
- "I need dairy products" - Category-based search
- "where can I buy milk" - Product-specific store search
- "help me" - Get assistance and feature overview

### Map Integration
- Interactive OpenStreetMap with store locations
- GPS-based distance calculation using Haversine formula
- Click-to-get-directions functionality
- Store details with hours, phone, and services

## API Examples

### Search for Products
```bash
curl "http://localhost:5000/api/products?search=apple"
```

### Find Nearby Stores
```bash
curl "http://localhost:5000/api/stores?lat=40.7589&lng=-73.9851"
```

### Chat with Bot
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "find fresh vegetables", "location": {"lat": 40.7589, "lng": -73.9851}}'
```
