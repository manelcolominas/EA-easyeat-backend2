import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URI || '';
const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337;

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    },
    jwt: {
        accessSecret:     process.env.JWT_SECRET         || 'cce788eebd26d18a40e2f414c69692bb9bdedd9fc3438d92e52915359abe8d59',
        refreshSecret:    process.env.JWT_REFRESH_SECRET || '9a23ae4899d12aa77c66240a3b4a058f935e3634d06a72a4311e7d290274c121',
        accessExpiresIn:  process.env.JWT_ACCESS_EXPIRES_IN  || '1d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    cookies: {
        refreshName: 'refreshToken',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        options: {
            httpOnly: true,
            secure:   process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path:     '/'
        }
    }
};
