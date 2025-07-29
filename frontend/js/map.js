// Map Manager for OpenStreetMap integration
class MapManager {
    constructor() {
        this.map = null;
        this.userMarker = null;
        this.storeMarkers = [];
        this.userLocation = null;
        this.stores = [];
        this.init();
    }
    
    init() {
        this.getUserLocation();
        this.loadStoreData();
    }
    
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('Map: Location obtained:', this.userLocation);
                },
                (error) => {
                    console.warn('Map: Location access denied:', error);
                    // Default to New York City
                    this.userLocation = { lat: 40.7589, lng: -73.9851 };
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        } else {
            // Default to New York City
            this.userLocation = { lat: 40.7589, lng: -73.9851 };
        }
    }
    
    loadStoreData() {
        this.stores = [
            {
                id: 1,
                name: "SUVAI Downtown",
                lat: 40.7589,
                lng: -73.9851,
                address: "123 Main St, New York, NY 10001",
                phone: "(555) 123-4567",
                hours: "Mon-Sun 7:00 AM - 10:00 PM",
                services: ["Grocery pickup", "Delivery", "Pharmacy"]
            },
            {
                id: 2,
                name: "SUVAI Uptown",
                lat: 40.7831,
                lng: -73.9712,
                address: "456 Broadway, New York, NY 10025",
                phone: "(555) 234-5678",
                hours: "Mon-Sun 6:00 AM - 11:00 PM",
                services: ["Grocery pickup", "Delivery", "Bakery"]
            },
            {
                id: 3,
                name: "SUVAI East Side",
                lat: 40.7505,
                lng: -73.9934,
                address: "789 East Ave, New York, NY 10009",
                phone: "(555) 345-6789",
                hours: "Mon-Sun 7:00 AM - 10:00 PM",
                services: ["Grocery pickup", "Delivery"]
            },
            {
                id: 4,
                name: "SUVAI West Village",
                lat: 40.7357,
                lng: -74.0036,
                address: "321 West St, New York, NY 10014",
                phone: "(555) 456-7890",
                hours: "Mon-Sun 8:00 AM - 9:00 PM",
                services: ["Grocery pickup", "Organic section"]
            },
            {
                id: 5,
                name: "SUVAI Brooklyn",
                lat: 40.6892,
                lng: -73.9442,
                address: "654 Brooklyn Ave, Brooklyn, NY 11201",
                phone: "(555) 567-8901",
                hours: "Mon-Sun 7:00 AM - 10:00 PM",
                services: ["Grocery pickup", "Delivery", "Deli"]
            }
        ];
    }
    
    initializeMap() {
        // Clear existing map if it exists
        if (this.map) {
            this.map.remove();
        }
        
        // Initialize map centered on user location or default location
        const centerLat = this.userLocation ? this.userLocation.lat : 40.7589;
        const centerLng = this.userLocation ? this.userLocation.lng : -73.9851;
        
        this.map = L.map('map').setView([centerLat, centerLng], 12);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Add user location marker
        if (this.userLocation) {
            this.userMarker = L.marker([this.userLocation.lat, this.userLocation.lng], {
                icon: this.createUserIcon()
            }).addTo(this.map);
            
            this.userMarker.bindPopup(`
                <div class="map-popup">
                    <h4>📍 Your Location</h4>
                    <p>This is your current location</p>
                </div>
            `);
        }
        
        // Add store markers
        this.addStoreMarkers();
        
        // Update store list
        this.updateStoreList();
        
        // Fit map to show all markers
        this.fitMapToMarkers();
    }
    
    createUserIcon() {
        return L.divIcon({
            className: 'user-location-marker',
            html: `
                <div style="
                    background: #e21c15;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    position: relative;
                ">
                    <div style="
                        position: absolute;
                        top: -5px;
                        left: -5px;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        background: rgba(226, 28, 21, 0.3);
                        animation: pulse 2s infinite;
                    "></div>
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }
    
    createStoreIcon() {
        return L.divIcon({
            className: 'store-marker',
            html: `
                <div style="
                    background: #2c3e50;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                ">🏪</div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }
    
    addStoreMarkers() {
        // Clear existing store markers
        this.storeMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.storeMarkers = [];
        
        // Add markers for each store
        this.stores.forEach(store => {
            const distance = this.calculateDistance(store.lat, store.lng);
            
            const marker = L.marker([store.lat, store.lng], {
                icon: this.createStoreIcon()
            }).addTo(this.map);
            
            const popupContent = `
                <div class="map-popup">
                    <h4>🏪 ${store.name}</h4>
                    <p><strong>📍 Address:</strong> ${store.address}</p>
                    <p><strong>📞 Phone:</strong> ${store.phone}</p>
                    <p><strong>🕒 Hours:</strong> ${store.hours}</p>
                    <p><strong>📏 Distance:</strong> ${distance.toFixed(1)} km</p>
                    <p><strong>🛍️ Services:</strong> ${store.services.join(', ')}</p>
                    <div class="popup-actions">
                        <button onclick="mapManager.getDirections(${store.lat}, ${store.lng})" class="popup-btn">
                            🗺️ Get Directions
                        </button>
                        <button onclick="mapManager.selectStore(${store.id})" class="popup-btn secondary">
                            ℹ️ More Info
                        </button>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            
            // Store reference to marker
            marker.storeId = store.id;
            this.storeMarkers.push(marker);
        });
    }
    
    updateStoreList() {
        const storeListContainer = document.getElementById('storeList');
        
        // Calculate distances and sort stores
        const storesWithDistance = this.stores.map(store => ({
            ...store,
            distance: this.calculateDistance(store.lat, store.lng)
        })).sort((a, b) => a.distance - b.distance);
        
        storeListContainer.innerHTML = storesWithDistance.map(store => `
            <div class="store-list-item" data-store-id="${store.id}" onclick="mapManager.selectStore(${store.id})">
                <h4>🏪 ${store.name}</h4>
                <p><strong>📍</strong> ${store.address}</p>
                <p><strong>📏</strong> ${store.distance.toFixed(1)} km away</p>
                <p><strong>🕒</strong> ${store.hours}</p>
                <div style="margin-top: 0.5rem;">
                    <button onclick="event.stopPropagation(); mapManager.getDirections(${store.lat}, ${store.lng})" class="store-action-btn">
                        Get Directions
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    selectStore(storeId) {
        // Remove previous selection
        document.querySelectorAll('.store-list-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked store
        const storeItem = document.querySelector(`[data-store-id="${storeId}"]`);
        if (storeItem) {
            storeItem.classList.add('selected');
        }
        
        // Center map on selected store
        const store = this.stores.find(s => s.id === storeId);
        if (store) {
            this.map.setView([store.lat, store.lng], 15);
            
            // Open popup for the selected store
            const marker = this.storeMarkers.find(m => m.storeId === storeId);
            if (marker) {
                marker.openPopup();
            }
        }
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
    
    getDirections(storeLat, storeLng) {
        if (this.userLocation) {
            const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${this.userLocation.lat}%2C${this.userLocation.lng}%3B${storeLat}%2C${storeLng}`;
            window.open(url, '_blank');
        } else {
            alert('Location access is required to get directions. Please allow location access and try again.');
        }
    }
    
    fitMapToMarkers() {
        if (this.storeMarkers.length === 0) return;
        
        const group = new L.featureGroup([...this.storeMarkers, ...(this.userMarker ? [this.userMarker] : [])]);
        this.map.fitBounds(group.getBounds().pad(0.1));
    }
    
    refreshMap() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }
}

// Add CSS for map popups
const mapStyles = `
    .map-popup {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 250px;
    }
    
    .map-popup h4 {
        margin: 0 0 0.5rem 0;
        color: var(--text-dark);
        font-size: 1.1rem;
    }
    
    .map-popup p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    .popup-actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .popup-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
        flex: 1;
        min-width: 100px;
    }
    
    .popup-btn:hover {
        background: var(--primary-dark);
    }
    
    .popup-btn.secondary {
        background: var(--secondary-color);
    }
    
    .popup-btn.secondary:hover {
        background: #34495e;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.2);
            opacity: 0.7;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .leaflet-popup-tip {
        background: white;
    }
`;

// Inject map styles
const mapStyleSheet = document.createElement('style');
mapStyleSheet.textContent = mapStyles;
document.head.appendChild(mapStyleSheet);

// Initialize map manager
const mapManager = new MapManager();

// Make map manager globally available
window.mapManager = mapManager;
