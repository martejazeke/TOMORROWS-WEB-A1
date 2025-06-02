import { toggleWishlist } from './wishlist.js';

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("product-modal");
  const frontImage = document.getElementById("modal-guitar-image");
  const backImage = document.getElementById("modal-guitar-back");
  const imageWrapper = document.querySelector(".image-wrapper");
  const closeBtn = document.getElementById("close-product-modal");
  const colorOptionsContainer = modal.querySelector(".color-options");

  // Add click handler for color dots
  colorOptionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-dot')) {
      // Remove active class from all dots
      colorOptionsContainer.querySelectorAll('.color-dot').forEach(dot => {
        dot.classList.remove('active');
      });
      // Add active class to clicked dot
      e.target.classList.add('active');
    }
  });

  const bindViewMoreButtons = () => {
    const viewMoreButtons = document.querySelectorAll(".view-more");

    viewMoreButtons.forEach(button => {
      button.addEventListener("click", () => {
        document.getElementById("modal-product-name").textContent = button.dataset.name;
        document.getElementById("modal-price").textContent = button.dataset.price;
        document.getElementById("modal-description").textContent = button.dataset.description;

        const defaultFront = button.dataset.image;
        const defaultBack = button.dataset.back || "images/prs/sg-back.png";

        frontImage.src = defaultFront;
        if (backImage) backImage.src = defaultBack;

        colorOptionsContainer.innerHTML = "";

        const colorways = JSON.parse(button.dataset.colorways || "[]");

        if (colorways.length > 0) {
          colorways.forEach(variant => {
            const dot = document.createElement("div");
            dot.classList.add("color-dot");
            dot.style.backgroundColor = variant.color;
            dot.setAttribute("data-front", variant.front);
            dot.setAttribute("data-back", variant.back);

            dot.addEventListener("mouseenter", () => {
              frontImage.src = variant.front;
              if (backImage && variant.back) backImage.src = variant.back;
              imageWrapper?.classList.remove("flipped");
            });

            colorOptionsContainer.appendChild(dot);
          });
        } else {
          const fallbackDot = document.createElement("div");
          fallbackDot.classList.add("color-dot");
          fallbackDot.style.backgroundColor = "#ccc";
          fallbackDot.setAttribute("data-front", defaultFront);
          fallbackDot.setAttribute("data-back", defaultBack);

          fallbackDot.addEventListener("mouseenter", () => {
            frontImage.src = defaultFront;
            if (backImage) backImage.src = defaultBack;
            imageWrapper?.classList.remove("flipped");
          });

          colorOptionsContainer.appendChild(fallbackDot);
        }

        imageWrapper?.classList.remove("flipped");
        modal.classList.remove("hidden");
      });
    });
  };

  closeBtn?.addEventListener("click", () => {
    modal.classList.add("hidden");
    imageWrapper?.classList.remove("flipped");
  });

  bindViewMoreButtons();

  // Update add to cart handler
  document.getElementById("add-to-cart").addEventListener("click", () => {
    const modal = document.getElementById("product-modal");
    const currentColor = modal.querySelector(".color-dot.active") || modal.querySelector(".color-dot");
    const productName = document.getElementById("modal-product-name").textContent;
    
    const product = {
        name: productName,
        price: document.getElementById("modal-price").textContent,
        image: document.getElementById("modal-guitar-image").src,
        color: currentColor.style.backgroundColor,
        colorName: getColorName(currentColor.style.backgroundColor)
    };

    // Add to cart
    window.addToCart(product);

    // Show notification
    showNotification(`${productName} added to cart!`);
  });

  // Update product modal function
  function updateProductModal(button) {
    const modal = document.getElementById("product-modal");
    const name = button.dataset.name;
    const price = button.dataset.price;
    const currentColor = modal.querySelector(".color-dot.active") || modal.querySelector(".color-dot");
    
    // Update modal content
    document.getElementById("modal-product-name").textContent = name;
    document.getElementById("modal-price").textContent = price;
    
    // Update wishlist button data attributes
    const wishlistBtn = document.getElementById("modal-wishlist-btn");
    wishlistBtn.dataset.name = name;
    if (currentColor) {
        wishlistBtn.dataset.color = currentColor.style.backgroundColor;
    }

    // Check if item is in wishlist and update icon
    const isInWishlist = window.wishlist.some(item => 
        item.name === name && 
        (!item.color || !currentColor || item.color === currentColor.style.backgroundColor)
    );
    const icon = wishlistBtn.querySelector('.material-symbols-outlined');
    icon.textContent = isInWishlist ? 'favorite' : 'favorite_border';
  }

  document.getElementById("modal-wishlist-btn").addEventListener("click", (e) => {
    const modal = document.getElementById("product-modal");
    const currentColor = modal.querySelector(".color-dot.active") || modal.querySelector(".color-dot");
    
    const product = {
        name: document.getElementById("modal-product-name").textContent,
        price: document.getElementById("modal-price").textContent,
        image: document.getElementById("modal-guitar-image").src,
        color: currentColor ? currentColor.style.backgroundColor : '',
        colorName: currentColor ? getColorName(currentColor.style.backgroundColor) : 'Default'
    };

    // Toggle wishlist and update UI
    window.toggleWishlist(product);
    
    // Update button state
    const icon = e.currentTarget.querySelector('.material-symbols-outlined');
    icon.textContent = window.wishlist.some(item => 
        item.name === product.name && 
        item.color === product.color
    ) ? 'favorite' : 'favorite_border';
  });

  // Add event listener for modal wishlist button
  document.getElementById('modal-wishlist-btn')?.addEventListener('click', (e) => {
    const product = JSON.parse(e.target.closest('.wishlist-btn').dataset.product);
    toggleWishlist(product);
  });
});

//Gets the color name for the order
function getColorName(colorHex) {
    const colorMap = {
        'rgb(226, 212, 183)': 'Olympic White',
        'rgb(13, 22, 26)': 'Dark Night',
        'rgb(160, 1, 25)': 'Crimson Transparent',
        'rgb(90, 92, 91)': 'Stone Grey',
        'rgb(111, 142, 137)': 'Stone Blue',
        'rgb(34, 34, 34)': 'Black',
        'rgb(223, 194, 118)': 'Moon White',
        'rgb(205, 227, 238)': 'Daphne Blue',
        'rgb(34, 78, 111)': 'Lake Placid Blue',
        'rgb(241, 159, 99)': 'Solid Spruce',
        'rgb(209, 169, 114)': 'Solid Spruce with VTS',
        'rgb(152, 96, 39)': 'Solid Roasted Spruce',
        'rgb(5, 5, 5)': 'Solid Cedar',
        'rgb(204, 164, 95)': 'Vintage White',
        'rgb(179, 158, 112)': 'Champagne Gold',
        'rgb(213, 167, 92)': 'Natural, High Gloss'
    };
    
    // Convert hex to rgb if needed
    return colorMap[colorHex] || 'Default';
}

// Optional: flip button
const imageWrapper = document.getElementById("modal-image-wrapper");
document.getElementById("flip-toggle-btn")?.addEventListener("click", () => {
    imageWrapper?.classList.toggle("flipped");
});

function showNotification(message) {
    const notification = document.getElementById('notification');
    
    // Clear any existing timeout
    if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
    }
    
    // Set message and show
    notification.textContent = message;
    notification.classList.add('show');

    // Hide after 2 seconds
    notification.timeoutId = setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}


