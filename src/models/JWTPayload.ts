// https://nozzlegear.com/blog/implementing-a-jwt-auth-system-with-typescript-and-node

export interface IJwtPayload {
    id: string;
    name: string;
    email: string;
    role: string;
    type: 'access' | 'refresh';
    restaurant_id?: string;
}