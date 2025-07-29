-- FreshMart Grocery E-commerce Database Schema
-- SQLite Database Schema for Grocery Store with AI Chatbot

-- Products table - stores all grocery items
CREATE TABLE IF NOT EXISTS product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores table - physical store locations
CREATE TABLE IF NOT EXISTS store (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200) NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    phone VARCHAR(20),
    hours VARCHAR(100),
    services TEXT, -- JSON string for services array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table - tracks product availability at each store
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES store (id),
    FOREIGN KEY (product_id) REFERENCES product (id),
    UNIQUE(store_id, product_id)
);

-- Chat messages table - stores chatbot conversation history
CREATE TABLE IF NOT EXISTS chat_message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(100),
    user_message TEXT,
    bot_response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_category ON product(category);
CREATE INDEX IF NOT EXISTS idx_product_name ON product(name);
CREATE INDEX IF NOT EXISTS idx_store_location ON store(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_inventory_store ON inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_message(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_message(timestamp);

-- Views for common queries
CREATE VIEW IF NOT EXISTS store_inventory_view AS
SELECT 
    s.id as store_id,
    s.name as store_name,
    s.address,
    s.latitude,
    s.longitude,
    s.phone,
    s.hours,
    s.services,
    p.id as product_id,
    p.name as product_name,
    p.category,
    p.price,
    p.description,
    p.icon,
    i.quantity,
    i.last_updated
FROM store s
JOIN inventory i ON s.id = i.store_id
JOIN product p ON i.product_id = p.id
WHERE i.quantity > 0;

-- View for product availability across all stores
CREATE VIEW IF NOT EXISTS product_availability_view AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.category,
    p.price,
    p.description,
    p.icon,
    COUNT(i.store_id) as stores_available,
    SUM(i.quantity) as total_quantity,
    AVG(i.quantity) as avg_quantity_per_store
FROM product p
LEFT JOIN inventory i ON p.id = i.product_id AND i.quantity > 0
GROUP BY p.id, p.name, p.category, p.price, p.description, p.icon;

-- Triggers to update inventory timestamps
CREATE TRIGGER IF NOT EXISTS update_inventory_timestamp 
AFTER UPDATE ON inventory
BEGIN
    UPDATE inventory SET last_updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Sample data insertion (will be handled by Python script)
-- This is just for reference

-- Categories: fruits, vegetables, dairy, snacks, beverages, bakery

-- Sample products
/*
INSERT INTO product (name, category, price, description, icon) VALUES
('Fresh Apples', 'fruits', 3.99, 'Crisp and sweet red apples', '🍎'),
('Bananas', 'fruits', 2.49, 'Ripe yellow bananas', '🍌'),
('Orange Bundle', 'fruits', 4.99, 'Fresh juicy oranges', '🍊'),
('Fresh Carrots', 'vegetables', 2.99, 'Organic carrots', '🥕'),
('Broccoli', 'vegetables', 3.49, 'Fresh broccoli crowns', '🥦'),
('Whole Milk', 'dairy', 3.49, 'Fresh whole milk', '🥛'),
('Cheddar Cheese', 'dairy', 5.99, 'Sharp cheddar cheese', '🧀'),
('Mixed Nuts', 'snacks', 7.99, 'Assorted mixed nuts', '🥜'),
('Orange Juice', 'beverages', 4.49, 'Fresh orange juice', '🧃'),
('Whole Wheat Bread', 'bakery', 2.99, 'Fresh whole wheat bread', '🍞');
*/

-- Sample stores (New York area)
/*
INSERT INTO store (name, address, latitude, longitude, phone, hours, services) VALUES
('FreshMart Downtown', '123 Main St, New York, NY 10001', 40.7589, -73.9851, '(555) 123-4567', 'Mon-Sun 7:00 AM - 10:00 PM', '["Grocery pickup", "Delivery", "Pharmacy"]'),
('FreshMart Uptown', '456 Broadway, New York, NY 10025', 40.7831, -73.9712, '(555) 234-5678', 'Mon-Sun 6:00 AM - 11:00 PM', '["Grocery pickup", "Delivery", "Bakery"]'),
('FreshMart East Side', '789 East Ave, New York, NY 10009', 40.7505, -73.9934, '(555) 345-6789', 'Mon-Sun 7:00 AM - 10:00 PM', '["Grocery pickup", "Delivery"]'),
('FreshMart West Village', '321 West St, New York, NY 10014', 40.7357, -74.0036, '(555) 456-7890', 'Mon-Sun 8:00 AM - 9:00 PM', '["Grocery pickup", "Organic section"]'),
('FreshMart Brooklyn', '654 Brooklyn Ave, Brooklyn, NY 11201', 40.6892, -73.9442, '(555) 567-8901', 'Mon-Sun 7:00 AM - 10:00 PM', '["Grocery pickup", "Delivery", "Deli"]');
*/

-- Database maintenance queries
-- Clean up old chat messages (older than 30 days)
-- DELETE FROM chat_message WHERE timestamp < datetime('now', '-30 days');

-- Update inventory quantities (example)
-- UPDATE inventory SET quantity = quantity - 1 WHERE store_id = 1 AND product_id = 1 AND quantity > 0;

-- Get low stock items (quantity < 10)
-- SELECT s.name as store_name, p.name as product_name, i.quantity 
-- FROM inventory i 
-- JOIN store s ON i.store_id = s.id 
-- JOIN product p ON i.product_id = p.id 
-- WHERE i.quantity < 10 AND i.quantity > 0 
-- ORDER BY i.quantity ASC;

-- Get popular products (most frequently mentioned in chat)
-- SELECT p.name, COUNT(*) as mentions 
-- FROM product p 
-- JOIN chat_message cm ON LOWER(cm.user_message) LIKE '%' || LOWER(p.name) || '%' 
-- GROUP BY p.id, p.name 
-- ORDER BY mentions DESC 
-- LIMIT 10;
