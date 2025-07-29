#!/usr/bin/env python3
"""
FreshMart System Test Script
Tests all major functionality of the grocery e-commerce website with AI chatbot
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000/api"
TEST_LOCATION = {"lat": 40.7589, "lng": -73.9851}  # New York City

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ {message}{Colors.ENDC}")

def test_server_connection():
    """Test if Flask server is running"""
    print_test_header("Server Connection")
    
    try:
        response = requests.get(f"{BASE_URL}/products", timeout=5)
        if response.status_code == 200:
            print_success("Flask server is running and accessible")
            return True
        else:
            print_error(f"Server responded with status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to Flask server. Make sure it's running on localhost:5000")
        return False
    except requests.exceptions.Timeout:
        print_error("Server connection timed out")
        return False

def test_products_api():
    """Test products API endpoints"""
    print_test_header("Products API")
    
    # Test get all products
    try:
        response = requests.get(f"{BASE_URL}/products")
        if response.status_code == 200:
            products = response.json()
            print_success(f"Retrieved {len(products)} products")
            
            # Verify product structure
            if products and all(key in products[0] for key in ['id', 'name', 'category', 'price']):
                print_success("Product data structure is correct")
            else:
                print_error("Product data structure is invalid")
                
            # Test categories
            categories = set(product['category'] for product in products)
            expected_categories = {'fruits', 'vegetables', 'dairy', 'snacks', 'beverages', 'bakery'}
            if expected_categories.issubset(categories):
                print_success(f"All expected categories found: {categories}")
            else:
                print_warning(f"Some categories missing. Found: {categories}")
                
        else:
            print_error(f"Products API failed with status: {response.status_code}")
            
    except Exception as e:
        print_error(f"Products API test failed: {str(e)}")
    
    # Test product search
    try:
        response = requests.get(f"{BASE_URL}/products?search=apple")
        if response.status_code == 200:
            search_results = response.json()
            if search_results:
                print_success(f"Product search returned {len(search_results)} results for 'apple'")
            else:
                print_warning("Product search returned no results for 'apple'")
        else:
            print_error(f"Product search failed with status: {response.status_code}")
    except Exception as e:
        print_error(f"Product search test failed: {str(e)}")
    
    # Test category filter
    try:
        response = requests.get(f"{BASE_URL}/products?category=fruits")
        if response.status_code == 200:
            fruit_products = response.json()
            if fruit_products and all(product['category'] == 'fruits' for product in fruit_products):
                print_success(f"Category filter returned {len(fruit_products)} fruit products")
            else:
                print_error("Category filter returned incorrect results")
        else:
            print_error(f"Category filter failed with status: {response.status_code}")
    except Exception as e:
        print_error(f"Category filter test failed: {str(e)}")

def test_stores_api():
    """Test stores API endpoints"""
    print_test_header("Stores API")
    
    # Test get all stores
    try:
        response = requests.get(f"{BASE_URL}/stores")
        if response.status_code == 200:
            stores = response.json()
            print_success(f"Retrieved {len(stores)} stores")
            
            # Verify store structure
            if stores and all(key in stores[0] for key in ['id', 'name', 'address', 'latitude', 'longitude']):
                print_success("Store data structure is correct")
            else:
                print_error("Store data structure is invalid")
                
        else:
            print_error(f"Stores API failed with status: {response.status_code}")
            
    except Exception as e:
        print_error(f"Stores API test failed: {str(e)}")
    
    # Test stores with location
    try:
        response = requests.get(f"{BASE_URL}/stores?lat={TEST_LOCATION['lat']}&lng={TEST_LOCATION['lng']}")
        if response.status_code == 200:
            stores_with_distance = response.json()
            if stores_with_distance and 'distance' in stores_with_distance[0]:
                print_success(f"Location-based store search returned {len(stores_with_distance)} stores with distances")
                
                # Check if sorted by distance
                distances = [store['distance'] for store in stores_with_distance]
                if distances == sorted(distances):
                    print_success("Stores are correctly sorted by distance")
                else:
                    print_warning("Stores may not be sorted by distance")
            else:
                print_error("Location-based store search returned invalid data")
        else:
            print_error(f"Location-based store search failed with status: {response.status_code}")
    except Exception as e:
        print_error(f"Location-based store search test failed: {str(e)}")

def test_inventory_api():
    """Test inventory API endpoints"""
    print_test_header("Inventory API")
    
    try:
        # Get stores first
        stores_response = requests.get(f"{BASE_URL}/stores")
        if stores_response.status_code == 200:
            stores = stores_response.json()
            if stores:
                store_id = stores[0]['id']
                
                # Test inventory for first store
                response = requests.get(f"{BASE_URL}/inventory/{store_id}")
                if response.status_code == 200:
                    inventory = response.json()
                    print_success(f"Retrieved inventory for store {store_id}: {len(inventory)} items")
                    
                    # Verify inventory structure
                    if inventory and all(key in inventory[0] for key in ['product_id', 'product_name', 'quantity']):
                        print_success("Inventory data structure is correct")
                    else:
                        print_error("Inventory data structure is invalid")
                else:
                    print_error(f"Inventory API failed with status: {response.status_code}")
            else:
                print_error("No stores found to test inventory")
        else:
            print_error("Could not retrieve stores for inventory test")
            
    except Exception as e:
        print_error(f"Inventory API test failed: {str(e)}")

def test_chatbot_api():
    """Test chatbot API with various queries"""
    print_test_header("Chatbot API")
    
    test_queries = [
        {
            "message": "find apples",
            "expected_type": "product_search",
            "description": "Product search query"
        },
        {
            "message": "show nearby stores",
            "expected_type": "store_locations",
            "description": "Store location query"
        },
        {
            "message": "help me",
            "expected_type": "text",
            "description": "Help query"
        },
        {
            "message": "hello",
            "expected_type": "text",
            "description": "General greeting"
        },
        {
            "message": "I need some dairy products",
            "expected_type": "product_search",
            "description": "Category-based product search"
        }
    ]
    
    session_id = f"test_session_{int(time.time())}"
    
    for i, query in enumerate(test_queries, 1):
        try:
            print_info(f"Test {i}: {query['description']} - '{query['message']}'")
            
            payload = {
                "message": query["message"],
                "location": TEST_LOCATION,
                "session_id": session_id
            }
            
            response = requests.post(f"{BASE_URL}/chat", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'type' in data and 'message' in data:
                    print_success(f"Chatbot responded with type: {data['type']}")
                    
                    if data['type'] == query['expected_type']:
                        print_success(f"Response type matches expected: {query['expected_type']}")
                    else:
                        print_warning(f"Expected type: {query['expected_type']}, got: {data['type']}")
                    
                    # Check for additional data based on type
                    if data['type'] == 'product_search' and 'products' in data:
                        print_success(f"Product search returned {len(data['products'])} products")
                        if 'stores' in data:
                            print_success(f"Also returned {len(data['stores'])} stores with products")
                    
                    elif data['type'] == 'store_locations' and 'stores' in data:
                        print_success(f"Store location search returned {len(data['stores'])} stores")
                    
                else:
                    print_error("Chatbot response missing required fields")
            else:
                print_error(f"Chatbot API failed with status: {response.status_code}")
                
        except Exception as e:
            print_error(f"Chatbot test {i} failed: {str(e)}")
        
        # Small delay between requests
        time.sleep(0.5)

def test_database_integrity():
    """Test database integrity and relationships"""
    print_test_header("Database Integrity")
    
    try:
        # Get all data
        products_response = requests.get(f"{BASE_URL}/products")
        stores_response = requests.get(f"{BASE_URL}/stores")
        
        if products_response.status_code == 200 and stores_response.status_code == 200:
            products = products_response.json()
            stores = stores_response.json()
            
            print_success(f"Database contains {len(products)} products and {len(stores)} stores")
            
            # Test inventory relationships
            inventory_count = 0
            for store in stores:
                inventory_response = requests.get(f"{BASE_URL}/inventory/{store['id']}")
                if inventory_response.status_code == 200:
                    inventory = inventory_response.json()
                    inventory_count += len(inventory)
            
            print_success(f"Total inventory items across all stores: {inventory_count}")
            
            # Check for reasonable inventory distribution
            avg_inventory_per_store = inventory_count / len(stores) if stores else 0
            if avg_inventory_per_store > 10:
                print_success(f"Good inventory distribution: {avg_inventory_per_store:.1f} items per store on average")
            else:
                print_warning(f"Low inventory distribution: {avg_inventory_per_store:.1f} items per store on average")
                
        else:
            print_error("Could not retrieve data for integrity test")
            
    except Exception as e:
        print_error(f"Database integrity test failed: {str(e)}")

def run_performance_test():
    """Basic performance test"""
    print_test_header("Performance Test")
    
    test_endpoints = [
        f"{BASE_URL}/products",
        f"{BASE_URL}/stores",
        f"{BASE_URL}/products?search=apple",
        f"{BASE_URL}/stores?lat={TEST_LOCATION['lat']}&lng={TEST_LOCATION['lng']}"
    ]
    
    for endpoint in test_endpoints:
        try:
            start_time = time.time()
            response = requests.get(endpoint, timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200:
                if response_time < 1000:  # Less than 1 second
                    print_success(f"{endpoint.split('/')[-1]}: {response_time:.0f}ms")
                else:
                    print_warning(f"{endpoint.split('/')[-1]}: {response_time:.0f}ms (slow)")
            else:
                print_error(f"{endpoint.split('/')[-1]}: Failed ({response.status_code})")
                
        except Exception as e:
            print_error(f"Performance test failed for {endpoint}: {str(e)}")

def main():
    """Run all tests"""
    print(f"{Colors.BOLD}FreshMart System Test Suite{Colors.ENDC}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Testing server at: {BASE_URL}")
    
    # Check server connection first
    if not test_server_connection():
        print_error("Cannot proceed with tests - server is not accessible")
        print_info("Make sure to run: python backend/app.py")
        sys.exit(1)
    
    # Run all tests
    test_products_api()
    test_stores_api()
    test_inventory_api()
    test_chatbot_api()
    test_database_integrity()
    run_performance_test()
    
    print(f"\n{Colors.BOLD}Test Suite Completed{Colors.ENDC}")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\n{Colors.BLUE}Next steps:{Colors.ENDC}")
    print("1. Open frontend/index.html in your browser")
    print("2. Test the website interface and chatbot widget")
    print("3. Try various product searches and store location queries")
    print("4. Test the shopping cart functionality")
    print("5. Verify OpenStreetMap integration works")

if __name__ == "__main__":
    main()
