import crypto from 'node:crypto';
import { ENCRYPTION_KEY } from '../../../config/config.service.js';

const key = Buffer.from(ENCRYPTION_KEY, 'hex');

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (encryptedText) => {
  const [ivHex, data] = encryptedText.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    key,
    Buffer.from(ivHex, 'hex')
  );
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};