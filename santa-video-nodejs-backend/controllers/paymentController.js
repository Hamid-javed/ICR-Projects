const { Netopia } = require('netopia-card');
const Order = require('../models/Order');
const crypto = require('crypto');

// Validate required environment variables
if (!process.env.NETOPIA_API_KEY) {
  throw new Error('NETOPIA_API_KEY environment variable is required');
}

if (!process.env.NETOPIA_SIGNATURE_KEY) {
  throw new Error('NETOPIA_SIGNATURE_KEY environment variable is required');
}

// Initialize Netopia
const netopia = new Netopia({
  apiKey: process.env.NETOPIA_API_KEY,
  sandbox: process.env.NODE_ENV !== 'production', // Auto-detect environment
  signatureKey: process.env.NETOPIA_SIGNATURE_KEY
});

const paymentController = {
  // Create payment intent and update order
  createPaymentIntent: async (req, res) => {
    try {
      const {
        amount,
        orderId,
        customerEmail,
        customerName,
        returnUrl,
        cancelUrl
      } = req.body;

      // Validate required fields
      if (!amount || !orderId) {
        return res.status(400).json({
          error: 'Amount and Order ID are required',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      // Find the order
      const order = await Order.findOne({ videoId: orderId });
      if (!order) {
        return res.status(404).json({
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        });
      }

      // Check if payment is already completed
      if (order.payment.status === 'confirmed') {
        return res.status(400).json({
          error: 'Payment already completed for this order',
          code: 'PAYMENT_ALREADY_COMPLETED'
        });
      }

      // Generate unique transaction ID
      const transactionId = `txn_${orderId}_${Date.now()}`;

      // Create Netopia payment request
      const paymentData = {
        order: {
          ntpID: transactionId,
          posSignature: transactionId,
          dateTime: new Date().toISOString(),
          description: `Santa Video Order - ${order.childName}`,
          orderID: orderId,
          amount: parseFloat(amount),
          currency: 'RON'
        },
        account: {
          id: process.env.NETOPIA_ACCOUNT_ID || 'default',
          user_name: customerName || order.childName,
          email: customerEmail || order.parentEmail
        },
        url: {
          confirm: returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
          cancel: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`
        }
      };

      const paymentRequest = await netopia.createTransaction(paymentData);

      // Update order with payment info
      order.payment = {
        ...order.payment,
        status: 'pending',
        provider: 'netopia',
        transactionId: transactionId,
        amount: parseFloat(amount),
        currency: 'RON'
      };
      await order.save();

      res.json({
        success: true,
        paymentUrl: paymentRequest.paymentUrl,
        transactionId: transactionId,
        orderId: orderId,
        amount: amount,
        currency: 'RON'
      });

    } catch (error) {
      console.error('Netopia payment creation error:', error);
      res.status(500).json({
        error: 'Failed to create payment',
        message: error.message,
        code: 'PAYMENT_CREATION_FAILED'
      });
    }
  },

  // Handle Netopia webhook notifications
  handleWebhook: async (req, res) => {
    try {
      console.log('Netopia webhook received:', req.body);

      // Verify the webhook signature
      const signature = req.headers['x-netopia-signature'];
      const payload = JSON.stringify(req.body);

      const expectedSignature = crypto
        .createHmac('sha1', process.env.NETOPIA_SIGNATURE_KEY)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const { orderID, status, transactionId, amount, currency } = req.body;

      // Find and update the order
      const order = await Order.findOne({ videoId: orderID });
      if (!order) {
        console.error('Order not found for webhook:', orderID);
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update payment status based on Netopia status
      let paymentStatus;
      switch (status?.toLowerCase()) {
        case 'confirmed':
        case 'paid':
        case 'success':
          paymentStatus = 'confirmed';
          break;
        case 'cancelled':
        case 'canceled':
          paymentStatus = 'cancelled';
          break;
        case 'failed':
        case 'error':
          paymentStatus = 'failed';
          break;
        default:
          paymentStatus = 'pending';
      }

      // Update order payment info
      order.payment.status = paymentStatus;
      if (paymentStatus === 'confirmed') {
        order.payment.paidAt = new Date();
      }
      if (transactionId) {
        order.payment.transactionId = transactionId;
      }

      await order.save();

      console.log(`Payment ${paymentStatus} for order ${orderID}`);

      res.json({
        success: true,
        message: 'Webhook processed successfully',
        orderID,
        status: paymentStatus
      });

    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({
        error: 'Webhook processing failed',
        message: error.message
      });
    }
  },

  // Check payment status
  checkPaymentStatus: async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findOne({ videoId: orderId });
      if (!order) {
        return res.status(404).json({
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        orderId,
        payment: {
          status: order.payment.status,
          amount: order.payment.amount,
          currency: order.payment.currency,
          transactionId: order.payment.transactionId,
          paidAt: order.payment.paidAt,
          provider: order.payment.provider
        }
      });

    } catch (error) {
      console.error('Payment status check error:', error);
      res.status(500).json({
        error: 'Failed to check payment status',
        message: error.message
      });
    }
  },

  // Refund payment (if supported by Netopia)
  refundPayment: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      const order = await Order.findOne({ videoId: orderId });
      if (!order) {
        return res.status(404).json({
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        });
      }

      if (order.payment.status !== 'confirmed') {
        return res.status(400).json({
          error: 'Cannot refund unpaid order',
          code: 'INVALID_PAYMENT_STATUS'
        });
      }

      // Attempt refund through Netopia
      try {
        const refundResult = await netopia.refundTransaction({
          transactionId: order.payment.transactionId,
          amount: order.payment.amount,
          reason: reason || 'Customer request'
        });

        if (refundResult.success) {
          order.payment.status = 'refunded';
          await order.save();

          res.json({
            success: true,
            message: 'Refund processed successfully',
            refundId: refundResult.refundId
          });
        } else {
          res.status(400).json({
            error: 'Refund failed',
            message: refundResult.message
          });
        }
      } catch (refundError) {
        console.error('Refund error:', refundError);
        res.status(500).json({
          error: 'Refund processing failed',
          message: 'Please contact support for manual refund'
        });
      }

    } catch (error) {
      console.error('Refund request error:', error);
      res.status(500).json({
        error: 'Failed to process refund request',
        message: error.message
      });
    }
  }
};

module.exports = paymentController;
