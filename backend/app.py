from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import json
from datetime import datetime
import math
import re
from fuzzywuzzy import fuzz
import sqlite3

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grocery_store.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

db = SQLAlchemy(app)

# Database Models
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Store(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    phone = db.Column(db.String(20))
    hours = db.Column(db.String(100))
    services = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.Integer, db.ForeignKey('store.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    
    store = db.relationship('Store', backref=db.backref('inventory', lazy=True))
    product = db.relationship('Product', backref=db.backref('inventory', lazy=True))

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100))
    user_message = db.Column(db.Text)
    bot_response = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Utility Functions
def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def fuzzy_search_products(query, threshold=60):
    """Search products using fuzzy matching"""
    products = Product.query.all()
    matches = []
    
    for product in products:
        # Check name match
        name_score = fuzz.partial_ratio(query.lower(), product.name.lower())
        # Check category match
        category_score = fuzz.partial_ratio(query.lower(), product.category.lower())
        # Check description match
        desc_score = fuzz.partial_ratio(query.lower(), product.description.lower()) if product.description else 0
        
        max_score = max(name_score, category_score, desc_score)
        
        if max_score >= threshold:
            matches.append({
                'product': product,
                'score': max_score
            })
    
    # Sort by score (highest first)
    matches.sort(key=lambda x: x['score'], reverse=True)
    return [match['product'] for match in matches]

def extract_product_keywords(message):
    """Extract potential product names from user message"""
    # Common product-related keywords to filter out
    stop_words = {'find', 'search', 'looking', 'for', 'need', 'want', 'buy', 'get', 'have', 'where', 'can', 'i', 'the', 'a', 'an', 'some', 'any'}
    
    # Split message into words and filter
    words = re.findall(r'\b\w+\b', message.lower())
    keywords = [word for word in words if word not in stop_words and len(word) > 2]
    
    return keywords

# API Routes
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        user_location = data.get('location')  # {'lat': float, 'lng': float}
        session_id = data.get('session_id', 'default')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Process the message and generate response
        response = process_chat_message(user_message, user_location, session_id)
        
        # Save chat history
        chat_record = ChatMessage(
            session_id=session_id,
            user_message=user_message,
            bot_response=json.dumps(response)
        )
        db.session.add(chat_record)
        db.session.commit()
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def process_chat_message(message, user_location, session_id):
    """Process user message and return appropriate response"""
    message_lower = message.lower()
    
    # Product search queries
    if any(keyword in message_lower for keyword in ['find', 'search', 'looking for', 'need', 'want']):
        return handle_product_search(message, user_location)
    
    # Store location queries
    elif any(keyword in message_lower for keyword in ['store', 'shop', 'location', 'nearby', 'near me', 'directions']):
        return handle_store_query(message, user_location)
    
    # Help queries
    elif any(keyword in message_lower for keyword in ['help', 'what can you do', 'how', 'assist']):
        return handle_help_query()
    
    # Default response
    else:
        return handle_default_response(message)

def handle_product_search(message, user_location):
    """Handle product search queries"""
    # Extract keywords and search for products
    keywords = extract_product_keywords(message)
    search_query = ' '.join(keywords)
    
    if not search_query:
        return {
            'type': 'text',
            'message': "I'd be happy to help you find products! Could you tell me what specific item you're looking for?"
        }
    
    # Search for products
    products = fuzzy_search_products(search_query)
    
    if not products:
        return {
            'type': 'text',
            'message': f"I couldn't find any products matching '{search_query}'. Try searching for items like 'apples', 'milk', 'bread', or browse our categories: fruits, vegetables, dairy, snacks, beverages, and bakery."
        }
    
    # Limit to top 5 results
    products = products[:5]
    
    # Find stores with these products
    stores_with_products = find_stores_with_products([p.id for p in products], user_location)
    
    return {
        'type': 'product_search',
        'message': f"I found {len(products)} product(s) matching your search:",
        'products': [
            {
                'id': p.id,
                'name': p.name,
                'category': p.category,
                'price': p.price,
                'description': p.description,
                'icon': p.icon
            } for p in products
        ],
        'stores': stores_with_products[:3]  # Top 3 nearest stores
    }

