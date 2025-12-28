const crypto = require('crypto');

const secretKey = crypto.randomBytes(32).toString('hex'); // 32 bytes = 256 bits

console.log('🔐 Your Signature Key:', secretKey);
