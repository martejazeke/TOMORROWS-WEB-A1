import { supabaseClient } from './config.js';

// Cart functionality
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification('Added to cart');
    updateCartUI();
}

function updateCartUI(cartItems) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Initialize color switching functionality
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const colorDots = card.querySelectorAll('.color-dot');
        const frontImage = card.querySelector('.front-image');
        const backImage = card.querySelector('.back-image');
        
        // Add active class to first dot of each card by default
        if (colorDots.length > 0) {
            colorDots[0].classList.add('active');
        }
        
        colorDots.forEach(dot => {
            dot.addEventListener('click', () => {
                // Remove active class from all dots in this card
                colorDots.forEach(d => d.classList.remove('active'));
                // Add active class to clicked dot
                dot.classList.add('active');
                
                // Update both front and back images
                if (dot.dataset.front) {
                    frontImage.src = dot.dataset.front;
                }
                if (dot.dataset.back) {
                    backImage.src = dot.dataset.back;
                }
            });
        });

        // Add view more button listener
        const viewMoreBtn = card.querySelector('.view-more');
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', () => {

            });
        }
    });
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

// Wishlist functionality with Supabase integration
async function toggleWishlist(product) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            showNotification("Please login to use wishlist");
            return;
        }

        const cleanProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        };

        const { data: wishlist, error: fetchError } = await supabaseClient
            .from('wishlists')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        if (!wishlist) {
            const { error: insertError } = await supabaseClient
                .from('wishlists')
                .insert([{ 
                    user_id: user.id, 
                    items: [cleanProduct]
                }]);
            if (insertError) throw insertError;
            showNotification('Added to wishlist');
        } else {
            const items = wishlist.items || [];
            const exists = items.some(item => item.id === cleanProduct.id);
            
            const updatedItems = exists 
                ? items.filter(item => item.id !== cleanProduct.id)
                : [...items, cleanProduct];

            const { error: updateError } = await supabaseClient
                .from('wishlists')
                .update({ items: updatedItems })
                .eq('user_id', user.id);

            if (updateError) throw updateError;
            showNotification(exists ? 'Removed from wishlist' : 'Added to wishlist');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error updating wishlist');
    }
}

export { toggleWishlist, addToCart };

