// Mock product data
const products = [
    // Fruits
    { id: 1, name: "Fresh Apples", category: "fruits", price: 3.99, icon: "🍎", description: "Crisp and sweet red apples" },
    { id: 2, name: "Bananas", category: "fruits", price: 2.49, icon: "🍌", description: "Ripe yellow bananas" },
    { id: 3, name: "Orange Bundle", category: "fruits", price: 4.99, icon: "🍊", description: "Fresh juicy oranges" },
    { id: 4, name: "Strawberries", category: "fruits", price: 5.99, icon: "🍓", description: "Sweet strawberries" },
    { id: 5, name: "Grapes", category: "fruits", price: 6.99, icon: "🍇", description: "Fresh green grapes" },
    { id: 6, name: "Pineapple", category: "fruits", price: 4.49, icon: "🍍", description: "Tropical pineapple" },
    
    // Vegetables
    { id: 7, name: "Fresh Carrots", category: "vegetables", price: 2.99, icon: "🥕", description: "Organic carrots" },
    { id: 8, name: "Broccoli", category: "vegetables", price: 3.49, icon: "🥦", description: "Fresh broccoli crowns" },
    { id: 9, name: "Bell Peppers", category: "vegetables", price: 4.99, icon: "🫑", description: "Colorful bell peppers" },
    { id: 10, name: "Tomatoes", category: "vegetables", price: 3.99, icon: "🍅", description: "Ripe red tomatoes" },
    { id: 11, name: "Lettuce", category: "vegetables", price: 2.49, icon: "🥬", description: "Fresh lettuce leaves" },
    { id: 12, name: "Onions", category: "vegetables", price: 1.99, icon: "🧅", description: "Yellow onions" },
    
    // Dairy
    { id: 13, name: "Whole Milk", category: "dairy", price: 3.49, icon: "🥛", description: "Fresh whole milk" },
    { id: 14, name: "Cheddar Cheese", category: "dairy", price: 5.99, icon: "🧀", description: "Sharp cheddar cheese" },
    { id: 15, name: "Greek Yogurt", category: "dairy", price: 4.99, icon: "🥛", description: "Creamy Greek yogurt" },
    { id: 16, name: "Butter", category: "dairy", price: 4.49, icon: "🧈", description: "Unsalted butter" },
    { id: 17, name: "Eggs", category: "dairy", price: 3.99, icon: "🥚", description: "Farm fresh eggs" },
    
    // Snacks
    { id: 18, name: "Mixed Nuts", category: "snacks", price: 7.99, icon: "🥜", description: "Assorted mixed nuts" },
    { id: 19, name: "Potato Chips", category: "snacks", price: 3.49, icon: "🍟", description: "Crispy potato chips" },
    { id: 20, name: "Crackers", category: "snacks", price: 2.99, icon: "🍘", description: "Whole grain crackers" },
    { id: 21, name: "Granola Bars", category: "snacks", price: 4.99, icon: "🍫", description: "Healthy granola bars" },
    
    // Beverages
    { id: 22, name: "Orange Juice", category: "beverages", price: 4.49, icon: "🧃", description: "Fresh orange juice" },
    { id: 23, name: "Coffee Beans", category: "beverages", price: 12.99, icon: "☕", description: "Premium coffee beans" },
    { id: 24, name: "Green Tea", category: "beverages", price: 6.99, icon: "🍵", description: "Organic green tea" },
    { id: 25, name: "Sparkling Water", category: "beverages", price: 3.99, icon: "💧", description: "Sparkling mineral water" },
    
    // Bakery
    { id: 26, name: "Whole Wheat Bread", category: "bakery", price: 2.99, icon: "🍞", description: "Fresh whole wheat bread" },
    { id: 27, name: "Croissants", category: "bakery", price: 5.99, icon: "🥐", description: "Buttery croissants" },
    { id: 28, name: "Bagels", category: "bakery", price: 4.49, icon: "🥯", description: "Fresh bagels" },
    { id: 29, name: "Muffins", category: "bakery", price: 6.99, icon: "🧁", description: "Blueberry muffins" }
];

// Global variables
let filteredProducts = [...products];
let currentCategory = 'all';
let currentSort = 'name';

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    setupEventListeners();
    setupSmoothScrolling();
});

// Setup event listeners
function setupEventListeners() {
    // Category filter
    categoryFilter.addEventListener('change', function() {
        currentCategory = this.value;
        filterAndSortProducts();
    });
    
    // Sort filter
    sortFilter.addEventListener('change', function() {
        currentSort = this.value;
        filterAndSortProducts();
    });
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Category cards click
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            categoryFilter.value = category;
            currentCategory = category;
            filterAndSortProducts();
            scrollToSection('products');
        });
    });
}

// Handle search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    applyFiltersAndSort();
    renderProducts();
    
    // Scroll to products if search was performed
    if (searchTerm !== '') {
        scrollToSection('products');
    }
}

// Filter and sort products
function filterAndSortProducts() {
    // Start with all products or current search results
    let baseProducts = searchInput.value.trim() === '' ? [...products] : [...filteredProducts];
    
    // Apply category filter
    if (currentCategory !== 'all') {
        baseProducts = baseProducts.filter(product => product.category === currentCategory);
    }
    
    filteredProducts = baseProducts;
    applyFiltersAndSort();
    renderProducts();
}

// Apply sorting to filtered products
function applyFiltersAndSort() {
    switch (currentSort) {
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
    }
}

// Render products to the grid
function renderProducts() {
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                ${product.icon}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Add animation effect
        const button = event.target;
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.style.background = '#27ae60';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 1500);
        
        // Trigger cart update (handled by cart.js)
        if (typeof window.cartManager !== 'undefined') {
            window.cartManager.addItem(product);
        }
        
        // Show notification
        showNotification(`${product.name} added to cart!`, 'success');
    }
}

// Smooth scrolling function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Setup smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Utility function to get product by ID
function getProductById(id) {
    return products.find(product => product.id === id);
}

// Export functions for use in other scripts
window.groceryApp = {
    products,
    getProductById,
    showNotification,
    scrollToSection
};
