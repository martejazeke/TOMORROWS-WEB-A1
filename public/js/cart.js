// Cart state management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function showNotification(message) {
    const notification = document.getElementById("notification");
    if (notification) {
        notification.textContent = message;
        notification.classList.remove("hidden");
        setTimeout(() => {
            notification.classList.add("hidden");
        }, 3000);
    }
}

function addToCart(product) {
    const existingItem = cart.find(item => 
        item.name === product.name && 
        item.color === product.color
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showNotification('Item removed from cart');
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    
    // Update cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        // Show empty cart state
        cartItems.innerHTML = `
            <div class="empty-cart">
                <img src="images/empty-cart.png" alt="Empty Cart">
                <p>Your cart is empty</p>
                <p class="empty-cart-subtitle">Add some awesome guitars!</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.dataset.productId = item.id; // Add data attribute for product ID
            itemElement.innerHTML = `
                <div class="cart-item-content">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="color-variant">Color: ${item.colorName || 'Default'}</p>
                        <p>AED ${price.toLocaleString()} × ${item.quantity}</p>
                    </div>
                    <button class="remove-item" 
                        data-name="${item.name}"
                        data-color="${item.color}">&times;</button>
                </div>
            `;
            cartItems.appendChild(itemElement);
        });
    }
    
    // Update total with the same fix
    const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace('AED', '').replace(/,/g, '').trim());
        return sum + (price * item.quantity);
    }, 0);
    
    // Use toLocaleString to format the total with commas
    cartTotal.textContent = `AED ${total.toLocaleString()}`;
}

function showCartPanel() {
    const cartPanel = document.getElementById('cart-panel');
    cartPanel.classList.add('open');
}

function hideCartPanel() {
    const cartPanel = document.getElementById('cart-panel');
    cartPanel.classList.remove('open');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const cartBtn = document.getElementById('cart-btn');
    const cartPanel = document.getElementById('cart-panel');
    const closeCartBtn = document.getElementById('close-cart');
    const continueBtn = document.querySelector('.continue-btn');

    cartBtn.addEventListener('click', () => {
        cartPanel.classList.add('open');
        updateCartUI();
    });

    closeCartBtn.addEventListener('click', () => {
        cartPanel.classList.remove('open');
    });
    
    // Continue shopping button
    if (continueBtn) {
        continueBtn.addEventListener('click', hideCartPanel);
    }
    
    // Remove items
    document.getElementById('cart-items').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const name = e.target.dataset.name;
            const color = e.target.dataset.color;
            cart = cart.filter(item => 
                !(item.name === name && item.color === color)
            );
            saveCart();
            updateCartUI();
        }
    });
    
    // Initialize cart UI
    updateCartUI();
});

// Export for use in other files
window.addToCart = addToCart;
