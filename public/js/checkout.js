import { supabaseClient } from './config.js';

function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
}

function showCheckoutModal() {
    // Check authentication first
    const user = supabaseClient.auth.getUser();
    if (!user) {
        showNotification('Please login to view checkout');
        return;
    }

    const modal = document.getElementById('checkout-modal');
    const itemsContainer = modal.querySelector('.checkout-items');
    const totalElement = modal.querySelector('#checkout-total');
    
    // Get cart items
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    
    // Display items with improved styling
    itemsContainer.innerHTML = cart.map(item => {
        const price = parseFloat(item.price.replace('AED', '').replace(/,/g, '').trim());
        return `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
                <div class="item-details">
                    <h4 class="item-name">${item.name}</h4>
                    <div class="price-quantity">
                        <span class="quantity">Quantity: ${item.quantity}</span>
                        <span class="price">AED ${price.toLocaleString()}</span>
                    </div>
                    <div class="subtotal">
                        Subtotal: AED ${(price * item.quantity).toLocaleString()}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Calculate and display total
    const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace('AED', '').replace(/,/g, '').trim());
        return sum + (price * item.quantity);
    }, 0);
    
    totalElement.textContent = `AED ${total.toLocaleString()}`;
    modal.classList.remove('hidden');
}

async function processCheckout() {
    try {
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        
        if (!user) {
            showNotification('Please login to checkout');
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            showNotification('Your cart is empty');
            return;
        }

        // Calculate total and ensure it's a number
        const total = cart.reduce((sum, item) => {
            const price = parseFloat(item.price.replace('AED', '').replace(/,/g, '').trim());
            return sum + (price * item.quantity);
        }, 0);

        // Create order with properly formatted data
        const { data, error } = await supabaseClient
            .from('orders')
            .insert({
                user_id: user.id,
                items: JSON.stringify(cart),
                total_amount: total,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        // Clear cart and update UI
        localStorage.removeItem('cart');
        document.getElementById('checkout-modal').classList.add('hidden');
        document.getElementById('cart-panel').classList.remove('open');
        showNotification('Order placed successfully!');
        
        // Update cart count
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = '0';
        }

    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Error processing checkout');
    }
}

function generateReceiptHTML(cart) {
    return cart.map(item => `
        <div style="margin-bottom: 10px;">
            <strong>${item.name}</strong><br>
            Quantity: ${item.quantity}<br>
            Price: AED ${parseFloat(item.price.replace('AED', '').replace(/,/g, '').trim()).toLocaleString()}<br>
            Subtotal: AED ${(item.quantity * parseFloat(item.price.replace('AED', '').replace(/,/g, '').trim())).toLocaleString()}
        </div>
    `).join('');
}

function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    // Update cart total
    if (cartTotal) {
        const total = cart.reduce((sum, item) => {
            const price = parseFloat(item.price.replace('AED', '').replace(/,/g, '').trim());
            return sum + (price * item.quantity);
        }, 0);
        cartTotal.textContent = `AED ${total.toLocaleString()}`;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeModalBtn = document.getElementById('close-checkout-modal');
    const confirmBtn = document.getElementById('confirm-checkout');
    const cancelBtn = document.getElementById('cancel-checkout');
    
    if (checkoutBtn) checkoutBtn.addEventListener('click', showCheckoutModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => {
        document.getElementById('checkout-modal').classList.add('hidden');
    });
    if (confirmBtn) confirmBtn.addEventListener('click', processCheckout);
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        document.getElementById('checkout-modal').classList.add('hidden');
    });
});

export { showCheckoutModal, processCheckout, updateCartUI };