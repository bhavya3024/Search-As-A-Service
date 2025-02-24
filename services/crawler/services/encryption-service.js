const crypto = require('crypto');

class EncryptionService {
  constructor() {
    // Get encryption key from environment variables
    const rawKey = process.env.ENCRYPTION_KEY;
    if (!rawKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    // Create a 32-byte key using SHA-256
    this.encryptionKey = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest();

    // Use a fixed IV length
    this.IV_LENGTH = 16;
  }

  encrypt(text) {
    if (!text) return text;
    
    try {
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipheriv(
        'aes-256-cbc', 
        this.encryptionKey,
        iv
      );
      
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(text) {
    if (!text) return text;
    
    try {
      const [ivHex, encryptedHex] = text.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc', 
        this.encryptionKey,
        iv
      );
      
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString();
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

module.exports = new EncryptionService(); 