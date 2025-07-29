// Chatbot Manager
class ChatbotManager {
    constructor() {
        this.isMinimized = false;
        this.isTyping = false;
        this.userLocation = null;
        this.conversationHistory = [];
        this.init();
    }
    
    init() {
        console.log('Chatbot initializing...');
        this.setupEventListeners();
        this.requestUserLocation();
        this.addWelcomeMessage();
        console.log('Chatbot initialized successfully');
    }
    
    setupEventListeners() {
        // Toggle chatbot
        document.getElementById('chatbot-toggle').addEventListener('click', () => {
            this.toggleChatbot();
        });
        
        // Send message
        document.getElementById('chatbot-send').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key to send message
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Close map modal
        document.getElementById('closeMap').addEventListener('click', () => {
            this.hideMapModal();
        });
        
        // Close modal when clicking outside
        document.getElementById('mapModal').addEventListener('click', (e) => {
            if (e.target.id === 'mapModal') {
                this.hideMapModal();
            }
        });
    }
    
    toggleChatbot() {
        const widget = document.getElementById('chatbot-widget');
        const arrow = document.getElementById('chatbot-arrow');
        
        this.isMinimized = !this.isMinimized;
        
        if (this.isMinimized) {
            widget.classList.add('minimized');
            arrow.style.transform = 'rotate(180deg)';
        } else {
            widget.classList.remove('minimized');
            arrow.style.transform = 'rotate(0deg)';
        }
    }
    
    addWelcomeMessage() {
        const quickActions = `
            <div class="quick-actions">
                <div class="quick-action" onclick="chatbotManager.handleQuickAction('find apples')">Find Apples</div>
                <div class="quick-action" onclick="chatbotManager.handleQuickAction('nearby stores')">Nearby Stores</div>
                <div class="quick-action" onclick="chatbotManager.handleQuickAction('fresh vegetables')">Fresh Vegetables</div>
                <div class="quick-action" onclick="chatbotManager.handleQuickAction('I am in Manhattan')">Set Location</div>
            </div>
        `;

        setTimeout(() => {
            this.addBotMessage("Here are some things I can help you with:", quickActions);
        }, 1000);

        setTimeout(() => {
            this.addBotMessage("💡 Tip: For better store recommendations, you can share your location or tell me where you are (e.g., 'I'm in Manhattan')");
        }, 3000);
    }
    
    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        console.log('Sending message:', message);

        if (message === '' || this.isTyping) {
            console.log('Message empty or already typing, returning');
            return;
        }

        // Add user message
        this.addUserMessage(message);
        input.value = '';

        // Disable send button temporarily
        const sendButton = document.getElementById('chatbot-send');
        sendButton.disabled = true;

