import { plainToInstance, Transform } from 'class-transformer';
import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    validateSync,
} from 'class-validator';

export enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables {
    @IsEnum(Environment)
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase();
        }
        return Environment.Development;
    })
    NODE_ENV: Environment = Environment.Development;

    @IsNumber()
    PORT!: number;

    @IsString()
    DATABASE_URL!: string;

    @IsString()
    CLIENT_URL!: string;

    @IsString()
    JWT_ACCESS_SECRET!: string;

    @IsString()
    JWT_REFRESH_SECRET!: string;

    @IsOptional()
    @IsString()
    JWT_ACCESS_TTL?: string;

    @IsOptional()
    @IsString()
    JWT_REFRESH_TTL?: string;
}

export function validateEnv(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
