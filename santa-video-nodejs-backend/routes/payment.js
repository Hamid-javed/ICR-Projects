const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Create payment intent
router.post("/create-intent", paymentController.createPaymentIntent);

// Handle Netopia webhook notifications
router.post("/webhook", express.raw({ type: "application/json" }), paymentController.handleWebhook);

// Check payment status
router.get("/status/:orderId", paymentController.checkPaymentStatus);

// Refund payment
router.post("/refund/:orderId", paymentController.refundPayment);

// Legacy route support (backwards compatibility)
router.post("/create", paymentController.createPaymentIntent);
router.post("/notification", express.raw({ type: "application/json" }), paymentController.handleWebhook);

module.exports = router;
