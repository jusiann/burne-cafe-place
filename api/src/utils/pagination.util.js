export const getPaginationOptions = (query, maxLimit = 100) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || (maxLimit === 1000 ? 100 : 10);
    
    if (page < 1) throw new Error('page must be a positive integer.');
    if (limit < 1 || limit > maxLimit) throw new Error(`limit must be between 1 and ${maxLimit}.`);
    
    const offset = (page - 1) * limit;
    
    return { page, limit, offset };
};

export const getPaginationResult = (totalCount, page, limit) => {
    return {
        page,
        limit,
        total_count: totalCount,
        total_pages: Math.ceil(totalCount / limit),
    };
};