def handle_store_query(message, user_location):
    """Handle store location queries"""
    if not user_location:
        return {
            'type': 'text',
            'message': "I'd love to help you find nearby stores! However, I need your location first. Please allow location access when prompted."
        }
    
    # Get all stores with distances
    stores = Store.query.all()
    stores_with_distance = []
    
    for store in stores:
        distance = calculate_distance(
            user_location['lat'], user_location['lng'],
            store.latitude, store.longitude
        )
        
        stores_with_distance.append({
            'id': store.id,
            'name': store.name,
            'address': store.address,
            'latitude': store.latitude,
            'longitude': store.longitude,
            'phone': store.phone,
            'hours': store.hours,
            'services': json.loads(store.services) if store.services else [],
            'distance': round(distance, 1)
        })
    
    # Sort by distance
    stores_with_distance.sort(key=lambda x: x['distance'])
    
    return {
        'type': 'store_locations',
        'message': f"Here are the nearest SUVAI stores to your location:",
        'stores': stores_with_distance[:5]  # Top 5 nearest stores
    }

def handle_help_query():
    """Handle help queries"""
    return {
        'type': 'text',
        'message': """I'm SuvaiBot, your grocery shopping assistant! 🤖

I can help you with:

🔍 **Product Search**: Ask me to find specific items like "find apples" or "search for dairy products"

📍 **Store Locations**: Find nearby stores with "show nearby stores" or "where can I buy milk"

🗺️ **Directions**: Get directions to stores that have your desired products

💡 **Tips**: I can suggest alternatives and help you discover new products!

Just ask me anything about groceries or stores!"""
    }

def handle_default_response(message):
    """Handle default/unrecognized queries"""
    responses = [
        "I'm here to help you find groceries and locate stores! Try asking me about specific products or nearby store locations.",
        "I can help you search for products or find stores near you. What are you looking for today?",
        "Let me help you with your grocery needs! You can ask me to find products or locate nearby stores.",
        "I'm your grocery assistant! Ask me about products like 'find fresh apples' or 'show nearby stores'."
    ]
    
    import random
    return {
        'type': 'text',
        'message': random.choice(responses)
    }

