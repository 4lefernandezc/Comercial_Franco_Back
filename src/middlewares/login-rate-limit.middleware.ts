import { Injectable, NestMiddleware } from '@nestjs/common';
import rateLimit from 'express-rate-limit';

@Injectable()
export class LoginRateLimitMiddleware implements NestMiddleware {
  private limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // Máximo 50 intentos en la ventana de tiempo
    message: {
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Has excedido el número de intentos permitidos. Intenta de nuevo más tarde.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  use(req: any, res: any, next: () => void) {
    this.limiter(req, res, next);
  }
}
