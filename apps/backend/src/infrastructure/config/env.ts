import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  validateSync,
} from 'class-validator';

export class Env {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: 'development' | 'production' | 'test' = 'development';

  @IsInt()
  @Min(1)
  PORT = 3001;

  @IsString()
  DATABASE_URL!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  CORS_ORIGIN?: string;
}

export function validateEnv(config: Record<string, unknown>): Env {
  const port = Number(config.PORT);
  const corsOrigin =
    typeof config.CORS_ORIGIN === 'string'
      ? config.CORS_ORIGIN.trim().replace(/\/+$/, '')
      : config.CORS_ORIGIN;

  const parsed = plainToInstance(
    Env,
    {
      ...config,
      CORS_ORIGIN: corsOrigin,
      PORT: Number.isInteger(port) && port >= 1 ? port : 3001,
    },
    {
      enableImplicitConversion: true,
      exposeDefaultValues: true,
    },
  );
  const errors = validateSync(parsed, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const details = errors
      .flatMap((error) => Object.values(error.constraints ?? {}))
      .join('; ');

    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return parsed;
}
