import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET as string,
    tokenAudience: process.env.JWT_TOKEN_AUDIENCE as string,
    tokenIssuer: process.env.JWT_TOKEN_ISSUER as string,
    tokenExpirationTime:
      parseInt(process.env.JWT_TOKEN_EXPIRATION_TIME as string, 10) || 3600,
  };
});