        // Process message
        this.processMessage(message).finally(() => {
            // Re-enable send button
            sendButton.disabled = false;
            console.log('Message processing completed');
        });
    }
    
    addUserMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">${this.escapeHtml(message)}</div>
        `;
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Add to conversation history
        this.conversationHistory.push({ type: 'user', message: message });
    }
    
    addBotMessage(message, additionalContent = '') {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${message}${additionalContent}</div>
        `;
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Add to conversation history
        this.conversationHistory.push({ type: 'bot', message: message });
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingElement = document.createElement('div');
        typingElement.className = 'message bot-message';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content typing">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        this.isTyping = true;
    }
    
    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
        this.isTyping = false;
    }
    
    async processMessage(message) {
        this.showTypingIndicator();

        // Check if user is providing manual location
        if (this.isManualLocationInput(message)) {
            this.handleManualLocationInput(message);
            this.hideTypingIndicator();
            return;
        }

        try {
            // Call backend API
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    location: this.userLocation,
                    session_id: this.getSessionId()
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            this.hideTypingIndicator();
            this.handleApiResponse(data);

        } catch (error) {
            console.error('Error calling chatbot API:', error);
            this.hideTypingIndicator();

            // Show API error message
            this.addBotMessage("I'm having trouble connecting to my backend service. Let me help you with local information! 🤖");

            // Small delay before processing locally
            setTimeout(() => {
                // Fallback to local processing
                const lowerMessage = message.toLowerCase();

                // Product search
                if (this.isProductQuery(lowerMessage)) {
                    this.handleProductSearch(lowerMessage);
                }
                // Store location query
                else if (this.isLocationQuery(lowerMessage)) {
                    this.handleLocationQuery(lowerMessage);
                }
                // General help
                else if (this.isHelpQuery(lowerMessage)) {
                    this.handleHelpQuery();
                }
                // Default response
                else {
                    this.handleDefaultResponse(message);
                }
            }, 500);
        }
    }

    isManualLocationInput(message) {
        const locationKeywords = ['i\'m in', 'i am in', 'i\'m at', 'i am at', 'my location is', 'i live in', 'i\'m located'];
        const lowerMessage = message.toLowerCase();
        return locationKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    handleManualLocationInput(message) {
        // Extract location from message (simplified - in production, use geocoding API)
        const lowerMessage = message.toLowerCase();

        // Set approximate coordinates based on common locations
        const locationMap = {
            'manhattan': { lat: 40.7831, lng: -73.9712 },
            'brooklyn': { lat: 40.6892, lng: -73.9442 },
            'queens': { lat: 40.7282, lng: -73.7949 },
            'bronx': { lat: 40.8448, lng: -73.8648 },
            'new york': { lat: 40.7589, lng: -73.9851 },
            'nyc': { lat: 40.7589, lng: -73.9851 },
            'downtown': { lat: 40.7589, lng: -73.9851 },
            'uptown': { lat: 40.7831, lng: -73.9712 }
        };

        let locationFound = false;
        for (const [location, coords] of Object.entries(locationMap)) {
            if (lowerMessage.includes(location)) {
                this.userLocation = coords;
                locationFound = true;
                this.addBotMessage(`Great! I've set your location to ${location.charAt(0).toUpperCase() + location.slice(1)}. Now I can help you find nearby stores! 📍`);

                // Automatically show nearby stores
                setTimeout(() => {
                    this.showNearbyStores();
                }, 1000);
                break;
            }
        }

        if (!locationFound) {
            // Use default NYC location
            this.userLocation = { lat: 40.7589, lng: -73.9851 };
            this.addBotMessage("I've set your location to New York City area. If you need stores in a different area, please let me know your specific neighborhood or city.");

            setTimeout(() => {
                this.showNearbyStores();
            }, 1000);
        }
    }
    
    isProductQuery(message) {
        const productKeywords = ['find', 'search', 'looking for', 'need', 'want', 'buy', 'get', 'have'];
        const productNames = window.groceryApp.products.map(p => p.name.toLowerCase());
        const categories = ['fruits', 'vegetables', 'dairy', 'snacks', 'beverages', 'bakery'];
        
        return productKeywords.some(keyword => message.includes(keyword)) &&
               (productNames.some(name => message.includes(name.toLowerCase())) ||
                categories.some(cat => message.includes(cat)));
    }
    
    isLocationQuery(message) {
        const locationKeywords = ['store', 'shop', 'location', 'nearby', 'near me', 'directions', 'address', 'where'];
        return locationKeywords.some(keyword => message.includes(keyword));
    }
    
    isHelpQuery(message) {
        const helpKeywords = ['help', 'what can you do', 'how', 'assist', 'support'];
        return helpKeywords.some(keyword => message.includes(keyword));
    }
    
    handleProductSearch(message) {
        const products = window.groceryApp.products;
        const matchedProducts = products.filter(product => 
            message.includes(product.name.toLowerCase()) ||
            message.includes(product.category.toLowerCase()) ||
            product.description.toLowerCase().includes(message.split(' ').find(word => word.length > 3) || '')
        );
        
        if (matchedProducts.length > 0) {
            const productList = matchedProducts.slice(0, 5).map(product => 
                `• ${product.name} - $${product.price.toFixed(2)} (${product.category})`
            ).join('\n');
            
            this.addBotMessage(`I found these products for you:\n\n${productList}\n\nWould you like me to find stores that have these items in stock?`);
            
            // Show stores with these products
            setTimeout(() => {
                this.showStoresWithProducts(matchedProducts);
            }, 2000);
        } else {
            this.addBotMessage("I couldn't find any products matching your search. Try searching for items like 'apples', 'milk', 'bread', or browse our categories: fruits, vegetables, dairy, snacks, beverages, and bakery.");
        }
    }
    
    handleLocationQuery(message) {
        if (!this.userLocation) {
            this.addBotMessage("I'd love to help you find nearby stores! I can help you in two ways:", `
                <div class="quick-actions" style="margin-top: 1rem;">
                    <div class="quick-action" onclick="chatbotManager.requestLocationPermission()">📍 Use My Location</div>
                    <div class="quick-action" onclick="chatbotManager.askForManualLocation()">📝 Enter Address</div>
                </div>
            `);
            return;
        }

        this.showNearbyStores();
    }

    requestLocationPermission() {
        this.addBotMessage("Requesting location access... Please allow location permission when prompted.");
        this.requestUserLocation();
    }

    askForManualLocation() {
        this.addBotMessage("Please tell me your city or address, and I'll help you find nearby stores. For example: 'I'm in Manhattan' or 'I'm at 123 Main Street, New York'");
    }
    
    handleHelpQuery() {
        const helpMessage = `I'm SuvaiBot, your grocery shopping assistant! 🤖\n\nI can help you with:\n\n🔍 **Product Search**: Ask me to find specific items like "find apples" or "search for dairy products"\n\n📍 **Store Locations**: Find nearby stores with "show nearby stores" or "where can I buy milk"\n\n🗺️ **Directions**: Get directions to stores that have your desired products\n\n💡 **Tips**: I can suggest alternatives and help you discover new products!\n\nJust ask me anything about groceries or stores!`;

        this.addBotMessage(helpMessage);
    }
    
    handleDefaultResponse(message) {
        const responses = [
            "I'm here to help you find groceries and locate stores! Try asking me about specific products or nearby store locations.",
            "I can help you search for products or find stores near you. What are you looking for today?",
            "Let me help you with your grocery needs! You can ask me to find products or locate nearby stores.",
            "I'm your grocery assistant! Ask me about products like 'find fresh apples' or 'show nearby stores'.",
            "Hi there! I can help you find products in our store or locate nearby SUVAI stores. What would you like to know?",
            "Hello! I'm SuvaiBot. I can assist you with product searches and store locations. How can I help you today?"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.addBotMessage(randomResponse);

        // Add quick actions for better user experience
        setTimeout(() => {
            const quickActions = `
                <div class="quick-actions">
                    <div class="quick-action" onclick="chatbotManager.handleQuickAction('find apples')">Find Products</div>
                    <div class="quick-action" onclick="chatbotManager.handleQuickAction('nearby stores')">Find Stores</div>
                    <div class="quick-action" onclick="chatbotManager.handleQuickAction('help me')">Get Help</div>
                </div>
            `;
            this.addBotMessage("Here are some things I can help you with:", quickActions);
        }, 1000);
    }
    
    handleQuickAction(action) {
        document.getElementById('chatbot-input').value = action;
        this.sendMessage();
    }
    
    showStoresWithProducts(products) {
        const stores = this.getMockStores();
        const storesWithProducts = stores.map(store => {
            const availableProducts = products.filter(() => Math.random() > 0.3); // Random availability
            const distance = this.calculateDistance(store.lat, store.lng);
            
            return {
                ...store,
                availableProducts,
                distance,
                availability: availableProducts.length > 0 ? 
                    (availableProducts.length === products.length ? 'in-stock' : 'low-stock') : 'out-of-stock'
            };
        }).sort((a, b) => a.distance - b.distance);
        
        const storeResults = storesWithProducts.slice(0, 3).map(store => `
            <div class="store-result">
                <h4>${store.name}</h4>
                <div class="store-info">
                    <span class="store-distance">${store.distance.toFixed(1)} km away</span>
                    <span class="store-availability ${store.availability}">
                        ${store.availability === 'in-stock' ? '✅ In Stock' : 
                          store.availability === 'low-stock' ? '⚠️ Limited Stock' : '❌ Out of Stock'}
                    </span>
                </div>
                <div class="store-actions">
                    <button class="store-action-btn" onclick="chatbotManager.showDirections(${store.lat}, ${store.lng}, '${store.name}')">
                        Get Directions
                    </button>
                    <button class="store-action-btn secondary" onclick="chatbotManager.showStoreDetails('${store.name}')">
                        Store Info
                    </button>
                </div>
            </div>
        `).join('');
        
        this.addBotMessage("Here are the nearest stores with your requested products:", storeResults);
    }
    
    showNearbyStores() {
        const stores = this.getMockStores();
        const storesWithDistance = stores.map(store => ({
            ...store,
            distance: this.calculateDistance(store.lat, store.lng)
        })).sort((a, b) => a.distance - b.distance);

        const storeList = storesWithDistance.slice(0, 5).map(store =>
            `• ${store.name} - ${store.distance.toFixed(1)} km away\n  ${store.address}`
        ).join('\n\n');

        this.addBotMessage(`Here are the nearest SUVAI stores:\n\n${storeList}\n\nWould you like directions to any of these stores?`);

        // Show map button
        setTimeout(() => {
            this.addBotMessage("", `
                <div style="text-align: center; margin-top: 1rem;">
                    <button class="store-action-btn" onclick="chatbotManager.showMapModal()">
                        📍 View on Map
                    </button>
                </div>
            `);
        }, 1000);
    }
    
    getMockStores() {
        return [
            { id: 1, name: "SUVAI Downtown", lat: 40.7589, lng: -73.9851, address: "123 Main St, New York, NY 10001" },
            { id: 2, name: "SUVAI Uptown", lat: 40.7831, lng: -73.9712, address: "456 Broadway, New York, NY 10025" },
            { id: 3, name: "SUVAI East Side", lat: 40.7505, lng: -73.9934, address: "789 East Ave, New York, NY 10009" },
            { id: 4, name: "SUVAI West Village", lat: 40.7357, lng: -74.0036, address: "321 West St, New York, NY 10014" },
            { id: 5, name: "SUVAI Brooklyn", lat: 40.6892, lng: -73.9442, address: "654 Brooklyn Ave, Brooklyn, NY 11201" }
        ];
    }
    
    calculateDistance(storeLat, storeLng) {
        if (!this.userLocation) {
            return Math.random() * 10 + 1; // Random distance if no user location
        }
        
        // Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(storeLat - this.userLocation.lat);
        const dLng = this.toRadians(storeLng - this.userLocation.lng);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRadians(this.userLocation.lat)) * Math.cos(this.toRadians(storeLat)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    requestUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('Location obtained:', this.userLocation);
                    this.addBotMessage("📍 Great! I can now help you find nearby stores based on your location.");
                },
                (error) => {
                    console.warn('Location access denied:', error);
                    // Use default location (New York City)
                    this.userLocation = { lat: 40.7589, lng: -73.9851 };

                    let errorMessage = "I couldn't access your location. ";
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += "Please allow location access in your browser settings to get personalized store recommendations.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage += "Location request timed out.";
                            break;
                        default:
                            errorMessage += "An unknown error occurred.";
                            break;
                    }
                    errorMessage += " I'll use New York City as the default location for now.";

                    setTimeout(() => {
                        this.addBotMessage(errorMessage);
                    }, 2000);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        } else {
            // Use default location
            this.userLocation = { lat: 40.7589, lng: -73.9851 };
            setTimeout(() => {
                this.addBotMessage("Your browser doesn't support location services. I'll use New York City as the default location.");
            }, 2000);
        }
    }
    
    showDirections(lat, lng, storeName) {
        if (this.userLocation) {
            const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${this.userLocation.lat}%2C${this.userLocation.lng}%3B${lat}%2C${lng}`;
            window.open(url, '_blank');
            this.addBotMessage(`Opening directions to ${storeName} in a new tab! 🗺️`);
        } else {
            this.addBotMessage("I need your location to provide directions. Please allow location access or enter your address.");
        }
    }
    
    showStoreDetails(storeName) {
        const storeDetails = `📍 **${storeName}**\n\n🕒 **Hours**: Mon-Sun 7:00 AM - 10:00 PM\n📞 **Phone**: (555) 123-4567\n🛒 **Services**: Grocery pickup, delivery available\n🅿️ **Parking**: Free parking available\n♿ **Accessibility**: Wheelchair accessible`;
        
        this.addBotMessage(storeDetails);
    }
    
    showMapModal() {
        document.getElementById('mapModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Initialize map (handled by map.js)
        if (window.mapManager) {
            window.mapManager.initializeMap();
        }
    }
    
    hideMapModal() {
        document.getElementById('mapModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getSessionId() {
        let sessionId = localStorage.getItem('chatbot_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatbot_session_id', sessionId);
        }
        return sessionId;
    }

    handleApiResponse(data) {
        switch (data.type) {
            case 'product_search':
                this.handleProductSearchResponse(data);
                break;
            case 'store_locations':
                this.handleStoreLocationsResponse(data);
                break;
            case 'text':
            default:
                this.addBotMessage(data.message);
                break;
        }
    }

    handleProductSearchResponse(data) {
        let message = data.message;

        if (data.products && data.products.length > 0) {
            const productList = data.products.map(product =>
                `• ${product.name} - $${product.price.toFixed(2)} (${product.category})`
            ).join('\n');

            message += '\n\n' + productList;
        }

        this.addBotMessage(message);

        if (data.stores && data.stores.length > 0) {
            setTimeout(() => {
                this.showStoresWithProductsFromApi(data.stores);
            }, 1000);
        }
    }

    handleStoreLocationsResponse(data) {
        let message = data.message;

        if (data.stores && data.stores.length > 0) {
            const storeList = data.stores.map(store =>
                `• ${store.name} - ${store.distance} km away\n  ${store.address}`
            ).join('\n\n');

            message += '\n\n' + storeList;
        }

        this.addBotMessage(message);

        // Show map button
        setTimeout(() => {
            this.addBotMessage("", `
                <div style="text-align: center; margin-top: 1rem;">
                    <button class="store-action-btn" onclick="chatbotManager.showMapModal()">
                        📍 View on Map
                    </button>
                </div>
            `);
        }, 1000);
    }

    showStoresWithProductsFromApi(stores) {
        const storeResults = stores.map(store => `
            <div class="store-result">
                <h4>${store.name}</h4>
                <div class="store-info">
                    <span class="store-distance">${store.distance} km away</span>
                    <span class="store-availability ${store.availability_status}">
                        ${store.availability_status === 'in-stock' ? '✅ In Stock' :
                          store.availability_status === 'low-stock' ? '⚠️ Limited Stock' : '❌ Out of Stock'}
                    </span>
                </div>
                <div class="store-actions">
                    <button class="store-action-btn" onclick="chatbotManager.showDirections(${store.latitude}, ${store.longitude}, '${store.name}')">
                        Get Directions
                    </button>
                    <button class="store-action-btn secondary" onclick="chatbotManager.showStoreDetails('${store.name}')">
                        Store Info
                    </button>
                </div>
            </div>
        `).join('');

        this.addBotMessage("Here are the nearest stores with your requested products:", storeResults);
    }
}

// Initialize chatbot manager
const chatbotManager = new ChatbotManager();

// Make chatbot manager globally available
window.chatbotManager = chatbotManager;
