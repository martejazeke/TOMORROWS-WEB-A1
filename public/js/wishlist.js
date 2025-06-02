import { supabaseClient } from './config.js';

async function toggleWishlist(product) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        showNotification("Please login to use wishlist");
        document.getElementById("auth-modal").classList.remove("hidden");
        return;
    }

    try {
        let { data: wishlist } = await supabaseClient
            .from('wishlists')
            .select('items')
            .eq('user_id', user.id)
            .single();

        let items = wishlist?.items || [];
        const existingIndex = items.findIndex(item => item.id === product.id);

        if (existingIndex === -1) {
            items.push(product);
            showNotification("Added to wishlist");
        } else {
            items.splice(existingIndex, 1);
            showNotification("Removed from wishlist");
        }

        const { error } = await supabaseClient
            .from('wishlists')
            .upsert({ 
                user_id: user.id,
                items: items 
            });

        if (error) throw error;
        updateWishlistUI();
        
    } catch (error) {
        console.error('Error updating wishlist:', error);
        showNotification("Error updating wishlist");
    }
}

async function updateWishlistUI() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const wishlistItems = document.querySelector(".wishlist-items");
    const wishlistLoginRequired = document.querySelector(".wishlist-login-required");
    const emptyWishlist = document.querySelector(".wishlist-empty");

    if (!user) {
        wishlistLoginRequired?.classList.remove("hidden");
        wishlistItems.innerHTML = '';
        emptyWishlist?.classList.add("hidden");
        return;
    }

    wishlistLoginRequired?.classList.add("hidden");

    const { data: wishlist } = await supabaseClient
        .from('wishlists')
        .select('items')
        .eq('user_id', user.id)
        .single();

    const items = wishlist?.items || [];

    if (items.length === 0) {
        wishlistItems.innerHTML = '';
        emptyWishlist?.classList.remove("hidden");
        return;
    }

    emptyWishlist?.classList.add("hidden");
    wishlistItems.innerHTML = items.map(item => `
        <div class="wishlist-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="wishlist-item-details">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
            </div>
            <button class="remove-item" data-product='${JSON.stringify(item)}'>
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
    `).join('');

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const product = JSON.parse(button.dataset.product);
            toggleWishlist(product);
        });
    });
}

// Initialize wishlist functionality
document.addEventListener('DOMContentLoaded', () => {
    const wishlistTrigger = document.querySelector('.wishlist-trigger');
    const wishlistDropdown = document.querySelector('.wishlist-dropdown');

    // Toggle wishlist dropdown
    wishlistTrigger?.addEventListener('click', () => {
        wishlistDropdown?.classList.toggle('hidden');
        updateWishlistUI();
    });

    // Close wishlist dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.wishlist-container') && !wishlistDropdown?.classList.contains('hidden')) {
            wishlistDropdown?.classList.add('hidden');
        }
    });

    // Handle wishlist login button
    document.getElementById('wishlist-login-btn')?.addEventListener('click', () => {
        document.getElementById('auth-modal')?.classList.remove('hidden');
        wishlistDropdown?.classList.add('hidden');
    });

    updateWishlistUI();
});

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

export { toggleWishlist, updateWishlistUI };