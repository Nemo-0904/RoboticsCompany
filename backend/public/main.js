// frontend/js/main.js
const API_BASE_URL = "https://roboticco.onrender.com"; 
const stripePublicKey = "pk_test_51RZsGyQnckO6Q134MosfGqEbDUtkbdWVlFE7mwP4HhO6tPg1O71WUYpfjxmxsSw2EOb1wzTTU8uw7xYk47ZtEy004vgMC544"; 

document.addEventListener("DOMContentLoaded", () => {
    // --- Global Cart Variable ---
    let cart = []; 
    const showCartButton = document.getElementById("show-cart");
    const cartCountSpan = document.getElementById("cart-count");
    const cartModal = document.getElementById("cart-modal");
    const cartItemsList = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const buyNowBtn = document.getElementById("buy-now-btn");

    const productsContainer = document.getElementById("products-container");


    /**
     * Updates the count of items displayed next to the cart icon.
     */
    function updateCartCount() {
        const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountSpan) {
            cartCountSpan.innerText = `(${totalItemsInCart})`;
        }
    }

    /**
     * Displays or updates the cart modal with current cart items and total.
     */
    function showCart() {
        if (!cartItemsList || !cartTotalSpan || !cartModal) return;

        cartItemsList.innerHTML = ""; 
        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = "<li>Your cart is empty.</li>";
            cartTotalSpan.innerText = "0"; 
            buyNowBtn.disabled = true; // Disable buy now if cart is empty
            cartModal.style.display = "block"; 
            return;
        }

        buyNowBtn.disabled = false; // Enable buy now if cart has items

        cart.forEach((item, index) => {
            const listItem = document.createElement("li");
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            listItem.innerHTML = `
                <span>${item.title} × ${item.quantity} - ₹${itemTotal.toLocaleString("en-IN")}</span>
                <button class="remove-item-btn" data-index="${index}">Remove</button>
            `;
            cartItemsList.appendChild(listItem);
        });

        cartTotalSpan.innerText = total.toLocaleString("en-IN");
        cartModal.style.display = "block"; 

        cartItemsList.querySelectorAll(".remove-item-btn").forEach((removeBtn) => {
            removeBtn.addEventListener("click", (e) => {
                const indexToRemove = parseInt(e.target.dataset.index);
                cart.splice(indexToRemove, 1); 
                updateCartCount(); 
                showCart(); 
            });
        });
    }

    // This function needs to be globally accessible for `onclick="closeCart()"` in HTML
    window.closeCart = function () {
        if (cartModal) {
            cartModal.style.display = "none"; 
        }
    };

    /**
     * Handles login form submission.
     */
    const loginForm = document.querySelector('form[action="/login"]');
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = loginForm.email.value.trim();
            const password = loginForm.password.value.trim();

            if (!email || !password || !email.includes("@")) {
                alert("Login Error: Please enter valid credentials.");
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Something went wrong during login.");
                } else {
                    alert("Login successful!");
                    localStorage.setItem("token", data.token); 
                    window.location.href = "index.html"; 
                }
            } catch (err) {
                console.error("Login Error:", err);
                alert("Login error occurred. Please try again.");
            }
        });
    }

    /**
     * Handles signup form submission.
     */
    const signupForm = document.querySelector('form[action="/signup"]');
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = signupForm.name.value.trim();
            const email = signupForm.email.value.trim();
            const password = signupForm.password.value.trim();

            if (!name || !email || !password || !email.includes("@") || password.length < 6) {
                alert("Signup Error: Please enter valid input (name, valid email, password >= 6 chars).");
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert("Signup failed: " + (data.message || "Something went wrong."));
                } else {
                    alert("Signup successful!");
                    localStorage.setItem("token", data.token); 
                    window.location.href = "login.html"; 
                }
            } catch (err) {
                console.error("Signup Error:", err);
                alert("Signup error occurred. Please try again.");
            }
        });
    }

    // --- Password Toggle Functionality ---

    /**
     * Toggles password visibility for an input field.
     * @param {string} toggleId The ID of the toggle button/span.
     * @param {string} inputId The ID of the password input field.
     */
    const togglePasswordVisibility = (toggleId, inputId) => {
        const toggleBtn = document.getElementById(toggleId);
        const inputField = document.getElementById(inputId);

        if (toggleBtn && inputField) {
            toggleBtn.addEventListener("click", () => {
                const type = inputField.getAttribute("type") === "password" ? "text" : "password";
                inputField.setAttribute("type", type);

                const icon = toggleBtn.querySelector("i");
                if (icon) {
                    icon.classList.toggle("fa-eye");
                    icon.classList.toggle("fa-eye-slash");
                }
            });
        }
    };

    // Apply toggle to login and signup forms
    togglePasswordVisibility("password-toggle", "password"); 
    togglePasswordVisibility("signup-password-toggle", "signup-password"); 

    /**
     * Attaches event listeners to all "Add to Cart" buttons.
     */
    function attachAddToCartListeners() {
        document.querySelectorAll(".masonry-item button").forEach((btn) => {
            btn.addEventListener("click", () => {
                const productCard = btn.closest(".masonry-item");
                const title = productCard.querySelector("h3").innerText.trim();
                // Ensure you target the correct span element that holds the price
                const priceText = productCard.querySelector(".price").innerText.trim(); 
                const price = parseFloat(priceText.replace("₹", "").replace(/,/g, ""));
                const id = btn.dataset.productId;

                const existingItem = cart.find((item) => item.id === id);

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ id, title, price, quantity: 1 });
                }

                updateCartCount(); 
                if (showCartButton) {
                    showCartButton.click(); 
                }
            });
        });
    }

    /**
     * Fetches products from the backend API and renders them.
     * This function should be called on products.html page load.
     */
    async function fetchProducts() {
        if (!productsContainer) return; 

        try {
            const res = await fetch(`${API_BASE_URL}/api/products`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const products = await res.json();
            
            productsContainer.innerHTML = ''; // Clear existing hardcoded products if any

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('masonry-item');
                productCard.innerHTML = `
                    <img src="images/robot1.jpg" alt="${product.title}" /> 
                    <h3>${product.title}</h3>
                    <p>Product description for ${product.title} goes here.</p>
                    <span class="price">₹${product.price.toLocaleString("en-IN")}</span>
                    <button data-product-id="${product._id}">Add to Cart</button>
                `;
                productsContainer.appendChild(productCard);
            });

            attachAddToCartListeners(); // Attach event listeners after products are loaded

        } catch (error) {
            console.error("Failed to fetch products:", error);
            productsContainer.innerHTML = '<p>Failed to load products. Please try again later.</p>';
        }
    }


    // --- Event Listeners for Cart Interaction ---

    // Navbar "Show Cart" link
    if (showCartButton) {
        showCartButton.addEventListener("click", (e) => {
            e.preventDefault(); 
            showCart(); 
        });
    }

    if (buyNowBtn) {
        buyNowBtn.addEventListener("click", async () => {
            if (cart.length === 0) {
                alert("Your cart is empty. Please add items before proceeding to checkout.");
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in to proceed with the payment.");
                window.location.href = "login.html"; 
                return;
            }

            try {
                // *** CRITICAL FIX: Updated endpoint to include /payment ***
                const res = await fetch(`${API_BASE_URL}/api/payment/create-checkout-session`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify({ cartItems: cart })
                });

                if (!res.ok) {
                    let errorMessage = res.statusText;
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await res.json();
                        errorMessage = errorData.message || errorMessage;
                    } else {
                        errorMessage = await res.text(); 
                    }
                    throw new Error(errorMessage);
                }

                const data = await res.json();

                const stripe = Stripe(stripePublicKey);
                const { error } = await stripe.redirectToCheckout({
                    sessionId: data.id
                });

                if (error) {
                    throw new Error(error.message);
                }

            } catch (error) {
                console.error("Payment Error:", error);
                alert("Payment initiation failed: " + error.message);
            }
        });
    }

    // --- Initializations on Page Load ---
    updateCartCount();
    // Only fetch products and attach listeners if on products.html
    if (window.location.pathname.includes('products.html')) {
        fetchProducts();
    } else {
        // If not on products page, but on a page like index.html that might have 'add to cart' buttons,
        // attach listeners to those static elements if present.
        attachAddToCartListeners(); 
    }
});