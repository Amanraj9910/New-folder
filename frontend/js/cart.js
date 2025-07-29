// Shopping Cart Manager
class CartManager {
    constructor() {
        this.items = [];
        this.total = 0;
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateCartDisplay();
    }
    
    setupEventListeners() {
        // Cart icon click
        document.getElementById('cartIcon').addEventListener('click', () => {
            this.showCart();
        });
        
        // Close cart modal
        document.getElementById('closeCart').addEventListener('click', () => {
            this.hideCart();
        });
        
        // Clear cart
        document.getElementById('clearCart').addEventListener('click', () => {
            this.clearCart();
        });
        
        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.checkout();
        });
        
        // Close modal when clicking outside
        document.getElementById('cartModal').addEventListener('click', (e) => {
            if (e.target.id === 'cartModal') {
                this.hideCart();
            }
        });
    }
    
    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.updateCartDisplay();
        this.saveToStorage();
        this.animateCartIcon();
    }
    
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.updateCartDisplay();
        this.saveToStorage();
    }
    
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.updateCartDisplay();
                this.saveToStorage();
            }
        }
    }
    
    clearCart() {
        if (this.items.length === 0) {
            window.groceryApp.showNotification('Cart is already empty!', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear your cart?')) {
            this.items = [];
            this.updateCartDisplay();
            this.saveToStorage();
            window.groceryApp.showNotification('Cart cleared!', 'success');
        }
    }
    
    calculateTotal() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        return this.total;
    }
    
    updateCartDisplay() {
        // Update cart count
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Update cart items display
        this.renderCartItems();
        
        // Update total
        const cartTotal = document.getElementById('cartTotal');
        cartTotal.textContent = this.calculateTotal().toFixed(2);
    }
    
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                </div>
            `;
            return;
        }
        
        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-icon">${item.icon}</div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item" onclick="cartManager.removeItem(${item.id})" title="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    showCart() {
        document.getElementById('cartModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    hideCart() {
        document.getElementById('cartModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    animateCartIcon() {
        const cartIcon = document.getElementById('cartIcon');
        cartIcon.style.transform = 'scale(1.2)';
        cartIcon.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);
    }
    
    checkout() {
        if (this.items.length === 0) {
            window.groceryApp.showNotification('Your cart is empty!', 'info');
            return;
        }
        
        // Simulate checkout process
        const orderSummary = this.items.map(item => 
            `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
        
        const totalAmount = this.calculateTotal().toFixed(2);
        
        const confirmMessage = `Order Summary:\n\n${orderSummary}\n\nTotal: $${totalAmount}\n\nProceed with checkout?`;
        
        if (confirm(confirmMessage)) {
            // Simulate order processing
            window.groceryApp.showNotification('Processing your order...', 'info');
            
            setTimeout(() => {
                window.groceryApp.showNotification('Order placed successfully! 🎉', 'success');
                this.clearCart();
                this.hideCart();
            }, 2000);
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('freshmart_cart', JSON.stringify(this.items));
        } catch (error) {
            console.warn('Could not save cart to localStorage:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const savedCart = localStorage.getItem('freshmart_cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
            }
        } catch (error) {
            console.warn('Could not load cart from localStorage:', error);
            this.items = [];
        }
    }
    
    getCartSummary() {
        return {
            items: this.items,
            totalItems: this.items.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: this.calculateTotal()
        };
    }
}

// CSS for cart items (injected dynamically)
const cartStyles = `
    .empty-cart {
        text-align: center;
        padding: 2rem;
        color: var(--text-light);
    }
    
    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        margin-bottom: 1rem;
        background: var(--white);
    }
    
    .cart-item-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
    }
    
    .cart-item-icon {
        font-size: 2rem;
        width: 50px;
        text-align: center;
    }
    
    .cart-item-details h4 {
        margin: 0 0 0.25rem 0;
        color: var(--text-dark);
        font-size: 1rem;
    }
    
    .cart-item-price {
        margin: 0;
        color: var(--text-light);
        font-size: 0.9rem;
    }
    
    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--background-light);
        border-radius: 20px;
        padding: 0.25rem;
    }
    
    .quantity-btn {
        background: var(--white);
        border: 1px solid var(--border-color);
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.8rem;
    }
    
    .quantity-btn:hover {
        background: var(--primary-color);
        color: var(--white);
        border-color: var(--primary-color);
    }
    
    .quantity {
        min-width: 30px;
        text-align: center;
        font-weight: 600;
        color: var(--text-dark);
    }
    
    .cart-item-total {
        font-weight: 600;
        color: var(--text-dark);
        min-width: 60px;
        text-align: right;
    }
    
    .remove-item {
        background: none;
        border: none;
        color: var(--text-light);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    .remove-item:hover {
        background: #e74c3c;
        color: var(--white);
    }
    
    .cart-total {
        text-align: center;
        padding: 1rem;
        border-top: 2px solid var(--border-color);
        margin-top: 1rem;
    }
    
    .cart-total h4 {
        color: var(--text-dark);
        font-size: 1.3rem;
        margin: 0;
    }
    
    @media (max-width: 768px) {
        .cart-item {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
        }
        
        .cart-item-controls {
            justify-content: space-between;
        }
        
        .quantity-controls {
            order: 1;
        }
        
        .cart-item-total {
            order: 2;
            text-align: center;
        }
        
        .remove-item {
            order: 3;
            align-self: center;
        }
    }
`;

// Inject cart styles
const styleSheet = document.createElement('style');
styleSheet.textContent = cartStyles;
document.head.appendChild(styleSheet);

// Initialize cart manager
const cartManager = new CartManager();

// Make cart manager globally available
window.cartManager = cartManager;
