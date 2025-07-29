# FreshMart Grocery E-commerce Setup Guide

This guide will help you set up and run the FreshMart grocery e-commerce website with integrated AI chatbot.

## Prerequisites

- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for OpenStreetMap integration)

## Installation Steps

### 1. Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd grocery-ecommerce

# Or download and extract the ZIP file
```

### 2. Set Up Python Environment

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Initialize Database

The database will be automatically created and populated with mock data when you first run the Flask application.

```bash
python app.py
```

This will:
- Create SQLite database (`grocery_store.db`)
- Set up all tables (products, stores, inventory, chat_message)
- Populate with comprehensive mock data
- Start the Flask development server on `http://localhost:5000`

### 5. Open the Website

1. Keep the Flask server running in one terminal
2. Open another terminal/command prompt
3. Navigate to the `frontend` directory
4. Open `index.html` in your web browser

**Option 1: Direct file opening**
```bash
cd frontend
# Double-click index.html or open with browser
```

**Option 2: Using a local server (recommended)**
```bash
cd frontend
# Python 3
python -m http.server 8000
# Then open http://localhost:8000 in your browser

# Or using Node.js (if installed)
npx serve .
```

## Project Structure

```
grocery-ecommerce/
├── frontend/
│   ├── index.html              # Main website
│   ├── css/
│   │   ├── style.css          # Main website styles
│   │   └── chatbot.css        # Chatbot widget styles
│   └── js/
│       ├── main.js            # Website functionality
│       ├── cart.js            # Shopping cart logic
│       ├── chatbot.js         # Chatbot interface
│       └── map.js             # OpenStreetMap integration
├── backend/
│   ├── app.py                 # Flask main application
│   ├── requirements.txt       # Python dependencies
│   └── grocery_store.db       # SQLite database (auto-created)
├── database/
│   └── schema.sql             # Database schema reference
└── docs/
    ├── setup.md               # This file
    └── api_documentation.md   # API documentation
```

## Features Overview

### Main Website
- **Product Catalog**: Browse 29+ grocery items across 6 categories
- **Search & Filter**: Find products by name, category, or description
- **Shopping Cart**: Add items, adjust quantities, checkout simulation
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Brand Theme**: Consistent #e21c15 (red) color scheme

### AI Chatbot
- **Product Search**: "Find apples" or "search for dairy products"
- **Store Locations**: "Show nearby stores" or "where can I buy milk"
- **Natural Language**: Conversational interface with fuzzy matching
- **Location Services**: GPS-based store distance calculation
- **OpenStreetMap**: Interactive maps with directions

### Backend API
- **RESTful Endpoints**: `/api/chat`, `/api/products`, `/api/stores`
- **Database Integration**: SQLite with SQLAlchemy ORM
- **Fuzzy Search**: Intelligent product matching
- **Geolocation**: Haversine distance calculation
- **Mock Data**: Realistic inventory and store information

## Configuration

### Backend Configuration

Edit `backend/app.py` to modify:

```python
# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grocery_store.db'

# CORS settings (if needed for production)
CORS(app, origins=['http://localhost:8000'])

# Server settings
app.run(debug=True, port=5000)
```

### Frontend Configuration

Edit `frontend/js/chatbot.js` to change API endpoint:

```javascript
// Change this if backend runs on different port
const response = await fetch('http://localhost:5000/api/chat', {
    // ... rest of the configuration
});
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **CORS errors in browser**
   - Ensure Flask server is running
   - Use local server for frontend (not file:// protocol)
   - Check browser console for specific errors

3. **Database errors**
   ```bash
   # Delete existing database and restart
   rm backend/grocery_store.db
   python backend/app.py
   ```

4. **Location services not working**
   - Allow location access in browser
   - Use HTTPS or localhost (required for geolocation)
   - Check browser console for permission errors

5. **Map not loading**
   - Check internet connection
   - Verify Leaflet.js CDN is accessible
   - Open browser developer tools for errors

### Development Tips

1. **Enable debug mode**
   ```python
   app.run(debug=True, port=5000)
   ```

2. **View database contents**
   ```bash
   sqlite3 backend/grocery_store.db
   .tables
   SELECT * FROM product LIMIT 5;
   .quit
   ```

3. **Monitor API calls**
   - Open browser Developer Tools
   - Go to Network tab
   - Watch for API requests to localhost:5000

4. **Test chatbot responses**
   ```bash
   curl -X POST http://localhost:5000/api/chat \
   -H "Content-Type: application/json" \
   -d '{"message": "find apples", "location": {"lat": 40.7589, "lng": -73.9851}}'
   ```

## Production Deployment

For production deployment, consider:

1. **Use production WSGI server**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Use PostgreSQL instead of SQLite**
   ```python
   app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:pass@localhost/dbname'
   ```

3. **Set up proper CORS**
   ```python
   CORS(app, origins=['https://yourdomain.com'])
   ```

4. **Use environment variables**
   ```python
   import os
   app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
   ```

5. **Serve static files with nginx/Apache**

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for JavaScript errors
3. Check Flask server logs for backend errors
4. Verify all dependencies are installed correctly

## Next Steps

- Customize product catalog with your own items
- Modify store locations for your area
- Enhance chatbot with more sophisticated NLP
- Add user authentication and order management
- Integrate with real payment processing
- Deploy to cloud platform (AWS, Heroku, etc.)
