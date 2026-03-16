import { registerAs } from '@nestjs/config';

type JwtConfig = {
  secret: string;
  signOptions: {
    expiresIn: number;
  };
};

export default registerAs('jwt', (): JwtConfig => {
  return {
    secret: process.env.JWT_SECRET as string,
    signOptions: {
      expiresIn: Number(process.env.JWT_TOKEN_EXPIRATION_TIME) || 3600,
    },
  };
});
