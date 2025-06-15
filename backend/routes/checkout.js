const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
// REMOVED: require('dotenv').config(); // This should only be in server.js

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/checkout/create-session
router.post('/create-session', async (req, res) => {
    const { cartItems } = req.body;

    // Basic validation for the cartItems array itself
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ message: "Invalid or empty cart items provided." });
    }

    let line_items = [];
    try {
        // Validate and map each item individually
        for (const item of cartItems) {
            // More robust validation
            if (!item.title || typeof item.title !== 'string' || item.title.trim() === '') {
                return res.status(400).json({ message: `Invalid product title found in cart item. Title: '${item.title}'` });
            }
            if (isNaN(item.price) || item.price <= 0) {
                return res.status(400).json({ message: `Invalid price for item '${item.title}'. Price must be a positive number.` });
            }
            if (isNaN(item.quantity) || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
                return res.status(400).json({ message: `Invalid quantity for item '${item.title}'. Quantity must be a positive integer.` });
            }

            line_items.push({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.title,
                    },
                    unit_amount: Math.round(item.price * 100), // Ensure integer price in smallest unit
                },
                quantity: item.quantity,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items, // Use the validated line_items
            success_url: "http://127.0.0.1:5500/public/success.html",
            cancel_url: "http://127.0.0.1:5500/public/cancel.html",
              // Consider environment variables for production
        });

        res.json({ id: session.id });

    } catch (error) {
        // This catch block will primarily handle Stripe API errors or unexpected server issues
        console.error("Stripe Checkout Session Creation Error:", error);
        res.status(500).json({ message: "Failed to create checkout session due to a server error. Please try again later." });
    }
});

module.exports = router;