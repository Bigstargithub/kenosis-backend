import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(password, hashedPassword);
};

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);

export class CryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = crypto.randomBytes(32);

  encrypt(phone: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(phone, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encrypted: string) {
    const [ivHex, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: { id: number; email: string }) {
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }

  refreshToken(payload: { token: string }) {
    return this.jwtService.sign(payload, {
      expiresIn: '1week',
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }
}
