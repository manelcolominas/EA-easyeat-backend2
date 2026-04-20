export interface PaginationOptions {
    page: number;
    limit: number;
    skip: number;
}

export const getPaginationOptions = (query: any): PaginationOptions => {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit as string) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};