def find_stores_with_products(product_ids, user_location):
    """Find stores that have the specified products in stock"""
    stores = Store.query.all()
    stores_with_products = []
    
    for store in stores:
        # Check inventory for each product
        available_products = []
        for product_id in product_ids:
            inventory = Inventory.query.filter_by(store_id=store.id, product_id=product_id).first()
            if inventory and inventory.quantity > 0:
                available_products.append({
                    'product_id': product_id,
                    'quantity': inventory.quantity
                })
        
        if available_products:
            distance = 0
            if user_location:
                distance = calculate_distance(
                    user_location['lat'], user_location['lng'],
                    store.latitude, store.longitude
                )
            
            # Determine availability status
            availability_status = 'in-stock' if len(available_products) == len(product_ids) else 'low-stock'
            
            stores_with_products.append({
                'id': store.id,
                'name': store.name,
                'address': store.address,
                'latitude': store.latitude,
                'longitude': store.longitude,
                'phone': store.phone,
                'hours': store.hours,
                'services': json.loads(store.services) if store.services else [],
                'distance': round(distance, 1),
                'available_products': available_products,
                'availability_status': availability_status
            })
    
    # Sort by distance
    if user_location:
        stores_with_products.sort(key=lambda x: x['distance'])
    
    return stores_with_products

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products or search products"""
    try:
        search_query = request.args.get('search', '')
        category = request.args.get('category', '')
        
        query = Product.query
        
        if category:
            query = query.filter(Product.category == category)
        
        if search_query:
            products = fuzzy_search_products(search_query)
            if category:
                products = [p for p in products if p.category == category]
        else:
            products = query.all()
        
        return jsonify([
            {
                'id': p.id,
                'name': p.name,
                'category': p.category,
                'price': p.price,
                'description': p.description,
                'icon': p.icon
            } for p in products
        ])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stores', methods=['GET'])
def get_stores():
    """Get all stores or find nearby stores"""
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        
        stores = Store.query.all()
        stores_data = []
        
        for store in stores:
            store_data = {
                'id': store.id,
                'name': store.name,
                'address': store.address,
                'latitude': store.latitude,
                'longitude': store.longitude,
                'phone': store.phone,
                'hours': store.hours,
                'services': json.loads(store.services) if store.services else []
            }
            
            if lat and lng:
                distance = calculate_distance(lat, lng, store.latitude, store.longitude)
                store_data['distance'] = round(distance, 1)
            
            stores_data.append(store_data)
        
        # Sort by distance if location provided
        if lat and lng:
            stores_data.sort(key=lambda x: x['distance'])
        
        return jsonify(stores_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/<int:store_id>', methods=['GET'])
def get_store_inventory(store_id):
    """Get inventory for a specific store"""
    try:
        inventory_items = db.session.query(Inventory, Product).join(Product).filter(
            Inventory.store_id == store_id,
            Inventory.quantity > 0
        ).all()
        
        inventory_data = []
        for inventory, product in inventory_items:
            inventory_data.append({
                'product_id': product.id,
                'product_name': product.name,
                'category': product.category,
                'price': product.price,
                'quantity': inventory.quantity,
                'icon': product.icon
            })
        
        return jsonify(inventory_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize database and populate with mock data
def init_db():
    """Initialize database with mock data"""
    db.create_all()
    
    # Check if data already exists
    if Product.query.first():
        return
    
    # Mock products data
    mock_products = [
        # Fruits
        {"name": "Fresh Apples", "category": "fruits", "price": 3.99, "icon": "🍎", "description": "Crisp and sweet red apples"},
        {"name": "Bananas", "category": "fruits", "price": 2.49, "icon": "🍌", "description": "Ripe yellow bananas"},
        {"name": "Orange Bundle", "category": "fruits", "price": 4.99, "icon": "🍊", "description": "Fresh juicy oranges"},
        {"name": "Strawberries", "category": "fruits", "price": 5.99, "icon": "🍓", "description": "Sweet strawberries"},
        {"name": "Grapes", "category": "fruits", "price": 6.99, "icon": "🍇", "description": "Fresh green grapes"},
        {"name": "Pineapple", "category": "fruits", "price": 4.49, "icon": "🍍", "description": "Tropical pineapple"},
        
        # Vegetables
        {"name": "Fresh Carrots", "category": "vegetables", "price": 2.99, "icon": "🥕", "description": "Organic carrots"},
        {"name": "Broccoli", "category": "vegetables", "price": 3.49, "icon": "🥦", "description": "Fresh broccoli crowns"},
        {"name": "Bell Peppers", "category": "vegetables", "price": 4.99, "icon": "🫑", "description": "Colorful bell peppers"},
        {"name": "Tomatoes", "category": "vegetables", "price": 3.99, "icon": "🍅", "description": "Ripe red tomatoes"},
        {"name": "Lettuce", "category": "vegetables", "price": 2.49, "icon": "🥬", "description": "Fresh lettuce leaves"},
        {"name": "Onions", "category": "vegetables", "price": 1.99, "icon": "🧅", "description": "Yellow onions"},
        
        # Dairy
        {"name": "Whole Milk", "category": "dairy", "price": 3.49, "icon": "🥛", "description": "Fresh whole milk"},
        {"name": "Cheddar Cheese", "category": "dairy", "price": 5.99, "icon": "🧀", "description": "Sharp cheddar cheese"},
        {"name": "Greek Yogurt", "category": "dairy", "price": 4.99, "icon": "🥛", "description": "Creamy Greek yogurt"},
        {"name": "Butter", "category": "dairy", "price": 4.49, "icon": "🧈", "description": "Unsalted butter"},
        {"name": "Eggs", "category": "dairy", "price": 3.99, "icon": "🥚", "description": "Farm fresh eggs"},
        
        # Snacks
        {"name": "Mixed Nuts", "category": "snacks", "price": 7.99, "icon": "🥜", "description": "Assorted mixed nuts"},
        {"name": "Potato Chips", "category": "snacks", "price": 3.49, "icon": "🍟", "description": "Crispy potato chips"},
        {"name": "Crackers", "category": "snacks", "price": 2.99, "icon": "🍘", "description": "Whole grain crackers"},
        {"name": "Granola Bars", "category": "snacks", "price": 4.99, "icon": "🍫", "description": "Healthy granola bars"},
        
        # Beverages
        {"name": "Orange Juice", "category": "beverages", "price": 4.49, "icon": "🧃", "description": "Fresh orange juice"},
        {"name": "Coffee Beans", "category": "beverages", "price": 12.99, "icon": "☕", "description": "Premium coffee beans"},
        {"name": "Green Tea", "category": "beverages", "price": 6.99, "icon": "🍵", "description": "Organic green tea"},
        {"name": "Sparkling Water", "category": "beverages", "price": 3.99, "icon": "💧", "description": "Sparkling mineral water"},
        
        # Bakery
        {"name": "Whole Wheat Bread", "category": "bakery", "price": 2.99, "icon": "🍞", "description": "Fresh whole wheat bread"},
        {"name": "Croissants", "category": "bakery", "price": 5.99, "icon": "🥐", "description": "Buttery croissants"},
        {"name": "Bagels", "category": "bakery", "price": 4.49, "icon": "🥯", "description": "Fresh bagels"},
        {"name": "Muffins", "category": "bakery", "price": 6.99, "icon": "🧁", "description": "Blueberry muffins"}
    ]
    
    # Add products to database
    for product_data in mock_products:
        product = Product(**product_data)
        db.session.add(product)
    
    # Mock stores data
    mock_stores = [
        {
            "name": "SUVAI Downtown",
            "address": "123 Main St, New York, NY 10001",
            "latitude": 40.7589,
            "longitude": -73.9851,
            "phone": "(555) 123-4567",
            "hours": "Mon-Sun 7:00 AM - 10:00 PM",
            "services": json.dumps(["Grocery pickup", "Delivery", "Pharmacy"])
        },
        {
            "name": "SUVAI Uptown",
            "address": "456 Broadway, New York, NY 10025",
            "latitude": 40.7831,
            "longitude": -73.9712,
            "phone": "(555) 234-5678",
            "hours": "Mon-Sun 6:00 AM - 11:00 PM",
            "services": json.dumps(["Grocery pickup", "Delivery", "Bakery"])
        },
        {
            "name": "SUVAI East Side",
            "address": "789 East Ave, New York, NY 10009",
            "latitude": 40.7505,
            "longitude": -73.9934,
            "phone": "(555) 345-6789",
            "hours": "Mon-Sun 7:00 AM - 10:00 PM",
            "services": json.dumps(["Grocery pickup", "Delivery"])
        },
        {
            "name": "SUVAI West Village",
            "address": "321 West St, New York, NY 10014",
            "latitude": 40.7357,
            "longitude": -74.0036,
            "phone": "(555) 456-7890",
            "hours": "Mon-Sun 8:00 AM - 9:00 PM",
            "services": json.dumps(["Grocery pickup", "Organic section"])
        },
        {
            "name": "SUVAI Brooklyn",
            "address": "654 Brooklyn Ave, Brooklyn, NY 11201",
            "latitude": 40.6892,
            "longitude": -73.9442,
            "phone": "(555) 567-8901",
            "hours": "Mon-Sun 7:00 AM - 10:00 PM",
            "services": json.dumps(["Grocery pickup", "Delivery", "Deli"])
        }
    ]
    
    # Add stores to database
    for store_data in mock_stores:
        store = Store(**store_data)
        db.session.add(store)
    
    db.session.commit()
    
    # Add mock inventory data
    import random
    products = Product.query.all()
    stores = Store.query.all()
    
    for store in stores:
        for product in products:
            # Random inventory (80% chance of having the product)
            if random.random() < 0.8:
                quantity = random.randint(5, 100)
                inventory = Inventory(
                    store_id=store.id,
                    product_id=product.id,
                    quantity=quantity
                )
                db.session.add(inventory)
    
    db.session.commit()
    print("Database initialized with mock data!")

if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True, port=5000)
