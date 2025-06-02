import { supabaseClient, supabaseConfig } from './config.js';
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


const supabase = createClient(supabaseConfig.url, supabaseConfig.key);

document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    const authModal = document.getElementById("auth-modal");
    const registerModal = document.getElementById("register-modal");
    const closeModal = document.getElementById("close-modal");
    const closeRegisterModal = document.getElementById("close-register-modal");
    const authEmail = document.getElementById("auth-email");
    const authPassword = document.getElementById("auth-password");
    const authSubmit = document.getElementById("auth-submit");
    const authMessage = document.getElementById("auth-message");
    const signupToggle = document.getElementById("signup-toggle");
    const loginToggle = document.getElementById("login-toggle");
    const loginTrigger = document.getElementById("login-trigger");
    const userEmail = document.getElementById("user-email");
    const logoutBtn = document.getElementById("logout-btn");
    const accountDropdown = document.querySelector(".account-dropdown");
    const accountTrigger = document.querySelector(".account-trigger");

    // Toggle password visibility
    const togglePassword = document.querySelector(".toggle-password");
    togglePassword?.addEventListener("click", () => {
        const pw = document.getElementById("auth-password");
        const icon = togglePassword.querySelector(".material-symbols-outlined");
        pw.type = pw.type === "password" ? "text" : "password";
        icon.textContent = pw.type === "password" ? "visibility" : "visibility_off";
    });

    // Login modal controls
    loginTrigger?.addEventListener("click", () => {
        authModal.classList.remove("hidden");
        accountDropdown.classList.add("hidden");
    });

    closeModal?.addEventListener("click", () => {
        authModal.classList.add("hidden");
        authMessage.textContent = "";
        authMessage.classList.remove("error-message");
    });

    // Modal toggle handlers
    signupToggle?.addEventListener("click", () => {
        authModal.classList.add("hidden");
        registerModal.classList.remove("hidden");
    });

    loginToggle?.addEventListener("click", () => {
        registerModal.classList.add("hidden");
        authModal.classList.remove("hidden");
    });

    // Handle login submission
    authSubmit?.addEventListener("click", async (e) => {
        e.preventDefault();
        const email = authEmail.value.trim();
        const password = authPassword.value.trim();

        if (!email || !password) {
            authMessage.textContent = "Please fill in all fields";
            authMessage.classList.add("error-message");
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Update UI
            userEmail.textContent = `Welcome back, ${email}!`;
            loginTrigger.classList.add("hidden");
            logoutBtn.classList.remove("hidden");

            // Clear form and close modal
            authEmail.value = "";
            authPassword.value = "";
            authModal.classList.add("hidden");
            authMessage.textContent = "";

            // Show success notification
            showNotification("Successfully logged in!");

            // Update wishlist UI if exists
            if (typeof updateWishlistUI === "function") {
                updateWishlistUI();
            }
        } catch (error) {
            authMessage.textContent = error.message;
            authMessage.classList.add("error-message");
        }
    });

    // Handle logout
    logoutBtn?.addEventListener("click", async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            userEmail.textContent = "Not logged in";
            loginTrigger.classList.remove("hidden");
            logoutBtn.classList.add("hidden");
            accountDropdown.classList.add("hidden");

            showNotification("Successfully logged out!");

            // Update wishlist UI if exists
            if (typeof updateWishlistUI === "function") {
                updateWishlistUI();
            }
        } catch (error) {
            console.error('Error logging out:', error);
            showNotification("Error logging out");
        }
    });

    // Account dropdown toggle
    if (accountTrigger && accountDropdown) {
        // Toggle dropdown on account icon click
        accountTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            accountDropdown.classList.toggle("hidden");
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!accountDropdown.contains(e.target) && !accountTrigger.contains(e.target)) {
                accountDropdown.classList.add("hidden");
            }
        });

        // Prevent dropdown from closing when clicking inside
        accountDropdown.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

    // Login trigger handler
    loginTrigger?.addEventListener("click", () => {
        authModal.classList.remove("hidden");
        accountDropdown.classList.add("hidden");
    });

    // Show notification helper function
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

    // Initialize login state
    async function initializeLoginState() {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            userEmail.textContent = `Welcome back, ${user.email}!`;
            loginTrigger.classList.add("hidden");
            logoutBtn.classList.remove("hidden");
        }
    }

    // Initialize on page load
    initializeLoginState();

    // Close register modal button functionality
    const closeRegisterBtn = document.getElementById('close-register-modal');
    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', function() {
            registerModal.classList.add('hidden');
        });
    }
});
