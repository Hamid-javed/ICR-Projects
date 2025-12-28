const request = require('supertest');
const app = require('../index');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Mock Netopia for testing
jest.mock('netopia-card', () => ({
  Netopia: jest.fn().mockImplementation(() => ({
    createTransaction: jest.fn().mockResolvedValue({
      paymentUrl: 'https://secure.netopia-payments.com/payment/test-url'
    }),
    verifyNotification: jest.fn().mockReturnValue({ success: true }),
    refundTransaction: jest.fn().mockResolvedValue({
      success: true,
      refundId: 'refund_123'
    })
  }))
}));

describe('Netopia Payment Integration', () => {
  let testOrder;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/santa-video-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    // Clean up and close database connection
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Create a test order
    testOrder = new Order({
      videoId: 'test-order-123',
      videoUrl: 'https://example.com/test-video.mp4',
      childName: 'Test Child',
      parentEmail: 'test@example.com',
      template: {
        id: 'template1',
        name: 'Christmas Template'
      },
      scripts: [{
        id: 'script1',
        category: 'greeting',
        text: 'Hello Test Child!'
      }],
      photos: 2,
      hasLetter: true,
      payment: {
        amount: 40.00,
        currency: 'RON',
        status: 'pending'
      }
    });
    await testOrder.save();
  });

  afterEach(async () => {
    // Clean up test data
    await Order.deleteMany({});
  });

  describe('POST /api/payment/create-intent', () => {
    it('should create a payment intent successfully', async () => {
      const paymentData = {
        amount: 40.00,
        orderId: 'test-order-123',
        customerEmail: 'test@example.com',
        customerName: 'Test Parent'
      };

      const response = await request(app)
        .post('/api/payment/create-intent')
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.paymentUrl).toContain('netopia-payments.com');
      expect(response.body.amount).toBe(40.00);
      expect(response.body.currency).toBe('RON');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/payment/create-intent')
        .send({ amount: 40.00 }) // Missing orderId
        .expect(400);

      expect(response.body.error).toBe('Amount and Order ID are required');
      expect(response.body.code).toBe('MISSING_REQUIRED_FIELDS');
    });

    it('should return 404 for non-existent order', async () => {
      const paymentData = {
        amount: 40.00,
        orderId: 'non-existent-order',
        customerEmail: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/payment/create-intent')
        .send(paymentData)
        .expect(404);

      expect(response.body.error).toBe('Order not found');
      expect(response.body.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('POST /api/payment/webhook', () => {
    it('should process successful payment webhook', async () => {
      const webhookData = {
        orderID: 'test-order-123',
        status: 'confirmed',
        transactionId: 'txn_123456',
        amount: 40.00,
        currency: 'RON'
      };

      const payload = JSON.stringify(webhookData);
      const signature = crypto.createHmac('sha1', process.env.NETOPIA_SIGNATURE_KEY).update(payload).digest('hex');

      const response = await request(app)
        .post('/api/payment/webhook')
        .set('x-netopia-signature', signature)
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('confirmed');

      // Check that order was updated
      const updatedOrder = await Order.findOne({ videoId: 'test-order-123' });
      expect(updatedOrder.payment.status).toBe('confirmed');
      expect(updatedOrder.payment.paidAt).toBeDefined();
    });

    it('should handle cancelled payment webhook', async () => {
      const webhookData = {
        orderID: 'test-order-123',
        status: 'cancelled',
        transactionId: 'txn_123456'
      };

      const payload = JSON.stringify(webhookData);
      const signature = crypto.createHmac('sha1', process.env.NETOPIA_SIGNATURE_KEY).update(payload).digest('hex');

      const response = await request(app)
        .post('/api/payment/webhook')
        .set('x-netopia-signature', signature)
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('cancelled');

      // Check that order was updated
      const updatedOrder = await Order.findOne({ videoId: 'test-order-123' });
      expect(updatedOrder.payment.status).toBe('cancelled');
    });
  });

  describe('GET /api/payment/status/:orderId', () => {
    it('should return payment status for existing order', async () => {
      const response = await request(app)
        .get('/api/payment/status/test-order-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orderId).toBe('test-order-123');
      expect(response.body.payment.status).toBe('pending');
      expect(response.body.payment.amount).toBe(40.00);
      expect(response.body.payment.currency).toBe('RON');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/payment/status/non-existent-order')
        .expect(404);

      expect(response.body.error).toBe('Order not found');
      expect(response.body.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('POST /api/payment/refund/:orderId', () => {
    beforeEach(async () => {
      // Set order as paid for refund tests
      testOrder.payment.status = 'confirmed';
      testOrder.payment.paidAt = new Date();
      testOrder.payment.transactionId = 'txn_123456';
      await testOrder.save();
    });

    it('should process refund for paid order', async () => {
      const refundData = {
        reason: 'Customer request'
      };

      const response = await request(app)
        .post('/api/payment/refund/test-order-123')
        .send(refundData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Refund processed successfully');

      // Check that order status was updated
      const updatedOrder = await Order.findOne({ videoId: 'test-order-123' });
      expect(updatedOrder.payment.status).toBe('refunded');
    });

    it('should return 400 for unpaid order refund attempt', async () => {
      // Reset order to pending
      testOrder.payment.status = 'pending';
      testOrder.payment.paidAt = null;
      await testOrder.save();

      const response = await request(app)
        .post('/api/payment/refund/test-order-123')
        .send({ reason: 'Test' })
        .expect(400);

      expect(response.body.error).toBe('Cannot refund unpaid order');
      expect(response.body.code).toBe('INVALID_PAYMENT_STATUS');
    });
  });
});

// Integration test for payment flow
describe('Complete Payment Flow Integration', () => {
  let testOrder;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/santa-video-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    testOrder = new Order({
      videoId: 'integration-test-456',
      videoUrl: 'https://example.com/test-video.mp4',
      childName: 'Integration Test Child',
      parentEmail: 'integration@test.com',
      template: {
        id: 'template1',
        name: 'Christmas Template'
      },
      scripts: [{
        id: 'script1',
        category: 'greeting',
        text: 'Hello Integration Test!'
      }],
      photos: 1,
      hasLetter: false,
      payment: {
        amount: 30.00,
        currency: 'RON',
        status: 'pending'
      }
    });
    await testOrder.save();
  });

  afterEach(async () => {
    await Order.deleteMany({});
  });

  it('should handle complete payment flow: create -> pay -> confirm', async () => {
    // Step 1: Create payment intent
    const paymentData = {
      amount: 30.00,
      orderId: 'integration-test-456',
      customerEmail: 'integration@test.com'
    };

    const createResponse = await request(app)
      .post('/api/payment/create-intent')
      .send(paymentData)
      .expect(200);

    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.paymentUrl).toBeDefined();

    // Step 2: Simulate successful payment webhook
    const webhookData = {
      orderID: 'integration-test-456',
      status: 'confirmed',
      transactionId: createResponse.body.transactionId,
      amount: 30.00,
      currency: 'RON'
    };

    const payload = JSON.stringify(webhookData);
    const signature = crypto.createHmac('sha1', process.env.NETOPIA_SIGNATURE_KEY).update(payload).digest('hex');

    const webhookResponse = await request(app)
      .post('/api/payment/webhook')
      .set('x-netopia-signature', signature)
      .send(webhookData)
      .expect(200);

    expect(webhookResponse.body.success).toBe(true);
    expect(webhookResponse.body.status).toBe('confirmed');

    // Step 3: Verify payment status
    const statusResponse = await request(app)
      .get('/api/payment/status/integration-test-456')
      .expect(200);

    expect(statusResponse.body.payment.status).toBe('confirmed');
    expect(statusResponse.body.payment.paidAt).toBeDefined();
  });
});
